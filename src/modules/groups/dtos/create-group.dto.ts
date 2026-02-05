import { IsString, IsEnum, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GroupType } from '../entities/group.entity';

export class CreateGroupDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty({ enum: GroupType })
  @IsEnum(GroupType)
  type: GroupType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  meetingSchedule?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  meetingLocation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  maxMembers?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isOpen?: boolean;
}
