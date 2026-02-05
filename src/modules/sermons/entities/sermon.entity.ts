import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type SermonDocument = Sermon & Document;

@Schema({ timestamps: true, collection: 'sermons' })
export class Sermon {
  @ApiProperty({ description: 'Tenant ID' })
  @Prop({ type: Types.ObjectId, required: true, index: true })
  tenantId: Types.ObjectId;

  @ApiProperty({ description: 'Sermon title' })
  @Prop({ required: true, trim: true })
  title: string;

  @ApiProperty({ description: 'Speaker name' })
  @Prop({ required: true, trim: true })
  speaker: string;

  @ApiProperty({ description: 'Sermon date' })
  @Prop({ required: true })
  date: Date;

  @ApiProperty({ description: 'Sermon description/summary' })
  @Prop({ trim: true })
  description?: string;

  @ApiProperty({ description: 'Sermon notes content' })
  @Prop()
  notes?: string;

  @ApiProperty({ description: 'Media URL (video/audio)' })
  @Prop()
  mediaUrl?: string;

  @ApiProperty({ description: 'Thumbnail URL' })
  @Prop()
  thumbnailUrl?: string;

  @ApiProperty({ description: 'Tags for categorization' })
  @Prop({ type: [String], default: [] })
  tags: string[];

  @ApiProperty({ description: 'Scripture references' })
  @Prop({ type: [String], default: [] })
  scriptureReferences: string[];

  @ApiProperty({ description: 'Duration in seconds' })
  @Prop()
  duration?: number;

  @ApiProperty({ description: 'Whether sermon is published' })
  @Prop({ default: false })
  isPublished: boolean;

  @ApiProperty({ description: 'Published date' })
  @Prop()
  publishedAt?: Date;

  @ApiProperty({ description: 'View count' })
  @Prop({ default: 0 })
  viewCount: number;

  @ApiProperty({ description: 'Created by user ID' })
  @Prop({ type: Types.ObjectId })
  createdBy: Types.ObjectId;
}

export const SermonSchema = SchemaFactory.createForClass(Sermon);

SermonSchema.index({ tenantId: 1, date: -1 });
SermonSchema.index({ tenantId: 1, speaker: 1 });
SermonSchema.index({ tenantId: 1, tags: 1 });
SermonSchema.index({ tenantId: 1, isPublished: 1 });
