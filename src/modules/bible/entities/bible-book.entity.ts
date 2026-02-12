import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type BibleBookDocument = BibleBook & Document;

@Schema({ timestamps: true, collection: 'bible_books' })
export class BibleBook {
  @ApiProperty({ description: 'Book ID (e.g., GEN, EXO, MAT)' })
  @Prop({ required: true, unique: true, index: true })
  bookId: string;

  @ApiProperty({ description: 'Book name' })
  @Prop({ required: true, trim: true })
  name: string;

  @ApiProperty({ description: 'Local book name' })
  @Prop({ trim: true })
  nameLocal?: string;

  @ApiProperty({ description: 'Book abbreviation' })
  @Prop({ trim: true })
  abbreviation?: string;

  @ApiProperty({ description: 'Testament (Old Testament / New Testament)' })
  @Prop({ required: true })
  testament: string;

  @ApiProperty({ description: 'Number of chapters in the book' })
  @Prop({ required: true })
  chapters: number;

  @ApiProperty({ description: 'Book order in the Bible' })
  @Prop()
  order?: number;
}

export const BibleBookSchema = SchemaFactory.createForClass(BibleBook);

BibleBookSchema.index({ order: 1 });
BibleBookSchema.index({ testament: 1 });
BibleBookSchema.index({ name: 1 });
