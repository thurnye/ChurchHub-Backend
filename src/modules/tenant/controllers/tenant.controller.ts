import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';
import { TenantService } from '../services/tenant.service';
import { CreateTenantDto, UpdateTenantDto, JoinTenantDto } from '../dtos';
import { JwtAuthGuard, RolesGuard } from '@common/guards';
import { Roles, Public, CurrentUser } from '@common/decorators';
import { Role } from '@common/constants/roles.constants';
import { PaginationDto } from '@common/dtos';
import { ParseObjectIdPipe } from '@common/pipes';

@ApiTags('Tenants')
@Controller('tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Create a new church' })
  async create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantService.create(createTenantDto);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all churches (Super Admin only)' })
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.tenantService.findAll(paginationDto.page, paginationDto.limit);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get church by ID' })
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.tenantService.findById(id);
  }

  @Get('slug/:slug')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get church by slug' })
  async findBySlug(@Param('slug') slug: string) {
    return this.tenantService.findBySlug(slug);
  }

  @Post('join')
  @Public()
  @ApiOperation({ summary: 'Find church by join code' })
  async findByJoinCode(@Body() joinTenantDto: JoinTenantDto) {
    return this.tenantService.findByJoinCode(joinTenantDto.joinCode);
  }

  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('tenant-id')
  @Roles(Role.CHURCH_ADMIN)
  @ApiOperation({ summary: 'Update church' })
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateTenantDto: UpdateTenantDto,
  ) {
    return this.tenantService.update(id, updateTenantDto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete church (Super Admin only)' })
  async delete(@Param('id', ParseObjectIdPipe) id: string) {
    await this.tenantService.delete(id);
    return { message: 'Church deleted successfully' };
  }

  @Post(':id/regenerate-code')
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('tenant-id')
  @Roles(Role.CHURCH_ADMIN)
  @ApiOperation({ summary: 'Regenerate join code' })
  async regenerateJoinCode(@Param('id', ParseObjectIdPipe) id: string) {
    return this.tenantService.regenerateJoinCode(id);
  }
}
