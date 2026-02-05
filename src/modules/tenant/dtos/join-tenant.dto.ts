import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class JoinTenantDto {
  @ApiProperty({ description: 'Church join code', example: 'ABC123' })
  @IsString()
  joinCode: string;
}
