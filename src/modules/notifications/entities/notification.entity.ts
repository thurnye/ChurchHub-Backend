import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type NotificationDocument = Notification & Document;

export enum NotificationType {
  EVENT = 'event',
  PRAYER = 'prayer',
  DONATION = 'donation',
  POST = 'post',
  ANNOUNCEMENT = 'announcement',
  GROUP = 'group',
  SERMON = 'sermon',
}

@Schema({ timestamps: true })
export class Notification {
  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: String, enum: NotificationType, required: true })
  type: NotificationType;

  @ApiProperty()
  @Prop({ required: true })
  title: string;

  @ApiProperty()
  @Prop({ required: true })
  message: string;

  @ApiProperty()
  @Prop({ type: Object })
  data: any;

  @ApiProperty()
  @Prop({ default: false })
  isRead: boolean;

  @ApiProperty()
  @Prop()
  createdAt: Date;

  @ApiProperty()
  @Prop()
  updatedAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, isRead: 1 });
