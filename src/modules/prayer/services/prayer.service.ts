import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrayerRepository } from '../repositories/prayer.repository';
import { CreatePrayerDto } from '../dtos/create-prayer.dto';
import { PrayerStatus } from '../entities/prayer-request.entity';
import { PaginationUtil } from '@common/utils';

@Injectable()
export class PrayerService {
  constructor(private readonly prayerRepository: PrayerRepository) {}

  async create(tenantId: string, userId: string, createPrayerDto: CreatePrayerDto) {
    return this.prayerRepository.create({
      tenantId,
      userId,
      ...createPrayerDto,
      status: PrayerStatus.OPEN,
      prayedBy: [],
      prayerCount: 0,
    } as any);
  }

  async findAll(tenantId: string, page: number, limit: number) {
    const skip = PaginationUtil.getSkip(page, limit);
    const [data, total] = await Promise.all([
      this.prayerRepository.findPublicByTenant(tenantId, skip, limit),
      this.prayerRepository.count({ tenantId, isPrivate: false } as any),
    ]);

    return PaginationUtil.paginate(data, total, { page, limit });
  }

  async findOne(id: string) {
    const prayer = await this.prayerRepository.findById(id);
    if (!prayer) {
      throw new NotFoundException('Prayer request not found');
    }
    return prayer;
  }

  async prayForRequest(prayerId: string, userId: string) {
    const prayer = await this.findOne(prayerId);
    const prayedBy = prayer.prayedBy || [];

    if (prayedBy.some((id) => id.toString() === userId)) {
      throw new BadRequestException('Already prayed for this request');
    }

    prayedBy.push(userId as any);

    return this.prayerRepository.update(prayerId, {
      prayedBy,
      prayerCount: prayedBy.length,
    } as any);
  }

  async markAsAnswered(prayerId: string, userId: string) {
    const prayer = await this.findOne(prayerId);

    if (prayer.userId.toString() !== userId) {
      throw new BadRequestException('Only the creator can mark prayer as answered');
    }

    return this.prayerRepository.update(prayerId, { status: PrayerStatus.ANSWERED } as any);
  }

  async getMyPrayers(userId: string) {
    return this.prayerRepository.findByUser(userId);
  }
}
