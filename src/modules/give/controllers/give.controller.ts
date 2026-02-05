import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { GiveService } from '../services/give.service';
import { CreateDonationDto } from '../dtos/create-donation.dto';
import { JwtAuthGuard, RolesGuard } from '@common/guards';
import { Roles, CurrentUser, TenantId } from '@common/decorators';
import { Role } from '@common/constants/roles.constants';
import { PaginationDto } from '@common/dtos';

@ApiTags('Give')
@Controller('give')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@ApiSecurity('tenant-id')
export class GiveController {
  constructor(private readonly giveService: GiveService) {}

  @Post('donate')
  @ApiOperation({ summary: 'Make a donation' })
  async createDonation(
    @TenantId() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() createDonationDto: CreateDonationDto,
  ) {
    return this.giveService.createDonation(tenantId, userId, createDonationDto);
  }

  @Get('my-donations')
  @ApiOperation({ summary: 'Get my donation history' })
  async getMyDonations(@CurrentUser('userId') userId: string, @Query() paginationDto: PaginationDto) {
    return this.giveService.getUserDonations(userId, paginationDto.page, paginationDto.limit);
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles(Role.CHURCH_ADMIN)
  @ApiOperation({ summary: 'Get donation statistics' })
  async getStats(@TenantId() tenantId: string) {
    return this.giveService.getTenantStats(tenantId);
  }
}
