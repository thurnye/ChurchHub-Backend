import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { WorshipResource, WorshipResourceDocument } from '../entities/worship-resource.entity';
import { CreateWorshipResourceDto } from '../dtos/create-worship-resource.dto';
import { UpdateWorshipResourceDto } from '../dtos/update-worship-resource.dto';
import { QueryWorshipResourceDto } from '../dtos/query-worship.dto';

@Injectable()
export class WorshipResourceRepository {
  constructor(
    @InjectModel(WorshipResource.name)
    private readonly resourceModel: Model<WorshipResourceDocument>,
  ) {}

  async create(
    tenantId: string,
    dto: CreateWorshipResourceDto,
    createdBy: string,
  ): Promise<WorshipResourceDocument> {
    const resource = new this.resourceModel({
      ...dto,
      tenantId: new Types.ObjectId(tenantId),
      createdBy: new Types.ObjectId(createdBy),
    });
    return resource.save();
  }

  async findById(tenantId: string, id: string): Promise<WorshipResourceDocument | null> {
    return this.resourceModel.findOne({
      _id: new Types.ObjectId(id),
      tenantId: new Types.ObjectId(tenantId),
    });
  }

  async findAll(
    tenantId: string,
    query: QueryWorshipResourceDto,
  ): Promise<{ data: WorshipResourceDocument[]; total: number }> {
    const filter: FilterQuery<WorshipResource> = {
      tenantId: new Types.ObjectId(tenantId),
    };

    if (query.type) {
      filter.type = query.type;
    }

    if (query.tag) {
      filter.tags = query.tag;
    }

    if (query.key) {
      filter.key = query.key;
    }

    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { artist: { $regex: query.search, $options: 'i' } },
      ];
    }

    if (!query.includeArchived) {
      filter.isArchived = false;
    }

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const sortField = query.sort || 'title';
    const sortOrder = query.order === 'desc' ? -1 : 1;

    const [data, total] = await Promise.all([
      this.resourceModel
        .find(filter)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.resourceModel.countDocuments(filter),
    ]);

    return { data, total };
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateWorshipResourceDto,
  ): Promise<WorshipResourceDocument | null> {
    return this.resourceModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(id),
        tenantId: new Types.ObjectId(tenantId),
      },
      { $set: dto },
      { new: true },
    );
  }

  async delete(tenantId: string, id: string): Promise<boolean> {
    const result = await this.resourceModel.deleteOne({
      _id: new Types.ObjectId(id),
      tenantId: new Types.ObjectId(tenantId),
    });
    return result.deletedCount > 0;
  }

  async archive(tenantId: string, id: string): Promise<WorshipResourceDocument | null> {
    return this.resourceModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(id),
        tenantId: new Types.ObjectId(tenantId),
      },
      { $set: { isArchived: true } },
      { new: true },
    );
  }

  async findTags(tenantId: string): Promise<string[]> {
    return this.resourceModel.distinct('tags', {
      tenantId: new Types.ObjectId(tenantId),
      isArchived: false,
    });
  }

  async findKeys(tenantId: string): Promise<string[]> {
    return this.resourceModel.distinct('key', {
      tenantId: new Types.ObjectId(tenantId),
      isArchived: false,
      key: { $ne: null },
    });
  }
}
