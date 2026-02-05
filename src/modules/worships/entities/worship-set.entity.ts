import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type WorshipSetDocument = WorshipSet & Document;

@Schema({ _id: false })
export class WorshipSetItem {
  @ApiProperty({ description: 'Resource ID' })
  @Prop({ type: Types.ObjectId, ref: 'WorshipResource', required: true })
  resourceId: Types.ObjectId;

  @ApiProperty({ description: 'Order in the set' })
  @Prop({ required: true })
  order: number;

  @ApiProperty({ description: 'Key override for this instance' })
  @Prop()
  keyOverride?: string;

  @ApiProperty({ description: 'Notes for this item' })
  @Prop()
  notes?: string;
}

export const WorshipSetItemSchema = SchemaFactory.createForClass(WorshipSetItem);

@Schema({ timestamps: true, collection: 'worship_sets' })
export class WorshipSet {
  @ApiProperty({ description: 'Tenant ID' })
  @Prop({ type: Types.ObjectId, required: true, index: true })
  tenantId: Types.ObjectId;

  @ApiProperty({ description: 'Set title' })
  @Prop({ required: true, trim: true })
  title: string;

  @ApiProperty({ description: 'Description' })
  @Prop()
  description?: string;

  @ApiProperty({ description: 'Scheduled date/time' })
  @Prop({ index: true })
  scheduledAt?: Date;

  @ApiProperty({ description: 'Event ID (if linked to an event)' })
  @Prop({ type: Types.ObjectId, ref: 'Event' })
  eventId?: Types.ObjectId;

  @ApiProperty({ description: 'Items in the set' })
  @Prop({ type: [WorshipSetItemSchema], default: [] })
  items: WorshipSetItem[];

  @ApiProperty({ description: 'Worship leader user ID' })
  @Prop({ type: Types.ObjectId })
  leaderId?: Types.ObjectId;

  @ApiProperty({ description: 'Team member user IDs' })
  @Prop({ type: [Types.ObjectId], default: [] })
  teamMembers: Types.ObjectId[];

  @ApiProperty({ description: 'Notes for the team' })
  @Prop()
  notes?: string;

  @ApiProperty({ description: 'Is published to team' })
  @Prop({ default: false })
  isPublished: boolean;

  @ApiProperty({ description: 'Created by user ID' })
  @Prop({ type: Types.ObjectId })
  createdBy: Types.ObjectId;
}

export const WorshipSetSchema = SchemaFactory.createForClass(WorshipSet);

WorshipSetSchema.index({ tenantId: 1, scheduledAt: -1 });
WorshipSetSchema.index({ tenantId: 1, eventId: 1 });
