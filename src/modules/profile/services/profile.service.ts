import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '@modules/auth/repositories/user.repository';
import { UpdateProfileDto } from '../dtos/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly userRepository: UserRepository) {}

  async getProfile(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, refreshToken, ...profile } = user.toObject();
    return profile;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const updated = await this.userRepository.update(userId, updateProfileDto as any);
    if (!updated) {
      throw new NotFoundException('User not found');
    }

    const { password, refreshToken, ...profile } = updated.toObject();
    return profile;
  }

  async uploadAvatar(userId: string, avatarUrl: string) {
    const updated = await this.userRepository.update(userId, { avatar: avatarUrl } as any);
    return updated;
  }
}
