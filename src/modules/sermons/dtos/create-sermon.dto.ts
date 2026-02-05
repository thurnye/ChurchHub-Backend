import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsDateString,
  IsUrl,
  IsNumber,
  IsBoolean,
  Min,
} from 'class-validator';

export class CreateSermonDto {
  @ApiProperty({ description: 'Sermon title', example: 'Walking in Faith' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Speaker name', example: 'Pastor John Smith' })
  @IsString()
  @IsNotEmpty()
  speaker: string;

  @ApiProperty({ description: 'Sermon date', example: '2024-01-15' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ description: 'Sermon description/summary' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Sermon notes content' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Media URL (video/audio)' })
  @IsUrl()
  @IsOptional()
  mediaUrl?: string;

  @ApiPropertyOptional({ description: 'Thumbnail URL' })
  @IsUrl()
  @IsOptional()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ description: 'Tags for categorization', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ description: 'Scripture references', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  scriptureReferences?: string[];

  @ApiPropertyOptional({ description: 'Duration in seconds' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  duration?: number;

  @ApiPropertyOptional({ description: 'Publish immediately', default: false })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}
