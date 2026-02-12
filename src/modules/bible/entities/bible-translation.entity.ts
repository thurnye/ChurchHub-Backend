import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type BibleTranslationDocument = BibleTranslation & Document;

@Schema({ timestamps: true, collection: 'bible_translations' })
export class BibleTranslation {
  @ApiProperty({ description: 'API.Bible translation ID' })
  @Prop({ required: true, unique: true, index: true })
  externalId: string;

  @ApiProperty({ description: 'Translation name' })
  @Prop({ required: true, trim: true })
  name: string;

  @ApiProperty({ description: 'Translation abbreviation' })
  @Prop({ required: true, trim: true })
  abbreviation: string;

  @ApiProperty({ description: 'Local abbreviation' })
  @Prop({ trim: true })
  abbreviationLocal?: string;

  @ApiProperty({ description: 'Translation description' })
  @Prop({ trim: true })
  description?: string;

  @ApiProperty({ description: 'Local name' })
  @Prop({ trim: true })
  nameLocal?: string;

  @ApiProperty({ description: 'Language information' })
  @Prop({ type: Object })
  languageInfo?: {
    name: string;
    direction: string;
  };
}

export const BibleTranslationSchema = SchemaFactory.createForClass(BibleTranslation);

BibleTranslationSchema.index({ abbreviation: 1 });
