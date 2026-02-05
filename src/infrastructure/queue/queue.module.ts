import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { QUEUE_NAMES } from 'src/common/constants/events.constants';
import { QueuePublishers } from './queue.publishers';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_URL').split('://')[1].split(':')[0],
          port: parseInt(
            configService.get('REDIS_URL').split(':')[2] || '6379',
          ),
        },
      }),
    }),
    BullModule.registerQueue(
      { name: QUEUE_NAMES.NOTIFICATIONS },
      { name: QUEUE_NAMES.CLEANUP },
    ),
  ],
  providers: [QueuePublishers],
  exports: [BullModule, QueuePublishers],
})
export class QueueModule {}
