import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateUserSettingsDto {
  @ApiPropertyOptional({ description: 'Receive email notifications' })
  @IsBoolean()
  @IsOptional()
  emailNotifications?: boolean;

  @ApiPropertyOptional({ description: 'Receive push notifications' })
  @IsBoolean()
  @IsOptional()
  pushNotifications?: boolean;

  @ApiPropertyOptional({ description: 'Receive SMS notifications' })
  @IsBoolean()
  @IsOptional()
  smsNotifications?: boolean;

  @ApiPropertyOptional({ description: 'Notify on new sermons' })
  @IsBoolean()
  @IsOptional()
  notifyNewSermons?: boolean;

  @ApiPropertyOptional({ description: 'Notify on new events' })
  @IsBoolean()
  @IsOptional()
  notifyNewEvents?: boolean;

  @ApiPropertyOptional({ description: 'Notify on community posts' })
  @IsBoolean()
  @IsOptional()
  notifyCommunityPosts?: boolean;

  @ApiPropertyOptional({ description: 'Notify on prayer requests' })
  @IsBoolean()
  @IsOptional()
  notifyPrayerRequests?: boolean;

  @ApiPropertyOptional({ description: 'Notify on group updates' })
  @IsBoolean()
  @IsOptional()
  notifyGroupUpdates?: boolean;

  @ApiPropertyOptional({ description: 'Preferred Bible translation ID' })
  @IsString()
  @IsOptional()
  preferredBibleTranslationId?: string;

  @ApiPropertyOptional({ description: 'Language preference', example: 'en' })
  @IsString()
  @IsOptional()
  language?: string;
}
