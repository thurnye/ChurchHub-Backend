import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type DenominationDocument = Denomination & Document;

@Schema({ timestamps: true })
export class Denomination {
  @ApiProperty()
  @Prop({ required: true, unique: true })
  name: string;

  @ApiProperty()
  @Prop({ required: true, unique: true })
  slug: string;

  @ApiProperty()
  @Prop()
  description: string;

  @ApiProperty()
  @Prop({ type: [String] })
  beliefs: string[];

  @ApiProperty()
  @Prop({ default: 0 })
  churchCount: number;

  @ApiProperty()
  @Prop()
  image: string;

  @ApiProperty()
  @Prop({ default: true })
  isActive: boolean;

  @ApiProperty()
  @Prop()
  createdAt: Date;

  @ApiProperty()
  @Prop()
  updatedAt: Date;
}

export const DenominationSchema = SchemaFactory.createForClass(Denomination);

// Indexes
DenominationSchema.index({ slug: 1 });
DenominationSchema.index({ name: 1 });
DenominationSchema.index({ isActive: 1 });
