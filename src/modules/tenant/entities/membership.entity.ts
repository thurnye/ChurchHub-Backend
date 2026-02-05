import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type MembershipDocument = Membership & Document;

export enum MembershipRole {
  CHURCH_ADMIN = 'church_admin',
  CLERGY = 'clergy',
  LEADER = 'leader',
  MEMBER = 'member',
}

export enum MembershipStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

@Schema({ timestamps: true, collection: 'memberships' })
export class Membership {
  @ApiProperty({ description: 'Tenant ID' })
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true, index: true })
  tenantId: Types.ObjectId;

  @ApiProperty({ description: 'User ID' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @ApiProperty({ description: 'Role in this tenant', enum: MembershipRole })
  @Prop({ type: String, enum: MembershipRole, default: MembershipRole.MEMBER })
  role: MembershipRole;

  @ApiProperty({ description: 'Membership status', enum: MembershipStatus })
  @Prop({ type: String, enum: MembershipStatus, default: MembershipStatus.ACTIVE })
  status: MembershipStatus;

  @ApiProperty({ description: 'Date joined' })
  @Prop({ default: Date.now })
  joinedAt: Date;

  @ApiProperty({ description: 'Join code used' })
  @Prop()
  joinCodeUsed?: string;

  @ApiProperty({ description: 'Invited by user ID' })
  @Prop({ type: Types.ObjectId, ref: 'User' })
  invitedBy?: Types.ObjectId;

  @ApiProperty({ description: 'Notes about the member' })
  @Prop()
  notes?: string;
}

export const MembershipSchema = SchemaFactory.createForClass(Membership);

// Unique index to prevent duplicate memberships
MembershipSchema.index({ tenantId: 1, userId: 1 }, { unique: true });
MembershipSchema.index({ tenantId: 1, role: 1 });
MembershipSchema.index({ tenantId: 1, status: 1 });
