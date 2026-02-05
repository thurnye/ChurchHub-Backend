import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Sermon, SermonSchema } from './entities/sermon.entity';
import { SermonRepository } from './repositories/sermon.repository';
import { SermonsService } from './services/sermons.service';
import { SermonsController } from './controllers/sermons.controller';
import { QueueModule } from '../../infrastructure/queue/queue.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Sermon.name, schema: SermonSchema }]),
    QueueModule,
  ],
  controllers: [SermonsController],
  providers: [SermonsService, SermonRepository],
  exports: [SermonsService],
})
export class SermonsModule {}
