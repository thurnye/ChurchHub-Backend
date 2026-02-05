import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SmsOptions {
  to: string;
  message: string;
}

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(private configService: ConfigService) {}

  async sendSms(options: SmsOptions): Promise<void> {
    try {
      this.logger.log(`Sending SMS to ${options.to}`);

      // TODO: Implement actual SMS sending using Twilio
      // const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
      // const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
      // const client = twilio(accountSid, authToken);

      if (this.configService.get<string>('NODE_ENV') === 'development') {
        this.logger.debug(`SMS content:
          To: ${options.to}
          Message: ${options.message}
        `);
      }

      this.logger.log(`SMS sent successfully to ${options.to}`);
    } catch (error) {
      this.logger.error(`Failed to send SMS: ${error.message}`, error.stack);
      throw error;
    }
  }

  async sendVerificationSms(phone: string, code: string): Promise<void> {
    await this.sendSms({
      to: phone,
      message: `Your ChurchHub verification code is: ${code}. Valid for 15 minutes.`,
    });
  }
}
