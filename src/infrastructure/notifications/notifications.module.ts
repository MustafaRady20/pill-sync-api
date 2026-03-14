import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';

import { NotificationsService, NOTIFICATIONS_QUEUE } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationProcessor } from './processors/notification.processor';
import { EmailModule } from '../email/email.module';
import { Notification, NotificationSchema } from './schema/notification.schema';
import { PushModule } from '../push/push.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
    BullModule.registerQueue({ name: NOTIFICATIONS_QUEUE }),
    EmailModule,
    PushModule,
  ],
  providers: [NotificationsService, NotificationProcessor],
  controllers: [NotificationsController],
  exports: [NotificationsService],
})
export class NotificationsModule {}