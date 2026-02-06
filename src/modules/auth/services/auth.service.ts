import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/user.repository';
import { TenantService } from '@modules/tenant/services/tenant.service';
import { RegisterDto, LoginDto } from '../dtos';
import { UserDocument, UserStatus } from '../entities/user.entity';
import { UserRole } from '@common/types';
import { CodeGeneratorUtil } from '@common/utils';
import { EmailService } from '@infrastructure/notifications';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: Partial<UserDocument>;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tenantService: TenantService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    // Verify join code and get tenant
    const tenant = await this.tenantService.findByJoinCode(registerDto.joinCode);

    // Normalize email to lowercase
    const normalizedEmail = registerDto.email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(
      normalizedEmail,
      tenant._id.toString(),
    );

    if (existingUser) {
      throw new ConflictException('User already exists in this church');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Generate email verification code
    const emailVerificationCode = CodeGeneratorUtil.generateVerificationCode();

    // Create user
    const user = await this.userRepository.create({
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      email: normalizedEmail,
      phone: registerDto.phone,
      password: hashedPassword,
      tenantId: tenant._id,
      role: UserRole.MEMBER,
      status: UserStatus.PENDING_VERIFICATION,
      emailVerified: false,
      phoneVerified: false,
      emailVerificationCode,
      deviceTokens: [],
    } as any);

    // Increment tenant member count
    await this.tenantService.incrementMemberCount(tenant._id.toString());

    // Send verification email
    await this.emailService.sendVerificationEmail(user.email, emailVerificationCode);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Save refresh token
    await this.userRepository.update(user._id.toString(), {
      refreshToken: tokens.refreshToken,
    } as any);

    return {
      ...tokens,
      user: this.sanitizeUser(user),
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    // Normalize email
    const normalizedEmail = loginDto.email.toLowerCase().trim();

    // Find user
    const user = await this.userRepository.findByEmailGlobal(normalizedEmail);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException('Account suspended');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Update user
    await this.userRepository.update(user._id.toString(), {
      refreshToken: tokens.refreshToken,
      lastLoginAt: new Date(),
    } as any);

    return {
      ...tokens,
      user: this.sanitizeUser(user),
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.userRepository.findById(payload.sub);

      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async verifyEmail(userId: string, code: string): Promise<UserDocument> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    if (user.emailVerificationCode !== code) {
      throw new BadRequestException('Invalid verification code');
    }

    const updated = await this.userRepository.update(userId, {
      emailVerified: true,
      emailVerificationCode: null,
      status: UserStatus.ACTIVE,
    } as any);

    return updated;
  }

  async resendVerificationEmail(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    const emailVerificationCode = CodeGeneratorUtil.generateVerificationCode();

    await this.userRepository.update(userId, {
      emailVerificationCode,
    } as any);

    await this.emailService.sendVerificationEmail(user.email, emailVerificationCode);
  }

  async logout(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      refreshToken: null,
    } as any);
  }

  async validateUser(userId: string): Promise<UserDocument> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  private async generateTokens(user: UserDocument): Promise<AuthTokens> {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      tenantId: user.tenantId.toString(),
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private sanitizeUser(user: UserDocument): Partial<UserDocument> {
    const { password, refreshToken, emailVerificationCode, phoneVerificationCode, ...sanitized } = user.toObject();
    return sanitized;
  }
}
