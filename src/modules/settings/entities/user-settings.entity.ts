import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type UserSettingsDocument = UserSettings & Document;

@Schema({ timestamps: true, collection: 'user_settings' })
export class UserSettings {
  @ApiProperty({ description: 'User ID' })
  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId: Types.ObjectId;

  @ApiProperty({ description: 'Tenant ID' })
  @Prop({ type: Types.ObjectId, required: true, index: true })
  tenantId: Types.ObjectId;

  @ApiProperty({ description: 'Receive email notifications' })
  @Prop({ default: true })
  emailNotifications: boolean;

  @ApiProperty({ description: 'Receive push notifications' })
  @Prop({ default: true })
  pushNotifications: boolean;

  @ApiProperty({ description: 'Receive SMS notifications' })
  @Prop({ default: false })
  smsNotifications: boolean;

  @ApiProperty({ description: 'Notify on new sermons' })
  @Prop({ default: true })
  notifyNewSermons: boolean;

  @ApiProperty({ description: 'Notify on new events' })
  @Prop({ default: true })
  notifyNewEvents: boolean;

  @ApiProperty({ description: 'Notify on community posts' })
  @Prop({ default: true })
  notifyCommunityPosts: boolean;

  @ApiProperty({ description: 'Notify on prayer requests' })
  @Prop({ default: true })
  notifyPrayerRequests: boolean;

  @ApiProperty({ description: 'Notify on group updates' })
  @Prop({ default: true })
  notifyGroupUpdates: boolean;

  @ApiProperty({ description: 'Preferred Bible translation ID' })
  @Prop()
  preferredBibleTranslationId?: string;

  @ApiProperty({ description: 'Language preference' })
  @Prop({ default: 'en' })
  language: string;
}

export const UserSettingsSchema = SchemaFactory.createForClass(UserSettings);

UserSettingsSchema.index({ userId: 1, tenantId: 1 }, { unique: true });
