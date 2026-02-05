import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { SermonRepository } from '../repositories/sermon.repository';
import { CreateSermonDto } from '../dtos/create-sermon.dto';
import { UpdateSermonDto } from '../dtos/update-sermon.dto';
import { QuerySermonDto } from '../dtos/query-sermon.dto';
import { SermonDocument } from '../entities/sermon.entity';
import { QueuePublisher } from '../../../infrastructure/queue/queue.publishers';
import { EventNames } from '../../../common/constants/events.constants';

@Injectable()
export class SermonsService {
  private readonly logger = new Logger(SermonsService.name);

  constructor(
    private readonly sermonRepository: SermonRepository,
    private readonly queuePublisher: QueuePublisher,
  ) {}

  async create(
    tenantId: string,
    dto: CreateSermonDto,
    userId: string,
  ): Promise<SermonDocument> {
    const sermon = await this.sermonRepository.create(tenantId, dto, userId);

    if (sermon.isPublished) {
      await this.publishSermonEvent(tenantId, sermon);
    }

    this.logger.log(`Sermon created: ${sermon._id} in tenant ${tenantId}`);
    return sermon;
  }

  async findById(tenantId: string, id: string): Promise<SermonDocument> {
    const sermon = await this.sermonRepository.findById(tenantId, id);
    if (!sermon) {
      throw new NotFoundException('Sermon not found');
    }
    return sermon;
  }

  async findAll(
    tenantId: string,
    query: QuerySermonDto,
  ): Promise<{ data: SermonDocument[]; total: number; page: number; limit: number }> {
    const { data, total } = await this.sermonRepository.findAll(tenantId, query);
    return {
      data,
      total,
      page: query.page || 1,
      limit: query.limit || 10,
    };
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateSermonDto,
  ): Promise<SermonDocument> {
    const existing = await this.findById(tenantId, id);
    const wasPublished = existing.isPublished;

    const sermon = await this.sermonRepository.update(tenantId, id, dto);
    if (!sermon) {
      throw new NotFoundException('Sermon not found');
    }

    // Publish event if sermon is being published for the first time
    if (!wasPublished && sermon.isPublished) {
      await this.publishSermonEvent(tenantId, sermon);
    }

    this.logger.log(`Sermon updated: ${id} in tenant ${tenantId}`);
    return sermon;
  }

  async delete(tenantId: string, id: string): Promise<void> {
    const deleted = await this.sermonRepository.delete(tenantId, id);
    if (!deleted) {
      throw new NotFoundException('Sermon not found');
    }
    this.logger.log(`Sermon deleted: ${id} in tenant ${tenantId}`);
  }

  async incrementViewCount(tenantId: string, id: string): Promise<void> {
    await this.sermonRepository.incrementViewCount(tenantId, id);
  }

  async getSpeakers(tenantId: string): Promise<string[]> {
    return this.sermonRepository.findSpeakers(tenantId);
  }

  async getTags(tenantId: string): Promise<string[]> {
    return this.sermonRepository.findTags(tenantId);
  }

  async publish(tenantId: string, id: string): Promise<SermonDocument> {
    const sermon = await this.findById(tenantId, id);

    if (sermon.isPublished) {
      return sermon;
    }

    const updated = await this.sermonRepository.update(tenantId, id, {
      isPublished: true,
    });

    if (updated) {
      await this.publishSermonEvent(tenantId, updated);
    }

    return updated!;
  }

  private async publishSermonEvent(
    tenantId: string,
    sermon: SermonDocument,
  ): Promise<void> {
    try {
      await this.queuePublisher.publish(EventNames.SERMON_PUBLISHED, {
        tenantId,
        sermonId: sermon._id.toString(),
        title: sermon.title,
        speaker: sermon.speaker,
      });
      this.logger.log(`SermonPublished event sent for sermon ${sermon._id}`);
    } catch (error) {
      this.logger.error(`Failed to publish SermonPublished event: ${error.message}`);
    }
  }
}
