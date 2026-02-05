import { Module, Global } from '@nestjs/common';
import { RedisClient } from './redis.client';

@Global()
@Module({
  providers: [RedisClient],
  exports: [RedisClient],
})
export class RedisModule {}
