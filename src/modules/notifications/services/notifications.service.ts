import { Injectable } from '@nestjs/common';
import { NotificationRepository } from '../repositories/notification.repository';
import { NotificationType } from '../entities/notification.entity';
import { PaginationUtil } from '@common/utils';
import { PushNotificationService } from '@infrastructure/notifications';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly pushNotificationService: PushNotificationService,
  ) {}

  async create(
    tenantId: string,
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: any,
  ) {
    const notification = await this.notificationRepository.create({
      tenantId,
      userId,
      type,
      title,
      message,
      data,
      isRead: false,
    } as any);

    // Send push notification (if user has device tokens)
    // This is handled by the queue in production
    return notification;
  }

  async getUserNotifications(userId: string, page: number, limit: number) {
    const skip = PaginationUtil.getSkip(page, limit);
    const [data, total] = await Promise.all([
      this.notificationRepository.findByUser(userId, skip, limit),
      this.notificationRepository.count({ userId } as any),
    ]);

    return PaginationUtil.paginate(data, total, { page, limit });
  }

  async markAsRead(notificationId: string) {
    return this.notificationRepository.update(notificationId, { isRead: true } as any);
  }

  async markAllAsRead(userId: string) {
    await this.notificationRepository.markAllAsRead(userId);
  }

  async getUnreadCount(userId: string) {
    return this.notificationRepository.countUnread(userId);
  }
}
