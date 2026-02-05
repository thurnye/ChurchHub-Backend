import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
  Max,
  Matches,
} from 'class-validator';

export class UpdateTenantSettingsDto {
  @ApiPropertyOptional({ description: 'Default Bible translation ID' })
  @IsString()
  @IsOptional()
  defaultBibleTranslationId?: string;

  @ApiPropertyOptional({ description: 'Enable community post moderation' })
  @IsBoolean()
  @IsOptional()
  enablePostModeration?: boolean;

  @ApiPropertyOptional({ description: 'Enable comment moderation' })
  @IsBoolean()
  @IsOptional()
  enableCommentModeration?: boolean;

  @ApiPropertyOptional({ description: 'Allow members to create prayer requests' })
  @IsBoolean()
  @IsOptional()
  allowMemberPrayerRequests?: boolean;

  @ApiPropertyOptional({ description: 'Allow members to create community posts' })
  @IsBoolean()
  @IsOptional()
  allowMemberPosts?: boolean;

  @ApiPropertyOptional({ description: 'Notification retention days (7-365)' })
  @IsNumber()
  @Min(7)
  @Max(365)
  @IsOptional()
  notificationRetentionDays?: number;

  @ApiPropertyOptional({ description: 'Enable email notifications' })
  @IsBoolean()
  @IsOptional()
  enableEmailNotifications?: boolean;

  @ApiPropertyOptional({ description: 'Enable push notifications' })
  @IsBoolean()
  @IsOptional()
  enablePushNotifications?: boolean;

  @ApiPropertyOptional({ description: 'Church timezone', example: 'America/New_York' })
  @IsString()
  @IsOptional()
  timezone?: string;

  @ApiPropertyOptional({ description: 'Church currency for donations', example: 'USD' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ description: 'Enable online giving' })
  @IsBoolean()
  @IsOptional()
  enableOnlineGiving?: boolean;

  @ApiPropertyOptional({ description: 'Custom primary color (hex)', example: '#3B82F6' })
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Primary color must be a valid hex color' })
  @IsOptional()
  primaryColor?: string;

  @ApiPropertyOptional({ description: 'Custom secondary color (hex)', example: '#10B981' })
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Secondary color must be a valid hex color' })
  @IsOptional()
  secondaryColor?: string;
}
