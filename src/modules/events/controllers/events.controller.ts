import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { EventsService } from '../services/events.service';
import { CreateEventDto } from '../dtos/create-event.dto';
import { JwtAuthGuard, RolesGuard } from '@common/guards';
import { Roles, CurrentUser, TenantId } from '@common/decorators';
import { Role } from '@common/constants/roles.constants';
import { PaginationDto } from '@common/dtos';
import { ParseObjectIdPipe } from '@common/pipes';

@ApiTags('Events')
@Controller('events')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@ApiSecurity('tenant-id')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.LEADER)
  @ApiOperation({ summary: 'Create an event' })
  async create(@TenantId() tenantId: string, @Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(tenantId, createEventDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all upcoming events' })
  async findAll(@TenantId() tenantId: string, @Query() paginationDto: PaginationDto) {
    return this.eventsService.findAll(tenantId, paginationDto.page, paginationDto.limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event by ID' })
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.eventsService.findOne(id);
  }

  @Post(':id/register')
  @ApiOperation({ summary: 'Register for an event' })
  async register(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.eventsService.register(id, userId);
  }

  @Delete(':id/register')
  @ApiOperation({ summary: 'Unregister from an event' })
  async unregister(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.eventsService.unregister(id, userId);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.LEADER)
  @ApiOperation({ summary: 'Delete an event' })
  async delete(@Param('id', ParseObjectIdPipe) id: string) {
    await this.eventsService.delete(id);
    return { message: 'Event deleted successfully' };
  }
}
