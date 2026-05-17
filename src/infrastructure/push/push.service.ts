import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { NotificationDocument } from 'src/infrastructure/notifications/schema/notification.schema';
import { DeviceTokensService } from '../device-tokens/device-tokens.service';

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);

  constructor(private readonly deviceTokensService: DeviceTokensService) {}

  async send(notification: NotificationDocument): Promise<void> {
    const deviceTokens = await this.deviceTokensService.findByUserId(
      notification.userId,
    );

    if (deviceTokens.length === 0) {
      this.logger.warn(`No device tokens for user ${notification.userId}`);
      return;
    }

    const tokens = deviceTokens.map((d) => d.token);

    const response = await admin.messaging().sendEachForMulticast({
      tokens,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: {
        notificationId: notification._id.toString(),
        ...(notification.metadata as Record<string, string> | undefined),
      },
    });

    this.logger.log(
      `Push sent to ${response.successCount}/${tokens.length} devices for user ${notification.userId}`,
    );

    const invalidTokens = response.responses
      .map((r, i) => (!r.success ? tokens[i] : null))
      .filter((t): t is string => t !== null);

    if (invalidTokens.length > 0) {
      this.logger.warn(`Removing ${invalidTokens.length} invalid tokens`);
      await Promise.all(
        invalidTokens.map((t) => this.deviceTokensService.removeByToken(t)),
      );
    }
  }
}
