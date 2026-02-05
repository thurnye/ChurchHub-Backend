import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event, EventDocument } from '../entities/event.entity';
import { BaseRepository } from '@infrastructure/database/base.repository';

@Injectable()
export class EventRepository extends BaseRepository<EventDocument> {
  constructor(@InjectModel(Event.name) private eventModel: Model<EventDocument>) {
    super(eventModel);
  }

  async findUpcoming(tenantId: string, skip: number, limit: number): Promise<EventDocument[]> {
    return this.eventModel
      .find({ tenantId, startDate: { $gte: new Date() } })
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async findByCategory(tenantId: string, category: string): Promise<EventDocument[]> {
    return this.find({ tenantId, category } as any);
  }
}
