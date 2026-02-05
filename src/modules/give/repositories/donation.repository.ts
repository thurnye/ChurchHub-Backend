import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Donation, DonationDocument } from '../entities/donation.entity';
import { BaseRepository } from '@infrastructure/database/base.repository';

@Injectable()
export class DonationRepository extends BaseRepository<DonationDocument> {
  constructor(@InjectModel(Donation.name) private donationModel: Model<DonationDocument>) {
    super(donationModel);
  }

  async findByUser(userId: string, skip: number, limit: number): Promise<DonationDocument[]> {
    return this.donationModel.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
  }

  async getTotalByTenant(tenantId: string): Promise<number> {
    const result = await this.donationModel.aggregate([
      { $match: { tenantId: tenantId as any, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    return result[0]?.total || 0;
  }
}
