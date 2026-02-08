import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TenantService } from '../tenant/services/tenant.service';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe';
import { TenantStatus } from '../tenant/entities/tenant.entity';

@ApiTags('Discover')
@Controller('discover')
export class DiscoverController {
  constructor(private readonly tenantService: TenantService) {}

  @Get('churches')
  @ApiOperation({ summary: 'Discover available churches (public)' })
  @ApiResponse({ status: 200, description: 'List of churches' })
  async discoverChurches(@Query() paginationDto: PaginationDto) {
    const result = await this.tenantService.findPublicChurches(
      paginationDto.page || 1,
      paginationDto.limit || 20,
    );

    return {
      data: result.data.map((church) => this.mapToDiscoverItem(church)),
      meta: result.meta,
    };
  }

  @Get('churches/:id')
  @ApiOperation({ summary: 'Get church details by ID (public)' })
  @ApiResponse({ status: 200, description: 'Church details' })
  async getChurchById(@Param('id', ParseObjectIdPipe) id: string) {
    const church = await this.tenantService.findById(id);
    return {
      data: this.mapToDiscoverItem(church),
    };
  }

  private mapToDiscoverItem(church: any) {
    const address = church.address || {};
    const formattedAddress = [
      address.street,
      address.city,
      address.state,
      address.zipCode,
    ]
      .filter(Boolean)
      .join(', ');

    return {
      id: church._id?.toString() || church.id,
      name: church.name,
      denomination: church.description?.split(' ')[0] || 'Christian',
      distance: '0 mi', // Would need geolocation to calculate
      nextService: 'Sunday 10:00 AM', // Would need service schedule feature
      image: church.coverImage || church.logo || 'https://via.placeholder.com/400x200',
      description: church.description || '',
      mission: church.description || '',
      vision: church.description || '',
      address: formattedAddress || 'Address not provided',
      phone: church.phone || '',
      email: church.email || '',
      website: church.website || '',
      lat: 0, // Would need geolocation
      lng: 0, // Would need geolocation
      hasLivestream: false, // Would need livestream feature
      leadership: {},
      pastor: null,
    };
  }
}
