import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { WorshipResourceRepository } from '../repositories/worship-resource.repository';
import { WorshipSetRepository } from '../repositories/worship-set.repository';
import { CreateWorshipResourceDto } from '../dtos/create-worship-resource.dto';
import { UpdateWorshipResourceDto } from '../dtos/update-worship-resource.dto';
import { CreateWorshipSetDto } from '../dtos/create-worship-set.dto';
import { UpdateWorshipSetDto } from '../dtos/update-worship-set.dto';
import { QueryWorshipResourceDto, QueryWorshipSetDto } from '../dtos/query-worship.dto';
import { WorshipResourceDocument } from '../entities/worship-resource.entity';
import { WorshipSetDocument } from '../entities/worship-set.entity';
import { QueuePublisher } from '../../../infrastructure/queue/queue.publishers';
import { EventNames } from '../../../common/constants/events.constants';

@Injectable()
export class WorshipsService {
  private readonly logger = new Logger(WorshipsService.name);

  constructor(
    private readonly resourceRepository: WorshipResourceRepository,
    private readonly setRepository: WorshipSetRepository,
    private readonly queuePublisher: QueuePublisher,
  ) {}

  // Resource methods
  async createResource(
    tenantId: string,
    dto: CreateWorshipResourceDto,
    userId: string,
  ): Promise<WorshipResourceDocument> {
    const resource = await this.resourceRepository.create(tenantId, dto, userId);
    this.logger.log(`Worship resource created: ${resource._id} in tenant ${tenantId}`);
    return resource;
  }

  async findResourceById(tenantId: string, id: string): Promise<WorshipResourceDocument> {
    const resource = await this.resourceRepository.findById(tenantId, id);
    if (!resource) {
      throw new NotFoundException('Worship resource not found');
    }
    return resource;
  }

  async findAllResources(
    tenantId: string,
    query: QueryWorshipResourceDto,
  ): Promise<{ data: WorshipResourceDocument[]; total: number; page: number; limit: number }> {
    const { data, total } = await this.resourceRepository.findAll(tenantId, query);
    return {
      data,
      total,
      page: query.page || 1,
      limit: query.limit || 10,
    };
  }

  async updateResource(
    tenantId: string,
    id: string,
    dto: UpdateWorshipResourceDto,
  ): Promise<WorshipResourceDocument> {
    const resource = await this.resourceRepository.update(tenantId, id, dto);
    if (!resource) {
      throw new NotFoundException('Worship resource not found');
    }
    this.logger.log(`Worship resource updated: ${id} in tenant ${tenantId}`);
    return resource;
  }

  async deleteResource(tenantId: string, id: string): Promise<void> {
    const deleted = await this.resourceRepository.delete(tenantId, id);
    if (!deleted) {
      throw new NotFoundException('Worship resource not found');
    }
    this.logger.log(`Worship resource deleted: ${id} in tenant ${tenantId}`);
  }

  async archiveResource(tenantId: string, id: string): Promise<WorshipResourceDocument> {
    const resource = await this.resourceRepository.archive(tenantId, id);
    if (!resource) {
      throw new NotFoundException('Worship resource not found');
    }
    this.logger.log(`Worship resource archived: ${id} in tenant ${tenantId}`);
    return resource;
  }

  async getResourceTags(tenantId: string): Promise<string[]> {
    return this.resourceRepository.findTags(tenantId);
  }

  async getResourceKeys(tenantId: string): Promise<string[]> {
    return this.resourceRepository.findKeys(tenantId);
  }

  // Set methods
  async createSet(
    tenantId: string,
    dto: CreateWorshipSetDto,
    userId: string,
  ): Promise<WorshipSetDocument> {
    const set = await this.setRepository.create(tenantId, dto, userId);
    this.logger.log(`Worship set created: ${set._id} in tenant ${tenantId}`);
    return set;
  }

  async findSetById(tenantId: string, id: string): Promise<WorshipSetDocument> {
    const set = await this.setRepository.findById(tenantId, id);
    if (!set) {
      throw new NotFoundException('Worship set not found');
    }
    return set;
  }

  async findAllSets(
    tenantId: string,
    query: QueryWorshipSetDto,
  ): Promise<{ data: WorshipSetDocument[]; total: number; page: number; limit: number }> {
    const { data, total } = await this.setRepository.findAll(tenantId, query);
    return {
      data,
      total,
      page: query.page || 1,
      limit: query.limit || 10,
    };
  }

  async updateSet(
    tenantId: string,
    id: string,
    dto: UpdateWorshipSetDto,
  ): Promise<WorshipSetDocument> {
    const set = await this.setRepository.update(tenantId, id, dto);
    if (!set) {
      throw new NotFoundException('Worship set not found');
    }
    this.logger.log(`Worship set updated: ${id} in tenant ${tenantId}`);
    return set;
  }

  async deleteSet(tenantId: string, id: string): Promise<void> {
    const deleted = await this.setRepository.delete(tenantId, id);
    if (!deleted) {
      throw new NotFoundException('Worship set not found');
    }
    this.logger.log(`Worship set deleted: ${id} in tenant ${tenantId}`);
  }

  async publishSet(tenantId: string, id: string): Promise<WorshipSetDocument> {
    const existingSet = await this.findSetById(tenantId, id);

    if (existingSet.isPublished) {
      return existingSet;
    }

    const set = await this.setRepository.publish(tenantId, id);
    if (!set) {
      throw new NotFoundException('Worship set not found');
    }

    // Publish event
    try {
      await this.queuePublisher.publish(EventNames.WORSHIP_SET_SCHEDULED, {
        tenantId,
        setId: set._id.toString(),
        title: set.title,
        scheduledAt: set.scheduledAt?.toISOString(),
      });
      this.logger.log(`WorshipSetScheduled event sent for set ${set._id}`);
    } catch (error) {
      this.logger.error(`Failed to publish WorshipSetScheduled event: ${error.message}`);
    }

    return set;
  }

  async getUpcomingSets(tenantId: string, limit: number = 5): Promise<WorshipSetDocument[]> {
    return this.setRepository.findUpcoming(tenantId, limit);
  }
}
