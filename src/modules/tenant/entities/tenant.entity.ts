import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type TenantDocument = Tenant & Document;

export enum TenantStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  TRIAL = 'trial',
  EXPIRED = 'expired',
}

export enum SubscriptionPlan {
  FREE = 'free',
  BASIC = 'basic',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
}

interface ServiceTimes {
  day: string;
  time: string;
  type: string;
  [key: string]: string | number;
}

@Schema({ _id: false })
export class ServiceTime {
  @ApiProperty()
  @Prop({ required: true })
  day: string;

  @ApiProperty()
  @Prop({ required: true })
  time: string;

  @ApiProperty()
  @Prop({ required: true })
  type: string;
}

export const ServiceTimeSchema = SchemaFactory.createForClass(ServiceTime);

@Schema({ timestamps: true })
export class Tenant {
  @ApiProperty()
  @Prop({ required: true, unique: true })
  name: string;

  @ApiProperty()
  @Prop({ required: true, unique: true })
  slug: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Denomination' })
  denominationId: Types.ObjectId;

  @ApiProperty()
  @Prop()
  denomination: string; // Store denomination name for quick access

  @ApiProperty()
  @Prop({ required: true, unique: true })
  joinCode: string;

  @ApiProperty()
  @Prop()
  description: string;

  @ApiProperty()
  @Prop()
  logo: string;

  @ApiProperty()
  @Prop()
  coverImage: string;

  @ApiProperty()
  @Prop({ type: Object })
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };

  @ApiProperty()
  @Prop()
  phone: string;

  @ApiProperty()
  @Prop()
  email: string;

  @ApiProperty()
  @Prop()
  website: string;

  @ApiProperty()
  @Prop({ type: [String] })
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };

  @ApiProperty({ type: [ServiceTime] })
  @Prop({ type: [ServiceTimeSchema], default: [] })
  serviceTimes: ServiceTime[];

  @ApiProperty()
  @Prop({ type: String, enum: TenantStatus, default: TenantStatus.ACTIVE })
  status: TenantStatus;

  @ApiProperty()
  @Prop({
    type: String,
    enum: SubscriptionPlan,
    default: SubscriptionPlan.FREE,
  })
  subscriptionPlan: SubscriptionPlan;

  @ApiProperty()
  @Prop()
  subscriptionExpiresAt: Date;

  @ApiProperty()
  @Prop({ type: Object })
  settings: {
    allowPublicRegistration: boolean;
    requireEmailVerification: boolean;
    requirePhoneVerification: boolean;
    enableDonations: boolean;
    enableEvents: boolean;
    enableGroups: boolean;
    enablePrayer: boolean;
    enableSermons: boolean;
    enableBible: boolean;
    timezone: string;
    language: string;
  };

  @ApiProperty()
  @Prop({ type: Object })
  branding: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
  };

  @ApiProperty()
  @Prop({ default: 0 })
  memberCount: number;

  @ApiProperty()
  @Prop()
  createdAt: Date;

  @ApiProperty()
  @Prop()
  updatedAt: Date;
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);

// Indexes
TenantSchema.index({ slug: 1 });
TenantSchema.index({ joinCode: 1 });
TenantSchema.index({ status: 1 });
TenantSchema.index({ denominationId: 1 });
TenantSchema.index({ denomination: 1 });
