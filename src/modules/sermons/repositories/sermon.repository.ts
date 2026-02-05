import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { Sermon, SermonDocument } from '../entities/sermon.entity';
import { CreateSermonDto } from '../dtos/create-sermon.dto';
import { UpdateSermonDto } from '../dtos/update-sermon.dto';
import { QuerySermonDto } from '../dtos/query-sermon.dto';

@Injectable()
export class SermonRepository {
  constructor(
    @InjectModel(Sermon.name) private readonly sermonModel: Model<SermonDocument>,
  ) {}

  async create(
    tenantId: string,
    dto: CreateSermonDto,
    createdBy: string,
  ): Promise<SermonDocument> {
    const sermon = new this.sermonModel({
      ...dto,
      tenantId: new Types.ObjectId(tenantId),
      createdBy: new Types.ObjectId(createdBy),
      date: new Date(dto.date),
      publishedAt: dto.isPublished ? new Date() : undefined,
    });
    return sermon.save();
  }

  async findById(tenantId: string, id: string): Promise<SermonDocument | null> {
    return this.sermonModel.findOne({
      _id: new Types.ObjectId(id),
      tenantId: new Types.ObjectId(tenantId),
    });
  }

  async findAll(
    tenantId: string,
    query: QuerySermonDto,
  ): Promise<{ data: SermonDocument[]; total: number }> {
    const filter: FilterQuery<Sermon> = {
      tenantId: new Types.ObjectId(tenantId),
    };

    if (query.speaker) {
      filter.speaker = { $regex: query.speaker, $options: 'i' };
    }

    if (query.tag) {
      filter.tags = query.tag;
    }

    if (query.dateFrom || query.dateTo) {
      filter.date = {};
      if (query.dateFrom) {
        filter.date.$gte = new Date(query.dateFrom);
      }
      if (query.dateTo) {
        filter.date.$lte = new Date(query.dateTo);
      }
    }

    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
      ];
    }

    if (typeof query.isPublished === 'boolean') {
      filter.isPublished = query.isPublished;
    }

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const sortField = query.sort || 'date';
    const sortOrder = query.order === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      this.sermonModel
        .find(filter)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.sermonModel.countDocuments(filter),
    ]);

    return { data, total };
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateSermonDto,
  ): Promise<SermonDocument | null> {
    const updateData: any = { ...dto };

    if (dto.date) {
      updateData.date = new Date(dto.date);
    }

    // If publishing for first time, set publishedAt
    if (dto.isPublished) {
      const existing = await this.findById(tenantId, id);
      if (existing && !existing.isPublished) {
        updateData.publishedAt = new Date();
      }
    }

    return this.sermonModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(id),
        tenantId: new Types.ObjectId(tenantId),
      },
      { $set: updateData },
      { new: true },
    );
  }

  async delete(tenantId: string, id: string): Promise<boolean> {
    const result = await this.sermonModel.deleteOne({
      _id: new Types.ObjectId(id),
      tenantId: new Types.ObjectId(tenantId),
    });
    return result.deletedCount > 0;
  }

  async incrementViewCount(tenantId: string, id: string): Promise<void> {
    await this.sermonModel.updateOne(
      {
        _id: new Types.ObjectId(id),
        tenantId: new Types.ObjectId(tenantId),
      },
      { $inc: { viewCount: 1 } },
    );
  }

  async findSpeakers(tenantId: string): Promise<string[]> {
    return this.sermonModel.distinct('speaker', {
      tenantId: new Types.ObjectId(tenantId),
    });
  }

  async findTags(tenantId: string): Promise<string[]> {
    return this.sermonModel.distinct('tags', {
      tenantId: new Types.ObjectId(tenantId),
    });
  }
}
