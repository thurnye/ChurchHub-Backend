import { Injectable, Logger } from '@nestjs/common';
import { DonationRepository } from '../repositories/donation.repository';
import { CreateDonationDto } from '../dtos/create-donation.dto';
import { DonationStatus } from '../entities/donation.entity';
import { CodeGeneratorUtil, PaginationUtil } from '@common/utils';
import { QueuePublishers } from '@infrastructure/queue';
import { EventName } from '@common/constants/events.constants';

@Injectable()
export class GiveService {
  private readonly logger = new Logger(GiveService.name);

  constructor(
    private readonly donationRepository: DonationRepository,
    private readonly queuePublishers: QueuePublishers,
  ) {}

  async createDonation(tenantId: string, userId: string, createDonationDto: CreateDonationDto) {
    const reference = CodeGeneratorUtil.generateReferenceNumber('DON');

    const donation = await this.donationRepository.create({
      tenantId,
      userId,
      ...createDonationDto,
      currency: 'USD',
      status: DonationStatus.PENDING,
      reference,
    } as any);

    // Publish donation event
    try {
      await this.queuePublishers.publish(EventName.DONATION_STATUS_UPDATED, {
        tenantId,
        donationId: donation._id.toString(),
        amount: donation.amount,
        status: donation.status,
      });
    } catch (error) {
      this.logger.error(`Failed to publish donation event: ${error.message}`);
    }

    return donation;
  }

  async getUserDonations(userId: string, page: number, limit: number) {
    const skip = PaginationUtil.getSkip(page, limit);
    const [data, total] = await Promise.all([
      this.donationRepository.findByUser(userId, skip, limit),
      this.donationRepository.count({ userId } as any),
    ]);

    return PaginationUtil.paginate(data, total, { page, limit });
  }

  async getTenantStats(tenantId: string) {
    const [total, count] = await Promise.all([
      this.donationRepository.getTotalByTenant(tenantId),
      this.donationRepository.count({ tenantId, status: DonationStatus.COMPLETED } as any),
    ]);

    return {
      totalAmount: total,
      totalDonations: count,
      averageDonation: count > 0 ? total / count : 0,
    };
  }
}
