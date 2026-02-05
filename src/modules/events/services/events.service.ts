import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EventRepository } from '../repositories/event.repository';
import { CreateEventDto } from '../dtos/create-event.dto';
import { PaginationUtil } from '@common/utils';

@Injectable()
export class EventsService {
  constructor(private readonly eventRepository: EventRepository) {}

  async create(tenantId: string, createEventDto: CreateEventDto) {
    return this.eventRepository.create({
      tenantId,
      ...createEventDto,
      attendees: [],
    } as any);
  }

  async findAll(tenantId: string, page: number, limit: number) {
    const skip = PaginationUtil.getSkip(page, limit);
    const [data, total] = await Promise.all([
      this.eventRepository.findUpcoming(tenantId, skip, limit),
      this.eventRepository.count({ tenantId, startDate: { $gte: new Date() } } as any),
    ]);

    return PaginationUtil.paginate(data, total, { page, limit });
  }

  async findOne(id: string) {
    const event = await this.eventRepository.findById(id);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async register(eventId: string, userId: string) {
    const event = await this.findOne(eventId);

    if (!event.requiresRegistration) {
      throw new BadRequestException('This event does not require registration');
    }

    const attendees = event.attendees || [];

    if (attendees.some((id) => id.toString() === userId)) {
      throw new BadRequestException('Already registered for this event');
    }

    if (event.maxAttendees && attendees.length >= event.maxAttendees) {
      throw new BadRequestException('Event is full');
    }

    attendees.push(userId as any);
    return this.eventRepository.update(eventId, { attendees } as any);
  }

  async unregister(eventId: string, userId: string) {
    const event = await this.findOne(eventId);
    const attendees = event.attendees || [];
    const filtered = attendees.filter((id) => id.toString() !== userId);

    return this.eventRepository.update(eventId, { attendees: filtered } as any);
  }

  async delete(id: string) {
    await this.findOne(id);
    await this.eventRepository.delete(id);
  }
}
