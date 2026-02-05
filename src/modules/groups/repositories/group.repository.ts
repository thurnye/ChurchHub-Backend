import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Group, GroupDocument } from '../entities/group.entity';
import { BaseRepository } from '@infrastructure/database/base.repository';

@Injectable()
export class GroupRepository extends BaseRepository<GroupDocument> {
  constructor(@InjectModel(Group.name) private groupModel: Model<GroupDocument>) {
    super(groupModel);
  }

  async findByTenant(tenantId: string, skip: number, limit: number): Promise<GroupDocument[]> {
    return this.groupModel
      .find({ tenantId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('leaderId', 'firstName lastName avatar')
      .exec();
  }

  async findByMember(userId: string): Promise<GroupDocument[]> {
    return this.groupModel.find({ members: userId }).populate('leaderId', 'firstName lastName avatar').exec();
  }
}
