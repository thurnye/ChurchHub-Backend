import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsDateString,
  IsMongoId,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class WorshipSetItemDto {
  @ApiProperty({ description: 'Resource ID' })
  @IsMongoId()
  resourceId: string;

  @ApiProperty({ description: 'Order in the set', example: 1 })
  @IsNumber()
  @Min(0)
  order: number;

  @ApiPropertyOptional({ description: 'Key override for this instance' })
  @IsString()
  @IsOptional()
  keyOverride?: string;

  @ApiPropertyOptional({ description: 'Notes for this item' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateWorshipSetDto {
  @ApiProperty({ description: 'Set title', example: 'Sunday Morning Worship' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Scheduled date/time' })
  @IsDateString()
  @IsOptional()
  scheduledAt?: string;

  @ApiPropertyOptional({ description: 'Event ID to link to' })
  @IsMongoId()
  @IsOptional()
  eventId?: string;

  @ApiPropertyOptional({ description: 'Items in the set', type: [WorshipSetItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorshipSetItemDto)
  @IsOptional()
  items?: WorshipSetItemDto[];

  @ApiPropertyOptional({ description: 'Worship leader user ID' })
  @IsMongoId()
  @IsOptional()
  leaderId?: string;

  @ApiPropertyOptional({ description: 'Team member user IDs', type: [String] })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  teamMembers?: string[];

  @ApiPropertyOptional({ description: 'Notes for the team' })
  @IsString()
  @IsOptional()
  notes?: string;
}
