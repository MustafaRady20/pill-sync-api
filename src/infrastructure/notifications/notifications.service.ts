import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectQueue } from '@nestjs/bullmq';
import { Model } from 'mongoose';
import { Queue } from 'bullmq';
import {
  Notification,
  NotificationDocument,
} from './schema/notification.schema';
import { CreateNotificationDto } from './dtos/create-notification.dto';

export const SEND_NOTIFICATION_JOB = 'send-notification';
export const NOTIFICATIONS_QUEUE = 'notifications';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,

    @InjectQueue(NOTIFICATIONS_QUEUE)
    private readonly notificationQueue: Queue,
  ) {}

  async createNotification(
    dto: CreateNotificationDto,
  ): Promise<NotificationDocument> {
    const notification = await this.notificationModel.create(dto);

    await this.notificationQueue.add(
      SEND_NOTIFICATION_JOB,
      { notificationId: notification._id.toString() },
      {
        attempts: 5,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: true,
        removeOnFail: 100,
      },
    );

    this.logger.log(`Notification queued: ${notification._id}`);
    return notification;
  }

  async getUserNotifications(userId: string): Promise<NotificationDocument[]> {
    return this.notificationModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async findById(id: string): Promise<NotificationDocument> {
    const notification = await this.notificationModel.findById(id).exec();
    if (!notification) {
      throw new NotFoundException(`Notification ${id} not found`);
    }
    return notification;
  }
}
