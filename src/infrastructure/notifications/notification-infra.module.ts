import { Module, Global } from '@nestjs/common';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';
import { PushNotificationService } from './push-notification.service';

@Global()
@Module({
  providers: [EmailService, SmsService, PushNotificationService],
  exports: [EmailService, SmsService, PushNotificationService],
})
export class NotificationInfraModule {}
