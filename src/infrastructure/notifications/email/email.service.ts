import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {}

  async sendEmail(options: EmailOptions): Promise<void> {
    this.logger.log(`Sending email to ${options.to}: ${options.subject}`);

    // TODO: Implement actual email sending with nodemailer or SendGrid
    // For now, just log the email
    this.logger.debug(`Email content: ${options.html}`);
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${resetToken}`;

    await this.sendEmail({
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h1>Password Reset</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link will expire in 1 hour.</p>
      `,
    });
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: 'Welcome to Church Platform',
      html: `
        <h1>Welcome ${name}!</h1>
        <p>Thank you for joining our church community platform.</p>
      `,
    });
  }
}
