import { IsNumber, IsEnum, IsBoolean, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DonationType, PaymentMethod } from '../entities/donation.entity';

export class CreateDonationDto {
  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty({ enum: DonationType })
  @IsEnum(DonationType)
  type: DonationType;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
