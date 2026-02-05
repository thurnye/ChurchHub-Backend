import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  templateId?: string;
  dynamicData?: any;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {}

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const provider = this.configService.get<string>('EMAIL_PROVIDER');

      this.logger.log(`Sending email to ${options.to} via ${provider}`);

      // TODO: Implement actual email sending based on provider
      // For now, just log in development
      if (this.configService.get<string>('NODE_ENV') === 'development') {
        this.logger.debug(`Email content:
          To: ${options.to}
          Subject: ${options.subject}
          Body: ${options.text || options.html}
        `);
      }

      // In production, implement actual email sending:
      // - SendGrid: Use @sendgrid/mail
      // - AWS SES: Use @aws-sdk/client-ses
      // - SMTP: Use nodemailer

      this.logger.log(`Email sent successfully to ${options.to}`);
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      throw error;
    }
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: 'Welcome to ChurchHub!',
      html: `
        <h1>Welcome ${name}!</h1>
        <p>Thank you for joining ChurchHub. We're excited to have you in our community.</p>
      `,
    });
  }

  async sendVerificationEmail(email: string, code: string): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: 'Verify Your Email',
      html: `
        <h1>Email Verification</h1>
        <p>Your verification code is: <strong>${code}</strong></p>
        <p>This code will expire in 15 minutes.</p>
      `,
    });
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const resetUrl = `${this.configService.get<string>('APP_URL')}/reset-password?token=${resetToken}`;

    await this.sendEmail({
      to: email,
      subject: 'Reset Your Password',
      html: `
        <h1>Password Reset Request</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });
  }
}
