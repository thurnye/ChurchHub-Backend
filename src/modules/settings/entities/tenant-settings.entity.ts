import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type TenantSettingsDocument = TenantSettings & Document;

@Schema({ timestamps: true, collection: 'tenant_settings' })
export class TenantSettings {
  @ApiProperty({ description: 'Tenant ID' })
  @Prop({ type: Types.ObjectId, required: true, unique: true, index: true })
  tenantId: Types.ObjectId;

  @ApiProperty({ description: 'Default Bible translation ID' })
  @Prop()
  defaultBibleTranslationId?: string;

  @ApiProperty({ description: 'Enable community post moderation' })
  @Prop({ default: false })
  enablePostModeration: boolean;

  @ApiProperty({ description: 'Enable comment moderation' })
  @Prop({ default: false })
  enableCommentModeration: boolean;

  @ApiProperty({ description: 'Allow members to create prayer requests' })
  @Prop({ default: true })
  allowMemberPrayerRequests: boolean;

  @ApiProperty({ description: 'Allow members to create community posts' })
  @Prop({ default: true })
  allowMemberPosts: boolean;

  @ApiProperty({ description: 'Notification retention days' })
  @Prop({ default: 30 })
  notificationRetentionDays: number;

  @ApiProperty({ description: 'Enable email notifications' })
  @Prop({ default: true })
  enableEmailNotifications: boolean;

  @ApiProperty({ description: 'Enable push notifications' })
  @Prop({ default: true })
  enablePushNotifications: boolean;

  @ApiProperty({ description: 'Church timezone' })
  @Prop({ default: 'America/New_York' })
  timezone: string;

  @ApiProperty({ description: 'Church currency for donations' })
  @Prop({ default: 'USD' })
  currency: string;

  @ApiProperty({ description: 'Enable online giving' })
  @Prop({ default: true })
  enableOnlineGiving: boolean;

  @ApiProperty({ description: 'Custom primary color (hex)' })
  @Prop()
  primaryColor?: string;

  @ApiProperty({ description: 'Custom secondary color (hex)' })
  @Prop()
  secondaryColor?: string;
}

export const TenantSettingsSchema = SchemaFactory.createForClass(TenantSettings);
