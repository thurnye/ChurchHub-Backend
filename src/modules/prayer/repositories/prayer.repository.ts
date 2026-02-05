import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PrayerRequest, PrayerRequestDocument } from '../entities/prayer-request.entity';
import { BaseRepository } from '@infrastructure/database/base.repository';

@Injectable()
export class PrayerRepository extends BaseRepository<PrayerRequestDocument> {
  constructor(@InjectModel(PrayerRequest.name) private prayerModel: Model<PrayerRequestDocument>) {
    super(prayerModel);
  }

  async findPublicByTenant(tenantId: string, skip: number, limit: number): Promise<PrayerRequestDocument[]> {
    return this.prayerModel
      .find({ tenantId, isPrivate: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'firstName lastName avatar')
      .exec();
  }

  async findByUser(userId: string): Promise<PrayerRequestDocument[]> {
    return this.find({ userId } as any);
  }
}
