import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DenominationService } from './denomination.service';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe';

@ApiTags('Denominations')
@Controller('denominations')
export class DenominationController {
  constructor(private readonly denominationService: DenominationService) {}

  @Get()
  @ApiOperation({ summary: 'Get all denominations' })
  @ApiResponse({ status: 200, description: 'List of denominations' })
  async findAll() {
    const denominations = await this.denominationService.findAll();
    return {
      data: denominations,
      total: denominations.length,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get denomination by ID' })
  @ApiResponse({ status: 200, description: 'Denomination details' })
  async findById(@Param('id', ParseObjectIdPipe) id: string) {
    const denomination = await this.denominationService.findById(id);
    return { data: denomination };
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get denomination by slug' })
  @ApiResponse({ status: 200, description: 'Denomination details' })
  async findBySlug(@Param('slug') slug: string) {
    const denomination = await this.denominationService.findBySlug(slug);
    return { data: denomination };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new denomination' })
  @ApiResponse({ status: 201, description: 'Denomination created' })
  async create(@Body() data: any) {
    const denomination = await this.denominationService.create(data);
    return { data: denomination };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a denomination' })
  @ApiResponse({ status: 200, description: 'Denomination updated' })
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() data: any,
  ) {
    const denomination = await this.denominationService.update(id, data);
    return { data: denomination };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a denomination' })
  @ApiResponse({ status: 204, description: 'Denomination deleted' })
  async delete(@Param('id', ParseObjectIdPipe) id: string) {
    await this.denominationService.delete(id);
  }
}
