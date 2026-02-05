import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { MembershipRole } from './membership.entity';

export type JoinCodeDocument = JoinCode & Document;

@Schema({ timestamps: true, collection: 'join_codes' })
export class JoinCode {
  @ApiProperty({ description: 'Tenant ID' })
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true, index: true })
  tenantId: Types.ObjectId;

  @ApiProperty({ description: 'Unique join code' })
  @Prop({ required: true, unique: true, uppercase: true })
  code: string;

  @ApiProperty({ description: 'Role granted when using this code', enum: MembershipRole })
  @Prop({ type: String, enum: MembershipRole, default: MembershipRole.MEMBER })
  roleGranted: MembershipRole;

  @ApiProperty({ description: 'Code expiration date' })
  @Prop()
  expiresAt?: Date;

  @ApiProperty({ description: 'Maximum number of uses' })
  @Prop()
  maxUses?: number;

  @ApiProperty({ description: 'Current usage count' })
  @Prop({ default: 0 })
  usageCount: number;

  @ApiProperty({ description: 'Whether the code is active' })
  @Prop({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Description/name for the code' })
  @Prop()
  description?: string;

  @ApiProperty({ description: 'Created by user ID' })
  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;
}

export const JoinCodeSchema = SchemaFactory.createForClass(JoinCode);

JoinCodeSchema.index({ code: 1 }, { unique: true });
JoinCodeSchema.index({ tenantId: 1, isActive: 1 });
JoinCodeSchema.index({ expiresAt: 1 });
