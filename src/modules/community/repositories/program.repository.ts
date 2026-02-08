import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import {
  CommunityProgram,
  CommunityProgramDocument,
  ProgramType,
} from '../entities/program.entity';
import { BaseRepository } from '@infrastructure/database/base.repository';

@Injectable()
export class ProgramRepository extends BaseRepository<CommunityProgramDocument> {
  constructor(
    @InjectModel(CommunityProgram.name)
    private programModel: Model<CommunityProgramDocument>,
  ) {
    super(programModel);
  }

  async findAll(
    skip: number,
    limit: number,
    filter: FilterQuery<CommunityProgramDocument> = {},
  ): Promise<CommunityProgramDocument[]> {
    return this.programModel
      .find({ isActive: true, ...filter })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('_id category title image timeCommitment description')
      .exec();
  }

  async countAll(
    filter: FilterQuery<CommunityProgramDocument> = {},
  ): Promise<number> {
    return this.programModel
      .countDocuments({ isActive: true, ...filter })
      .exec();
  }
  
  async findByTenant(
    tenantId: string,
    skip: number,
    limit: number,
    filter: FilterQuery<CommunityProgramDocument> = {},
  ): Promise<CommunityProgramDocument[]> {
    return this.programModel
      .find({ tenantId, isActive: true, ...filter })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async countByTenant(
    tenantId: string,
    filter: FilterQuery<CommunityProgramDocument> = {},
  ): Promise<number> {
    return this.programModel
      .countDocuments({ tenantId, isActive: true, ...filter })
      .exec();
  }

  async findByType(
    tenantId: string,
    type: ProgramType,
    skip: number,
    limit: number,
  ): Promise<CommunityProgramDocument[]> {
    return this.findByTenant(tenantId, skip, limit, { type });
  }

  async findCommunityPrograms(
    tenantId: string,
    skip: number,
    limit: number,
  ): Promise<CommunityProgramDocument[]> {
    return this.findByType(tenantId, ProgramType.COMMUNITY, skip, limit);
  }

  async findVolunteerPrograms(
    tenantId: string,
    skip: number,
    limit: number,
  ): Promise<CommunityProgramDocument[]> {
    return this.findByType(tenantId, ProgramType.VOLUNTEER, skip, limit);
  }

  async findByCategory(
    tenantId: string,
    category: string,
    skip: number,
    limit: number,
  ): Promise<CommunityProgramDocument[]> {
    return this.findByTenant(tenantId, skip, limit, { category });
  }

  async getCategories(tenantId: string): Promise<string[]> {
    return this.programModel.distinct('category', { tenantId, isActive: true });
  }
}
