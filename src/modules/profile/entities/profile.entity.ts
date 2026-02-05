import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type ProfileDocument = Profile & Document;

@Schema({ timestamps: true, collection: 'profiles' })
export class Profile {
  @ApiProperty({ description: 'User ID' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @ApiProperty({ description: 'Tenant ID' })
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true, index: true })
  tenantId: Types.ObjectId;

  @ApiProperty({ description: 'Display name' })
  @Prop({ required: true, trim: true })
  displayName: string;

  @ApiProperty({ description: 'Avatar URL' })
  @Prop()
  avatarUrl?: string;

  @ApiProperty({ description: 'Phone number' })
  @Prop()
  phone?: string;

  @ApiProperty({ description: 'Bio/About' })
  @Prop()
  bio?: string;

  @ApiProperty({ description: 'Date of birth' })
  @Prop()
  dateOfBirth?: Date;

  @ApiProperty({ description: 'Address' })
  @Prop({ type: Object })
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };

  @ApiProperty({ description: 'Emergency contact' })
  @Prop({ type: Object })
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };

  @ApiProperty({ description: 'Spiritual interests/ministries' })
  @Prop({ type: [String], default: [] })
  interests: string[];

  @ApiProperty({ description: 'Skills/talents' })
  @Prop({ type: [String], default: [] })
  skills: string[];

  @ApiProperty({ description: 'Profile is public to other members' })
  @Prop({ default: true })
  isPublic: boolean;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);

// Unique index per user per tenant
ProfileSchema.index({ userId: 1, tenantId: 1 }, { unique: true });
ProfileSchema.index({ tenantId: 1, displayName: 'text' });
