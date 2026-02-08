import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsEnum,
  IsEmail,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ProgramType } from '../entities/program.entity';

export class CreateCommunityProgramDto {
  @ApiProperty({ description: 'Program title', example: 'Community Food Bank' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Program category', example: 'Outreach & Charity' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ description: 'Program description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ description: 'Program image URL' })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({ description: 'Contact email', example: 'foodbank@community.org' })
  @IsEmail()
  @IsNotEmpty()
  contact: string;
}

export class CreateVolunteerProgramDto {
  @ApiProperty({ description: 'Program title', example: 'Sunday School Teacher' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Church name', example: 'Grace Community Church' })
  @IsString()
  @IsNotEmpty()
  church: string;

  @ApiProperty({ description: 'Program description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ description: 'Program image URL' })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({ description: 'Time commitment', example: 'Sundays 9:00-10:30 AM' })
  @IsString()
  @IsNotEmpty()
  timeCommitment: string;

  @ApiProperty({ description: 'Skills needed', type: [String], example: ['Patience', 'Basic Bible knowledge'] })
  @IsArray()
  @IsString({ each: true })
  skillsNeeded: string[];

  @ApiProperty({ description: 'Coordinator email', example: 'coordinator@church.org' })
  @IsString()
  @IsNotEmpty()
  coordinator: string;

  @ApiProperty({ description: 'Program category', example: "Children's Ministry" })
  @IsString()
  @IsNotEmpty()
  category: string;
}

export class UpdateProgramDto {
  @ApiPropertyOptional({ description: 'Program title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Program category' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ description: 'Program description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Program image URL' })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiPropertyOptional({ description: 'Contact email' })
  @IsEmail()
  @IsOptional()
  contact?: string;

  @ApiPropertyOptional({ description: 'Church name' })
  @IsString()
  @IsOptional()
  church?: string;

  @ApiPropertyOptional({ description: 'Time commitment' })
  @IsString()
  @IsOptional()
  timeCommitment?: string;

  @ApiPropertyOptional({ description: 'Skills needed', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  skillsNeeded?: string[];

  @ApiPropertyOptional({ description: 'Coordinator email' })
  @IsString()
  @IsOptional()
  coordinator?: string;
}

export class QueryProgramDto {
  @ApiPropertyOptional({ description: 'Filter by program type', enum: ProgramType })
  @IsEnum(ProgramType)
  @IsOptional()
  type?: ProgramType;

  @ApiPropertyOptional({ description: 'Filter by category' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value) || 1)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value) || 20)
  limit?: number;
}
