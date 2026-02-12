import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type CommunityProgramDocument = CommunityProgram & Document;

export enum ProgramType {
  COMMUNITY = 'community',
  VOLUNTEER = 'volunteer',
}

@Schema({ timestamps: true, collection: 'community_programs' })
export class CommunityProgram {
  @ApiProperty({ description: 'Tenant ID' })
  @Prop({ type: Types.ObjectId, required: true, index: true })
  tenantId: Types.ObjectId;

  @ApiProperty({ description: 'Program type', enum: ProgramType })
  @Prop({ required: true, enum: ProgramType, default: ProgramType.COMMUNITY })
  type: ProgramType;

  @ApiProperty({ description: 'Program title' })
  @Prop({ required: true, trim: true })
  title: string;

  @ApiProperty({ description: 'Program category' })
  @Prop({ required: true, trim: true })
  category: string;

  @ApiProperty({ description: 'Program description' })
  @Prop({ required: true })
  description: string;

  @ApiProperty({ description: 'Program image URL' })
  @Prop()
  image: string;

  @ApiProperty({ description: 'Contact email (for community programs)' })
  @Prop()
  contact: string;

  // Volunteer program specific fields
  @ApiProperty({ description: 'Church name (for volunteer programs)' })
  @Prop()
  church: string;

  @ApiProperty({ description: 'Time commitment (for volunteer programs)' })
  @Prop()
  timeCommitment: string;

  @ApiProperty({ description: 'Skills needed (for volunteer programs)' })
  @Prop({ type: [String], default: [] })
  skillsNeeded: string[];

  @ApiProperty({ description: 'Coordinator contact (for volunteer programs)' })
  @Prop()
  coordinator: string;

  @ApiProperty({ description: 'Coordinator user ID' })
  @Prop({ type: Types.ObjectId })
  coordinatorId: Types.ObjectId;

  @ApiProperty({ description: 'Is program active' })
  @Prop({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Created by user ID' })
  @Prop({ type: Types.ObjectId })
  createdBy: Types.ObjectId;

  @ApiProperty()
    @Prop()
    createdAt: Date;
}

export const CommunityProgramSchema = SchemaFactory.createForClass(CommunityProgram);

CommunityProgramSchema.index({ tenantId: 1, type: 1 });
CommunityProgramSchema.index({ tenantId: 1, category: 1 });
CommunityProgramSchema.index({ tenantId: 1, isActive: 1 });
