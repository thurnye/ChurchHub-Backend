import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { WorshipSet, WorshipSetDocument } from '../entities/worship-set.entity';
import { CreateWorshipSetDto, WorshipSetItemDto } from '../dtos/create-worship-set.dto';
import { UpdateWorshipSetDto } from '../dtos/update-worship-set.dto';
import { QueryWorshipSetDto } from '../dtos/query-worship.dto';

@Injectable()
export class WorshipSetRepository {
  constructor(
    @InjectModel(WorshipSet.name)
    private readonly setModel: Model<WorshipSetDocument>,
  ) {}

  async create(
    tenantId: string,
    dto: CreateWorshipSetDto,
    createdBy: string,
  ): Promise<WorshipSetDocument> {
    const items = dto.items?.map((item) => ({
      resourceId: new Types.ObjectId(item.resourceId),
      order: item.order,
      keyOverride: item.keyOverride,
      notes: item.notes,
    })) || [];

    const set = new this.setModel({
      ...dto,
      tenantId: new Types.ObjectId(tenantId),
      createdBy: new Types.ObjectId(createdBy),
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      eventId: dto.eventId ? new Types.ObjectId(dto.eventId) : undefined,
      leaderId: dto.leaderId ? new Types.ObjectId(dto.leaderId) : undefined,
      teamMembers: dto.teamMembers?.map((id) => new Types.ObjectId(id)) || [],
      items,
    });
    return set.save();
  }

  async findById(tenantId: string, id: string): Promise<WorshipSetDocument | null> {
    return this.setModel
      .findOne({
        _id: new Types.ObjectId(id),
        tenantId: new Types.ObjectId(tenantId),
      })
      .populate('items.resourceId');
  }

  async findAll(
    tenantId: string,
    query: QueryWorshipSetDto,
  ): Promise<{ data: WorshipSetDocument[]; total: number }> {
    const filter: FilterQuery<WorshipSet> = {
      tenantId: new Types.ObjectId(tenantId),
    };

    if (query.dateFrom || query.dateTo) {
      filter.scheduledAt = {};
      if (query.dateFrom) {
        filter.scheduledAt.$gte = new Date(query.dateFrom);
      }
      if (query.dateTo) {
        filter.scheduledAt.$lte = new Date(query.dateTo);
      }
    }

    if (query.eventId) {
      filter.eventId = new Types.ObjectId(query.eventId);
    }

    if (typeof query.isPublished === 'boolean') {
      filter.isPublished = query.isPublished;
    }

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const sortField = query.sort || 'scheduledAt';
    const sortOrder = query.order === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      this.setModel
        .find(filter)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .populate('items.resourceId')
        .exec(),
      this.setModel.countDocuments(filter),
    ]);

    return { data, total };
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateWorshipSetDto,
  ): Promise<WorshipSetDocument | null> {
    const updateData: any = { ...dto };

    if (dto.scheduledAt) {
      updateData.scheduledAt = new Date(dto.scheduledAt);
    }

    if (dto.eventId) {
      updateData.eventId = new Types.ObjectId(dto.eventId);
    }

    if (dto.leaderId) {
      updateData.leaderId = new Types.ObjectId(dto.leaderId);
    }

    if (dto.teamMembers) {
      updateData.teamMembers = dto.teamMembers.map((id) => new Types.ObjectId(id));
    }

    if (dto.items) {
      updateData.items = dto.items.map((item) => ({
        resourceId: new Types.ObjectId(item.resourceId),
        order: item.order,
        keyOverride: item.keyOverride,
        notes: item.notes,
      }));
    }

    return this.setModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(id),
          tenantId: new Types.ObjectId(tenantId),
        },
        { $set: updateData },
        { new: true },
      )
      .populate('items.resourceId');
  }

  async delete(tenantId: string, id: string): Promise<boolean> {
    const result = await this.setModel.deleteOne({
      _id: new Types.ObjectId(id),
      tenantId: new Types.ObjectId(tenantId),
    });
    return result.deletedCount > 0;
  }

  async publish(tenantId: string, id: string): Promise<WorshipSetDocument | null> {
    return this.setModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(id),
          tenantId: new Types.ObjectId(tenantId),
        },
        { $set: { isPublished: true } },
        { new: true },
      )
      .populate('items.resourceId');
  }

  async findUpcoming(tenantId: string, limit: number = 5): Promise<WorshipSetDocument[]> {
    return this.setModel
      .find({
        tenantId: new Types.ObjectId(tenantId),
        scheduledAt: { $gte: new Date() },
      })
      .sort({ scheduledAt: 1 })
      .limit(limit)
      .populate('items.resourceId');
  }
}
