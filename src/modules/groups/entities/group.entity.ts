import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type GroupDocument = Group & Document;

export enum GroupType {
  SMALL_GROUP = 'small_group',
  MINISTRY = 'ministry',
  BIBLE_STUDY = 'bible_study',
  YOUTH_GROUP = 'youth_group',
  PRAYER_GROUP = 'prayer_group',
  CHOIR = 'choir',
  OTHER = 'other',
}

@Schema({ timestamps: true })
export class Group {
  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;

  @ApiProperty()
  @Prop({ required: true })
  name: string;

  @ApiProperty()
  @Prop({ required: true })
  description: string;

  @ApiProperty()
  @Prop({ type: String, enum: GroupType, required: true })
  type: GroupType;

  @ApiProperty()
  @Prop()
  image: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  leaderId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  members: Types.ObjectId[];

  @ApiProperty()
  @Prop()
  meetingSchedule: string;

  @ApiProperty()
  @Prop()
  meetingLocation: string;

  @ApiProperty()
  @Prop({ default: 0 })
  maxMembers: number;

  @ApiProperty()
  @Prop({ default: true })
  isOpen: boolean;

  @ApiProperty()
  @Prop()
  createdAt: Date;

  @ApiProperty()
  @Prop()
  updatedAt: Date;
}

export const GroupSchema = SchemaFactory.createForClass(Group);
GroupSchema.index({ tenantId: 1, type: 1 });
