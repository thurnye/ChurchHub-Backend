import { ServiceTime } from './../tenant/entities/tenant.entity';
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
      paginationDto.search,
    );

    // console.log('MAPPED:::', result.data.map((church) => this.mapDiscoverListItem(church)))

    return {
      data: result.data.map((church) => this.mapDiscoverListItem(church)),
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

  private getClosestService(serviceTimes) {
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];

    const todayIndex = new Date().getDay();

    return serviceTimes
      .map((service) => ({
        service,
        diff: (days.indexOf(service.day) - todayIndex + 7) % 7,
      }))
      .sort((a, b) => a.diff - b.diff)[0].service;
  }

  private mapDiscoverListItem(church: any) {
    try {
      const formattedAddress = [
        church.address.street,
        church.address.city,
        church.address.state,
        church.address.zipCode,
      ]
        .filter(Boolean)
        .join(', ');

      //get the latest day

      const closest = this.getClosestService(church.serviceTimes);

      console.log('closest:::', closest);
      //  console.log('nextService:::', nextService);

      return {
        id: church._id?.toString() || church.id,
        name: church.name,
        denomination: church.denomination || 'Non-Denominational',
        distance: '0 mi', // Would need geolocation to calculate
        nextService: `${closest.day} ${closest.time}`,
        image: church.coverImage,
        address: formattedAddress || 'Address not provided',
        phone: church.phone || '',
        hasLivestream: church.settings?.enableSermons || false,
      };
    } catch (error) {
      console.log('ERROR:::', error);
    }
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

    // Default pastor and clergy data
    const defaultPastor = {
      id: 'pastor-1',
      name: 'Pastor',
      role: 'Senior Pastor',
      photo:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      email: church.email || '',
      bio: 'Leading our congregation with faith and dedication.',
      phone: church.phone || '',
    };

    const defaultClergy = [
      {
        id: 'clergy-1',
        name: 'Associate Pastor',
        role: 'Associate Pastor',
        photo:
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
        email: church.email || '',
        bio: '',
        phone: '',
      },
    ];

    return {
      id: church._id?.toString() || church.id,
      name: church.name,
      denomination: church.denomination || 'Non-Denominational',
      distance: '0 mi', // Would need geolocation to calculate
      nextService: 'Sunday 10:00 AM', // Would need service schedule feature
      image:
        church.coverImage ||
        church.logo ||
        'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800',
      description: church.description || 'Welcome to our church community.',
      mission:
        church.description ||
        'To serve God and our community with love and faith.',
      vision:
        church.description || 'Building a community of faith, hope, and love.',
      address: formattedAddress || 'Address not provided',
      phone: church.phone || '',
      email: church.email || '',
      website: church.website || '',
      lat: address.lat || 0, // Would need geolocation
      lng: address.lng || 0, // Would need geolocation
      hasLivestream: church.settings?.enableSermons || false,
      leadership: {},
      pastor: defaultPastor,
      clergy: defaultClergy,
      serviceTimes: [
        { day: 'Sunday', time: '10:00 AM', type: 'Morning Worship' },
        { day: 'Sunday', time: '6:00 PM', type: 'Evening Service' },
        { day: 'Wednesday', time: '7:00 PM', type: 'Bible Study' },
      ],
      ministries: [
        'Youth Ministry',
        'Worship',
        'Outreach',
        "Children's Ministry",
      ],
      accentColor: church.branding?.primaryColor || '#4F46E5',
      parkingInfo: 'Free parking available on site.',
      accessibilityInfo:
        'Wheelchair accessible. ASL interpretation available upon request.',
      officeHours: 'Monday - Friday: 9:00 AM - 5:00 PM',
      membersCount: church.memberCount || 0,
      memberCount: church.memberCount || 0,
      isVerified: church.status === 'active',
      postsCount: 0,
    };
  }
}
