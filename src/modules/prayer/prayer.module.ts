import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PrayerRequest, PrayerRequestSchema } from './entities/prayer-request.entity';
import { PrayerRepository } from './repositories/prayer.repository';
import { PrayerService } from './services/prayer.service';
import { PrayerController } from './controllers/prayer.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PrayerRequest.name, schema: PrayerRequestSchema }]),
  ],
  controllers: [PrayerController],
  providers: [PrayerService, PrayerRepository],
  exports: [PrayerService],
})
export class PrayerModule {}
