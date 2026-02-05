import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from '../entities/notification.entity';
import { BaseRepository } from '@infrastructure/database/base.repository';

@Injectable()
export class NotificationRepository extends BaseRepository<NotificationDocument> {
  constructor(@InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>) {
    super(notificationModel);
  }

  async findByUser(userId: string, skip: number, limit: number): Promise<NotificationDocument[]> {
    return this.notificationModel.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
  }

  async countUnread(userId: string): Promise<number> {
    return this.count({ userId, isRead: false } as any);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationModel.updateMany({ userId, isRead: false }, { isRead: true });
  }
}
