import { Injectable, Logger } from '@nestjs/common';

export interface SmsOptions {
  to: string;
  message: string;
}

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  async sendSms(options: SmsOptions): Promise<void> {
    this.logger.log(`Sending SMS to ${options.to}: ${options.message}`);

    // TODO: Implement actual SMS sending with Twilio or similar service
    // For now, just log the SMS
    this.logger.debug(`SMS content: ${options.message}`);
  }
}
