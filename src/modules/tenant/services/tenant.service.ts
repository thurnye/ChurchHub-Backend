import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { TenantRepository } from '../repositories/tenant.repository';
import { CreateTenantDto, UpdateTenantDto } from '../dtos';
import { SlugUtil, CodeGeneratorUtil } from '@common/utils';
import { TenantDocument, TenantStatus } from '../entities/tenant.entity';
import { CacheService } from '@infrastructure/cache';

@Injectable()
export class TenantService {
  constructor(
    private readonly tenantRepository: TenantRepository,
    private readonly cacheService: CacheService,
  ) {}

  async create(createTenantDto: CreateTenantDto): Promise<TenantDocument> {
    const slug = SlugUtil.generate(createTenantDto.name);

    // Check if slug already exists
    const existingSlug = await this.tenantRepository.findBySlug(slug);
    if (existingSlug) {
      throw new ConflictException('Church name already exists');
    }

    // Generate unique join code
    let joinCode: string;
    let codeExists = true;
    let attempts = 0;

    while (codeExists && attempts < 10) {
      joinCode = CodeGeneratorUtil.generateJoinCode();
      codeExists = !!(await this.tenantRepository.findByJoinCode(joinCode));
      attempts++;
    }

    if (codeExists) {
      throw new BadRequestException('Failed to generate unique join code');
    }

    const tenant = await this.tenantRepository.create({
      ...createTenantDto,
      slug,
      joinCode,
      status: TenantStatus.TRIAL,
      memberCount: 0,
      settings: {
        allowPublicRegistration: true,
        requireEmailVerification: false,
        requirePhoneVerification: false,
        enableDonations: true,
        enableEvents: true,
        enableGroups: true,
        enablePrayer: true,
        enableSermons: true,
        enableBible: true,
        timezone: 'UTC',
        language: 'en',
      },
      branding: {
        primaryColor: '#4F46E5',
        secondaryColor: '#7C3AED',
        accentColor: '#EC4899',
        fontFamily: 'Inter',
      },
    } as any);

    // Cache the tenant
    await this.cacheTenant(tenant);

    return tenant;
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: TenantDocument[]; total: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.tenantRepository.findWithPagination({}, skip, limit),
      this.tenantRepository.count(),
    ]);

    return { data, total };
  }

  async findById(id: string): Promise<TenantDocument> {
    // Try cache first
    const cached = await this.cacheService.get<TenantDocument>(`tenant:${id}`);
    if (cached) {
      return cached;
    }

    const tenant = await this.tenantRepository.findById(id);
    if (!tenant) {
      throw new NotFoundException('Church not found');
    }

    // Cache the tenant
    await this.cacheTenant(tenant);

    return tenant;
  }

  async findBySlug(slug: string): Promise<TenantDocument> {
    const tenant = await this.tenantRepository.findBySlug(slug);
    if (!tenant) {
      throw new NotFoundException('Church not found');
    }

    return tenant;
  }

  async findByJoinCode(joinCode: string): Promise<TenantDocument> {
    const tenant = await this.tenantRepository.findByJoinCode(joinCode);
    if (!tenant) {
      throw new NotFoundException('Invalid join code');
    }

    if (tenant.status !== TenantStatus.ACTIVE && tenant.status !== TenantStatus.TRIAL) {
      throw new BadRequestException('This church is not accepting new members');
    }

    return tenant;
  }

  async update(id: string, updateTenantDto: UpdateTenantDto): Promise<TenantDocument> {
    const tenant = await this.findById(id);

    // If name is being updated, generate new slug
    if (updateTenantDto.name && updateTenantDto.name !== tenant.name) {
      const newSlug = SlugUtil.generate(updateTenantDto.name);
      const existingSlug = await this.tenantRepository.findBySlug(newSlug);

      if (existingSlug && existingSlug._id.toString() !== id) {
        throw new ConflictException('Church name already exists');
      }

      (updateTenantDto as any).slug = newSlug;
    }

    const updated = await this.tenantRepository.update(id, updateTenantDto as any);

    // Invalidate cache
    await this.invalidateTenantCache(id);

    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.tenantRepository.delete(id);
    await this.invalidateTenantCache(id);
  }

  async regenerateJoinCode(id: string): Promise<TenantDocument> {
    let joinCode: string;
    let codeExists = true;
    let attempts = 0;

    while (codeExists && attempts < 10) {
      joinCode = CodeGeneratorUtil.generateJoinCode();
      codeExists = !!(await this.tenantRepository.findByJoinCode(joinCode));
      attempts++;
    }

    if (codeExists) {
      throw new BadRequestException('Failed to generate unique join code');
    }

    const updated = await this.tenantRepository.update(id, { joinCode } as any);
    await this.invalidateTenantCache(id);

    return updated;
  }

  async incrementMemberCount(tenantId: string): Promise<void> {
    await this.tenantRepository.incrementMemberCount(tenantId);
    await this.invalidateTenantCache(tenantId);
  }

  async decrementMemberCount(tenantId: string): Promise<void> {
    await this.tenantRepository.decrementMemberCount(tenantId);
    await this.invalidateTenantCache(tenantId);
  }

  private async cacheTenant(tenant: TenantDocument): Promise<void> {
    await this.cacheService.set(`tenant:${tenant._id}`, tenant, 3600);
  }

  private async invalidateTenantCache(tenantId: string): Promise<void> {
    await this.cacheService.delete(`tenant:${tenantId}`);
  }
}
