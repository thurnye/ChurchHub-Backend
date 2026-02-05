import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Group, GroupSchema } from './entities/group.entity';
import { GroupRepository } from './repositories/group.repository';
import { GroupsService } from './services/groups.service';
import { GroupsController } from './controllers/groups.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Group.name, schema: GroupSchema }]),
  ],
  controllers: [GroupsController],
  providers: [GroupsService, GroupRepository],
  exports: [GroupsService],
})
export class GroupsModule {}
