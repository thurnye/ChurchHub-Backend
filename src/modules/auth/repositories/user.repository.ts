import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../entities/user.entity';
import { BaseRepository } from '@infrastructure/database/base.repository';

@Injectable()
export class UserRepository extends BaseRepository<UserDocument> {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    super(userModel);
  }

  async findByEmail(email: string, tenantId: string): Promise<UserDocument | null> {
    return this.findOne({ email, tenantId });
  }

  async findByEmailGlobal(email: string): Promise<UserDocument | null> {
    return this.findOne({ email });
  }

  async findByTenant(tenantId: string): Promise<UserDocument[]> {
    return this.find({ tenantId });
  }

  async countByTenant(tenantId: string): Promise<number> {
    return this.count({ tenantId });
  }
}
