import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommunityProgram, CommunityProgramSchema } from './entities/program.entity';
import { ProgramRepository } from './repositories/program.repository';
import { CommunityService } from './services/community.service';
import { CommunityController } from './controllers/community.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CommunityProgram.name, schema: CommunityProgramSchema },
    ]),
  ],
  controllers: [CommunityController],
  providers: [CommunityService, ProgramRepository],
  exports: [CommunityService],
})
export class CommunityModule {}
