import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { EventsRepository } from './events.repository';
import { CreateEventDto } from './dto/create-event.dto';
import { type Event } from '../database/schema';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(private readonly eventsRepository: EventsRepository) {}

  async create(dto: CreateEventDto): Promise<Event> {
    try {
      // We enrich the user-provided DTO with the initial internal state before saving
      const eventData = {
        ...dto,
        status: 'PENDING',
      };

      return await this.eventsRepository.create(eventData);
    } catch (error) {
      this.logger.error(
        `Failed to create event with title "${dto.title}": ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'An error occurred while creating the event',
      );
    }
  }
}
