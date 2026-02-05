import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type EventDocument = Event & Document;

export enum EventCategory {
  WORSHIP = 'worship',
  PRAYER = 'prayer',
  CONFERENCE = 'conference',
  OUTREACH = 'outreach',
  YOUTH = 'youth',
  OTHER = 'other',
}

@Schema({ timestamps: true })
export class Event {
  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;

  @ApiProperty()
  @Prop({ required: true })
  title: string;

  @ApiProperty()
  @Prop({ required: true })
  description: string;

  @ApiProperty()
  @Prop({ type: String, enum: EventCategory, default: EventCategory.OTHER })
  category: EventCategory;

  @ApiProperty()
  @Prop({ required: true })
  startDate: Date;

  @ApiProperty()
  @Prop({ required: true })
  endDate: Date;

  @ApiProperty()
  @Prop()
  location: string;

  @ApiProperty()
  @Prop()
  image: string;

  @ApiProperty()
  @Prop({ default: false })
  requiresRegistration: boolean;

  @ApiProperty()
  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  attendees: Types.ObjectId[];

  @ApiProperty()
  @Prop({ default: 0 })
  maxAttendees: number;

  @ApiProperty()
  @Prop({ default: true })
  isPublic: boolean;

  @ApiProperty()
  @Prop()
  createdAt: Date;

  @ApiProperty()
  @Prop()
  updatedAt: Date;
}

export const EventSchema = SchemaFactory.createForClass(Event);
EventSchema.index({ tenantId: 1, startDate: 1 });
