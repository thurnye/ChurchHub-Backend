import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Donation, DonationSchema } from './entities/donation.entity';
import { DonationRepository } from './repositories/donation.repository';
import { GiveService } from './services/give.service';
import { GiveController } from './controllers/give.controller';
import { QueueModule } from '@infrastructure/queue';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Donation.name, schema: DonationSchema }]),
    QueueModule,
  ],
  controllers: [GiveController],
  providers: [GiveService, DonationRepository],
  exports: [GiveService],
})
export class GiveModule {}
