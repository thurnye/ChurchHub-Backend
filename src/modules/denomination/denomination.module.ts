import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Denomination, DenominationSchema } from './denomination.entity';
import { DenominationService } from './denomination.service';
import { DenominationController } from './denomination.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Denomination.name, schema: DenominationSchema },
    ]),
  ],
  controllers: [DenominationController],
  providers: [DenominationService],
  exports: [DenominationService, MongooseModule],
})
export class DenominationModule {}
