import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProfileController } from './controllers/profile.controller';
import { ProfileService } from './services/profile.service';
import { Profile, ProfileSchema } from './entities/profile.entity';
import { AuthModule } from '@modules/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Profile.name, schema: ProfileSchema }]),
    AuthModule,
  ],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService, MongooseModule],
})
export class ProfileModule {}
