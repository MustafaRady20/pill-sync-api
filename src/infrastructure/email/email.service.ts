import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { notificationEmailTemplate } from './templates/notification.template';
import { NotificationDocument } from 'src/infrastructure/notifications/schema/notification.schema';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  private readonly transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    await this.transporter.sendMail({
      from: `"Notifications" <${process.env.EMAIL}>`,
      to,
      subject,
      html,
    });
    this.logger.log(`Email sent to ${to}: ${subject}`);
  }

  async sendNotificationEmail(notification: NotificationDocument): Promise<void> {
    if (!notification.userId) {
      this.logger.warn(
        `Notification ${notification._id} has type email/both but no userId set.`,
      );
      return;
    }

    const html = notificationEmailTemplate({
      title: notification.title,
      body: notification.body,
      userId: notification.userId,
    });

    
    await this.sendEmail(notification.userId, notification.title, html);
  }
}