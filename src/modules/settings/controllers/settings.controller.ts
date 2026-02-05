import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SettingsService } from '../services/settings.service';
import { UpdateTenantSettingsDto } from '../dtos/update-tenant-settings.dto';
import { UpdateUserSettingsDto } from '../dtos/update-user-settings.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { TenantId } from '../../../common/decorators/tenant-id.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Role } from '../../../common/constants/roles.constants';

@ApiTags('Settings')
@ApiBearerAuth()
@Controller('settings')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // Tenant Settings Endpoints

  @Get('tenant')
  @Roles(Role.CHURCH_ADMIN, Role.CLERGY)
  @ApiOperation({ summary: 'Get tenant settings' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Tenant settings retrieved' })
  async getTenantSettings(@TenantId() tenantId: string) {
    const settings = await this.settingsService.getTenantSettings(tenantId);
    return {
      success: true,
      data: settings,
    };
  }

  @Put('tenant')
  @Roles(Role.CHURCH_ADMIN)
  @ApiOperation({ summary: 'Update tenant settings' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Tenant settings updated' })
  async updateTenantSettings(
    @TenantId() tenantId: string,
    @Body() dto: UpdateTenantSettingsDto,
  ) {
    const settings = await this.settingsService.updateTenantSettings(tenantId, dto);
    return {
      success: true,
      data: settings,
    };
  }

  // User Settings Endpoints

  @Get('user')
  @Roles(Role.MEMBER, Role.LEADER, Role.CLERGY, Role.CHURCH_ADMIN)
  @ApiOperation({ summary: 'Get current user settings' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User settings retrieved' })
  async getUserSettings(
    @TenantId() tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    const settings = await this.settingsService.getUserSettings(userId, tenantId);
    return {
      success: true,
      data: settings,
    };
  }

  @Put('user')
  @Roles(Role.MEMBER, Role.LEADER, Role.CLERGY, Role.CHURCH_ADMIN)
  @ApiOperation({ summary: 'Update current user settings' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User settings updated' })
  async updateUserSettings(
    @TenantId() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateUserSettingsDto,
  ) {
    const settings = await this.settingsService.updateUserSettings(
      userId,
      tenantId,
      dto,
    );
    return {
      success: true,
      data: settings,
    };
  }
}
