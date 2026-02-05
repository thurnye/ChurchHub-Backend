import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type PrayerRequestDocument = PrayerRequest & Document;

export enum PrayerCategory {
  HEALTH = 'health',
  FAMILY = 'family',
  FINANCE = 'finance',
  SPIRITUAL = 'spiritual',
  THANKSGIVING = 'thanksgiving',
  OTHER = 'other',
}

export enum PrayerStatus {
  OPEN = 'open',
  ANSWERED = 'answered',
  CLOSED = 'closed',
}

@Schema({ timestamps: true })
export class PrayerRequest {
  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @ApiProperty()
  @Prop({ required: true })
  title: string;

  @ApiProperty()
  @Prop({ required: true })
  description: string;

  @ApiProperty()
  @Prop({ type: String, enum: PrayerCategory, default: PrayerCategory.OTHER })
  category: PrayerCategory;

  @ApiProperty()
  @Prop({ type: String, enum: PrayerStatus, default: PrayerStatus.OPEN })
  status: PrayerStatus;

  @ApiProperty()
  @Prop({ default: false })
  isAnonymous: boolean;

  @ApiProperty()
  @Prop({ default: false })
  isPrivate: boolean;

  @ApiProperty()
  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  prayedBy: Types.ObjectId[];

  @ApiProperty()
  @Prop({ default: 0 })
  prayerCount: number;

  @ApiProperty()
  @Prop()
  createdAt: Date;

  @ApiProperty()
  @Prop()
  updatedAt: Date;
}

export const PrayerRequestSchema = SchemaFactory.createForClass(PrayerRequest);
PrayerRequestSchema.index({ tenantId: 1, createdAt: -1 });
PrayerRequestSchema.index({ userId: 1, createdAt: -1 });
