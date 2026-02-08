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
import { CommunityService } from '../services/community.service';
import {
  CreateCommunityProgramDto,
  CreateVolunteerProgramDto,
  UpdateProgramDto,
  QueryProgramDto,
} from '../dtos/create-program.dto';
import { JwtAuthGuard } from '@common/guards';
import { CurrentUser, TenantId } from '@common/decorators';
import { PaginationDto } from '@common/dtos';
import { ParseObjectIdPipe } from '@common/pipes';

@ApiTags('Community')
@Controller('community')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@ApiSecurity('tenant-id')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  // ========== GET ALL PROGRAMS ==========

  @Get('programs')
  @ApiOperation({ summary: 'Get all programs (community + volunteer)' })
  async getPrograms(@Query() query: QueryProgramDto) {
    return this.communityService.getPrograms('', query);
  }

  @Get('programs/tenants/:id')
  @ApiOperation({
    summary: 'Get all programs (community + volunteer) by tenant Id',
  })
  async getProgramsByTenantId(
    @TenantId() tenantId: string,
    @Query() query: QueryProgramDto,
  ) {
    return this.communityService.getPrograms(tenantId, query);
  }

  @Get('programs/community')
  @ApiOperation({ summary: 'Get community programs only' })
  async getCommunityPrograms(
    @TenantId() tenantId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.communityService.getCommunityPrograms(
      tenantId,
      paginationDto.page,
      paginationDto.limit,
    );
  }

  @Get('programs/volunteer')
  @ApiOperation({ summary: 'Get volunteer programs only' })
  async getVolunteerPrograms(
    @TenantId() tenantId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.communityService.getVolunteerPrograms(
      tenantId,
      paginationDto.page,
      paginationDto.limit,
    );
  }

  @Get('programs/categories')
  @ApiOperation({ summary: 'Get all program categories' })
  async getCategories(@TenantId() tenantId: string) {
    const categories = await this.communityService.getCategories(tenantId);
    return { data: categories };
  }

  // ========== GET SINGLE PROGRAM ==========

  @Get('programs/:id')
  @ApiOperation({ summary: 'Get program by ID' })
  async getProgramById(
    @TenantId() tenantId: string,
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    return this.communityService.getProgramById(tenantId, id);
  }

  // ========== CREATE PROGRAMS ==========

  @Post('programs/community')
  @ApiOperation({ summary: 'Create a community program' })
  async createCommunityProgram(
    @TenantId() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateCommunityProgramDto,
  ) {
    return this.communityService.createCommunityProgram(tenantId, userId, dto);
  }

  @Post('programs/volunteer')
  @ApiOperation({ summary: 'Create a volunteer program' })
  async createVolunteerProgram(
    @TenantId() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateVolunteerProgramDto,
  ) {
    return this.communityService.createVolunteerProgram(tenantId, userId, dto);
  }

  // ========== UPDATE PROGRAM ==========

  @Put('programs/:id')
  @ApiOperation({ summary: 'Update a program' })
  async updateProgram(
    @TenantId() tenantId: string,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateProgramDto,
  ) {
    return this.communityService.updateProgram(tenantId, id, dto);
  }

  // ========== DELETE PROGRAM ==========

  @Delete('programs/:id')
  @ApiOperation({ summary: 'Delete a program' })
  async deleteProgram(
    @TenantId() tenantId: string,
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    await this.communityService.deleteProgram(tenantId, id);
    return { message: 'Program deleted successfully' };
  }
}
