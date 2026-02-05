import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        maxPoolSize: configService.get<number>('MONGODB_MAX_POOL_SIZE') || 10,
        minPoolSize: configService.get<number>('MONGODB_MIN_POOL_SIZE') || 5,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
