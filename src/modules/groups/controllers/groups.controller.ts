import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { GroupsService } from '../services/groups.service';
import { CreateGroupDto } from '../dtos/create-group.dto';
import { JwtAuthGuard, RolesGuard } from '@common/guards';
import { Roles, CurrentUser, TenantId } from '@common/decorators';
import { Role } from '@common/constants/roles.constants';
import { PaginationDto } from '@common/dtos';
import { ParseObjectIdPipe } from '@common/pipes';

@ApiTags('Groups')
@Controller('groups')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@ApiSecurity('tenant-id')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.LEADER)
  @ApiOperation({ summary: 'Create a group' })
  async create(
    @TenantId() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() createGroupDto: CreateGroupDto,
  ) {
    return this.groupsService.create(tenantId, userId, createGroupDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all groups' })
  async findAll(@TenantId() tenantId: string, @Query() paginationDto: PaginationDto) {
    return this.groupsService.findAll(tenantId, paginationDto.page, paginationDto.limit);
  }

  @Get('my-groups')
  @ApiOperation({ summary: 'Get my groups' })
  async getMyGroups(@CurrentUser('userId') userId: string) {
    return this.groupsService.getMyGroups(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get group by ID' })
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.groupsService.findOne(id);
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Join a group' })
  async joinGroup(@Param('id', ParseObjectIdPipe) id: string, @CurrentUser('userId') userId: string) {
    return this.groupsService.joinGroup(id, userId);
  }

  @Delete(':id/leave')
  @ApiOperation({ summary: 'Leave a group' })
  async leaveGroup(@Param('id', ParseObjectIdPipe) id: string, @CurrentUser('userId') userId: string) {
    return this.groupsService.leaveGroup(id, userId);
  }
}
