import { Module } from '@nestjs/common';
import { EmailService } from './email/email.service';
import { PushService } from './push/push.service';
import { SmsService } from './sms/sms.service';

@Module({
  providers: [EmailService, PushService, SmsService],
  exports: [EmailService, PushService, SmsService],
})
export class NotificationsModule {}
