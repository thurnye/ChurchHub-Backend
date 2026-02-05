import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, IsEnum, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../../common/dtos/pagination.dto';
import { WorshipResourceType } from '../entities/worship-resource.entity';

export class QueryWorshipResourceDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by type', enum: WorshipResourceType })
  @IsEnum(WorshipResourceType)
  @IsOptional()
  type?: WorshipResourceType;

  @ApiPropertyOptional({ description: 'Filter by tag' })
  @IsString()
  @IsOptional()
  tag?: string;

  @ApiPropertyOptional({ description: 'Search in title/artist' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by key' })
  @IsString()
  @IsOptional()
  key?: string;

  @ApiPropertyOptional({ description: 'Include archived' })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  includeArchived?: boolean;
}

export class QueryWorshipSetDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by date from' })
  @IsDateString()
  @IsOptional()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'Filter by date to' })
  @IsDateString()
  @IsOptional()
  dateTo?: string;

  @ApiPropertyOptional({ description: 'Filter by event ID' })
  @IsString()
  @IsOptional()
  eventId?: string;

  @ApiPropertyOptional({ description: 'Filter by published status' })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isPublished?: boolean;
}
