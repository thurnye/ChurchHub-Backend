import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type DonationDocument = Donation & Document;

export enum DonationType {
  TITHE = 'tithe',
  OFFERING = 'offering',
  SPECIAL = 'special',
  MISSION = 'mission',
  BUILDING = 'building',
}

export enum DonationStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  CARD = 'card',
  BANK_TRANSFER = 'bank_transfer',
  CASH = 'cash',
  CHECK = 'check',
}

@Schema({ timestamps: true })
export class Donation {
  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @ApiProperty()
  @Prop({ required: true })
  amount: number;

  @ApiProperty()
  @Prop({ default: 'USD' })
  currency: string;

  @ApiProperty()
  @Prop({ type: String, enum: DonationType, required: true })
  type: DonationType;

  @ApiProperty()
  @Prop({ type: String, enum: PaymentMethod, required: true })
  paymentMethod: PaymentMethod;

  @ApiProperty()
  @Prop({ type: String, enum: DonationStatus, default: DonationStatus.PENDING })
  status: DonationStatus;

  @ApiProperty()
  @Prop()
  stripePaymentIntentId: string;

  @ApiProperty()
  @Prop()
  reference: string;

  @ApiProperty()
  @Prop({ default: false })
  isAnonymous: boolean;

  @ApiProperty()
  @Prop({ default: false })
  isRecurring: boolean;

  @ApiProperty()
  @Prop()
  recurringFrequency: string;

  @ApiProperty()
  @Prop()
  notes: string;

  @ApiProperty()
  @Prop()
  createdAt: Date;

  @ApiProperty()
  @Prop()
  updatedAt: Date;
}

export const DonationSchema = SchemaFactory.createForClass(Donation);
DonationSchema.index({ tenantId: 1, createdAt: -1 });
DonationSchema.index({ userId: 1, createdAt: -1 });
