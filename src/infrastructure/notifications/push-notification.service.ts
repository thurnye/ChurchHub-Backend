import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface PushNotificationOptions {
  token: string | string[];
  title: string;
  body: string;
  data?: any;
}

@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger(PushNotificationService.name);

  constructor(private configService: ConfigService) {}

  async sendPushNotification(options: PushNotificationOptions): Promise<void> {
    try {
      this.logger.log(`Sending push notification to ${options.token}`);

      // TODO: Implement actual push notification using Firebase Cloud Messaging
      // const admin = require('firebase-admin');
      // await admin.messaging().send({
      //   token: options.token,
      //   notification: {
      //     title: options.title,
      //     body: options.body,
      //   },
      //   data: options.data,
      // });

      if (this.configService.get<string>('NODE_ENV') === 'development') {
        this.logger.debug(`Push notification content:
          Title: ${options.title}
          Body: ${options.body}
          Data: ${JSON.stringify(options.data)}
        `);
      }

      this.logger.log(`Push notification sent successfully`);
    } catch (error) {
      this.logger.error(`Failed to send push notification: ${error.message}`, error.stack);
      throw error;
    }
  }

  async sendToMultiple(tokens: string[], title: string, body: string, data?: any): Promise<void> {
    const promises = tokens.map((token) =>
      this.sendPushNotification({ token, title, body, data }),
    );
    await Promise.allSettled(promises);
  }
}
