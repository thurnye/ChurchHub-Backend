import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from './entities/event.entity';
import { EventRepository } from './repositories/event.repository';
import { EventsService } from './services/events.service';
import { EventsController } from './controllers/events.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
  ],
  controllers: [EventsController],
  providers: [EventsService, EventRepository],
  exports: [EventsService],
})
export class EventsModule {}
