import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

import { PushService } from '../../push/push.service';
import { EmailService } from '../../email/email.service';
import { NOTIFICATIONS_QUEUE, NotificationsService, SEND_NOTIFICATION_JOB } from '../notifications.service';
import { NotificationStatus, NotificationType } from 'src/common/enums/notification-type.enum';
import { NotificationDocument } from '../schema/notification.schema';

interface SendNotificationJobData {
  notificationId: string;
}

@Processor(NOTIFICATIONS_QUEUE, { concurrency: 5 })
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly pushService: PushService,
    private readonly emailService: EmailService,
  ) {
    super();
  }

  async process(job: Job<SendNotificationJobData>): Promise<void> {
    if (job.name !== SEND_NOTIFICATION_JOB) return;

    const { notificationId } = job.data;
    this.logger.log(`Processing notification: ${notificationId}`);

    const notification = await this.notificationsService.findById(notificationId);

    await Promise.all(this.buildTasks(notification));

    notification.status = NotificationStatus.SENT;
    await notification.save();

    this.logger.log(`Notification sent: ${notificationId}`);
  }

  private buildTasks(notification: NotificationDocument): Promise<void>[] {
    const tasks: Promise<void>[] = [];

    if (
      notification.type === NotificationType.PUSH ||
      notification.type === NotificationType.BOTH
    ) {
      tasks.push(this.pushService.send(notification));
    }

    if (
      notification.type === NotificationType.EMAIL ||
      notification.type === NotificationType.BOTH
    ) {
      tasks.push(this.emailService.sendNotificationEmail(notification));
    }

    return tasks;
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<SendNotificationJobData>, error: Error): void {
    this.logger.error(
      `Job ${job.id} failed after ${job.attemptsMade} attempts: ${error.message}`,
      error.stack,
    );
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<SendNotificationJobData>): void {
    this.logger.log(`Job ${job.id} completed`);
  }
}