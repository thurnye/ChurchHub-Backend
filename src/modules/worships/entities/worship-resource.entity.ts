import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type WorshipResourceDocument = WorshipResource & Document;

export enum WorshipResourceType {
  SONG = 'song',
  SET = 'set',
  RESOURCE = 'resource',
}

@Schema({ timestamps: true, collection: 'worship_resources' })
export class WorshipResource {
  @ApiProperty({ description: 'Tenant ID' })
  @Prop({ type: Types.ObjectId, required: true, index: true })
  tenantId: Types.ObjectId;

  @ApiProperty({ description: 'Resource title' })
  @Prop({ required: true, trim: true })
  title: string;

  @ApiProperty({ description: 'Resource type', enum: WorshipResourceType })
  @Prop({ required: true, enum: WorshipResourceType })
  type: WorshipResourceType;

  @ApiProperty({ description: 'Artist/Author' })
  @Prop({ trim: true })
  artist?: string;

  @ApiProperty({ description: 'Media URL (audio/video/sheet music)' })
  @Prop()
  mediaUrl?: string;

  @ApiProperty({ description: 'Lyrics content' })
  @Prop()
  lyrics?: string;

  @ApiProperty({ description: 'Chord chart content' })
  @Prop()
  chordChart?: string;

  @ApiProperty({ description: 'Key of the song' })
  @Prop()
  key?: string;

  @ApiProperty({ description: 'Tempo (BPM)' })
  @Prop()
  tempo?: number;

  @ApiProperty({ description: 'Duration in seconds' })
  @Prop()
  duration?: number;

  @ApiProperty({ description: 'Tags for categorization' })
  @Prop({ type: [String], default: [] })
  tags: string[];

  @ApiProperty({ description: 'CCLI song number (for licensing)' })
  @Prop()
  ccliNumber?: string;

  @ApiProperty({ description: 'Notes/Instructions' })
  @Prop()
  notes?: string;

  @ApiProperty({ description: 'Created by user ID' })
  @Prop({ type: Types.ObjectId })
  createdBy: Types.ObjectId;

  @ApiProperty({ description: 'Is archived' })
  @Prop({ default: false })
  isArchived: boolean;
}

export const WorshipResourceSchema = SchemaFactory.createForClass(WorshipResource);

WorshipResourceSchema.index({ tenantId: 1, type: 1 });
WorshipResourceSchema.index({ tenantId: 1, tags: 1 });
WorshipResourceSchema.index({ tenantId: 1, title: 'text', artist: 'text' });
