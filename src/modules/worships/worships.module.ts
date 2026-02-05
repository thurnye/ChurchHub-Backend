import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WorshipResource, WorshipResourceSchema } from './entities/worship-resource.entity';
import { WorshipSet, WorshipSetSchema } from './entities/worship-set.entity';
import { WorshipResourceRepository } from './repositories/worship-resource.repository';
import { WorshipSetRepository } from './repositories/worship-set.repository';
import { WorshipsService } from './services/worships.service';
import { WorshipsController } from './controllers/worships.controller';
import { QueueModule } from '../../infrastructure/queue/queue.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WorshipResource.name, schema: WorshipResourceSchema },
      { name: WorshipSet.name, schema: WorshipSetSchema },
    ]),
    QueueModule,
  ],
  controllers: [WorshipsController],
  providers: [
    WorshipsService,
    WorshipResourceRepository,
    WorshipSetRepository,
  ],
  exports: [WorshipsService],
})
export class WorshipsModule {}
