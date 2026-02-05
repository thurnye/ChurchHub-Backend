import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsUrl,
  IsNumber,
  IsEnum,
  Min,
} from 'class-validator';
import { WorshipResourceType } from '../entities/worship-resource.entity';

export class CreateWorshipResourceDto {
  @ApiProperty({ description: 'Resource title', example: 'Amazing Grace' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Resource type',
    enum: WorshipResourceType,
    example: WorshipResourceType.SONG,
  })
  @IsEnum(WorshipResourceType)
  type: WorshipResourceType;

  @ApiPropertyOptional({ description: 'Artist/Author', example: 'John Newton' })
  @IsString()
  @IsOptional()
  artist?: string;

  @ApiPropertyOptional({ description: 'Media URL' })
  @IsUrl()
  @IsOptional()
  mediaUrl?: string;

  @ApiPropertyOptional({ description: 'Lyrics content' })
  @IsString()
  @IsOptional()
  lyrics?: string;

  @ApiPropertyOptional({ description: 'Chord chart content' })
  @IsString()
  @IsOptional()
  chordChart?: string;

  @ApiPropertyOptional({ description: 'Key of the song', example: 'G' })
  @IsString()
  @IsOptional()
  key?: string;

  @ApiPropertyOptional({ description: 'Tempo (BPM)', example: 72 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  tempo?: number;

  @ApiPropertyOptional({ description: 'Duration in seconds' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  duration?: number;

  @ApiPropertyOptional({ description: 'Tags for categorization', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ description: 'CCLI song number' })
  @IsString()
  @IsOptional()
  ccliNumber?: string;

  @ApiPropertyOptional({ description: 'Notes/Instructions' })
  @IsString()
  @IsOptional()
  notes?: string;
}
