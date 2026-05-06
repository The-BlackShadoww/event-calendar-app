import {
  BadRequestException,
  Injectable,
  Inject,
  forwardRef,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EventsRepository } from './events.repository';
import { CreateEventDto } from './dto/create-event.dto';
import { type Event } from '../database/schema';
import { QueueService } from '../queue/queue.service';

//! EventsService method + state transition diagram
// ----------------------------------------------
// Read-only methods:
//   findAll(filters) : [ANY STATUS] -> [SAME STATUS] (no mutation)
//   findOne(id)      : [ANY STATUS] -> [SAME STATUS] (no mutation, 404 if missing)
//
// State-changing methods:
//   create(dto):
//     (new record) -> PENDING
//     then schedules BullMQ activation job and stores bullJobId
//
//   activateEvent(eventId):
//     PENDING --activateEvent()--> ACTIVE
//     side effect: bullJobId -> null
//
//   completeEvent(eventId):
//     ACTIVE --completeEvent()--> COMPLETED
//
//   deleteEvent(id):
//     [ANY STATUS] -> deleted row
//     side effects: remove BullMQ activation/completion jobs for the event
//
//   cancelSchedule(id):
//     PENDING --cancelSchedule()--> CANCELLED_SCHEDULE
//     side effects: remove BullMQ delayed job, bullJobId -> null
//     invalid from ACTIVE/CANCELLED_SCHEDULE/CANCELLED -> BadRequestException
//
//   cancelEvent(id):
//     ACTIVE|PENDING|CANCELLED_SCHEDULE --cancelEvent()--> CANCELLED
//     side effects: for PENDING remove BullMQ delayed job, updatedAt -> now()
//     invalid from CANCELLED -> BadRequestException
//
// High-level lifecycle:
//   CREATE -> PENDING -> ACTIVE -> CANCELLED
//                 \-> CANCELLED_SCHEDULE
//
// Terminal states in current flow:
//   CANCELLED_SCHEDULE, CANCELLED

@Injectable()
export class EventsService {
  /*
   * Logger
   *
   * What it does:
   * NestJS provides a built-in Logger class that standardizes how our application writes to the console.
   * Instead of using standard 'console.log()', the Logger offers better formatting (timestamps, color coding),
   * and allows us to easily control different log levels (like 'error', 'warn', 'debug') based on our environment.
   * By passing 'EventsService.name' as the context, every log message from this file will be prefixed
   * with "[EventsService]", making it incredibly easy to trace where logs originated from in the terminal.
   */
  private readonly logger = new Logger(EventsService.name);

  constructor(
    private readonly eventsRepository: EventsRepository,
    @Inject(forwardRef(() => QueueService))
    private readonly queueService: QueueService,
  ) {}

  async create(dto: CreateEventDto): Promise<Event> {
    try {
      // Enriching the user-provided DTO with the initial internal state before saving
      const eventData = {
        ...dto,
        ticketPrice:
          dto.ticketPrice === undefined
            ? undefined
            : dto.ticketPrice.toString(),
        endedAt: new Date(dto.endedAt),
        status: 'PENDING',
      };

      // Step 1: Database Insertion
      // We must create the event first to get its auto-generated database ID.
      // This ID is required as part of the job payload so the worker knows which event to process,
      // and it's used to generate a deterministic jobId (e.g., 'event-5').
      const event = await this.eventsRepository.create(eventData);

      // Step 2: Queue Scheduling
      // Now that we have the event ID and its scheduled time, we enqueue a delayed job in Redis.
      // This job will sit in the queue and won't be processed until the delay has passed.
      // We capture the returned Job instance to get its tracking ID.
      const job = await this.queueService.scheduleEventActivation(
        event.id,
        event.scheduledAt,
      );

      await this.queueService.scheduleEventCompletion(
        event.id,
        new Date(dto.endedAt), // ! what?
      );

      // Step 3: Database Update
      // With the job successfully scheduled, we update the original event record
      // to store the BullMQ job ID. This allows us to track, modify, or cancel
      // the scheduled job in the future if the event is updated or deleted.
      const updatedEvent = await this.eventsRepository.update(event.id, {
        bullJobId: job.id,
      });

      // Finally, return the fully populated event object.
      return updatedEvent;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Failed to create event with title "${dto.title}": ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error(
          `Failed to create event with title "${dto.title}": ${String(error)}`,
        );
      }
      throw new InternalServerErrorException(
        'An error occurred while creating the event',
      );
    }
  }

  async findAll(filters?: {
    status?: string;
    from?: Date;
    to?: Date;
  }): Promise<Event[]> {
    return this.eventsRepository.findAll(filters);
  }

  async findOne(id: number): Promise<Event> {
    const event = await this.eventsRepository.findById(id);

    if (!event) {
      // We throw an exception here instead of returning null to enforce a clear separation of concerns.
      // The Repository's job is purely data access: it returns null when a database row doesn't exist.
      // However, the Service layer handles business rules. If a client asks for a specific event by ID,
      // its absence is an error state in the business flow.
      // By throwing a NotFoundException here, NestJS automatically catches it and formats it into
      // a proper 404 HTTP response, preventing our Controller from needing repetitive null checks.
      throw new NotFoundException(`Event with id ${id} not found`);
    }

    return event;
  }

  async activateEvent(eventId: number): Promise<Event> {
    return this.eventsRepository.updateStatus(eventId, 'ACTIVE', {
      bullJobId: null,
    });
  }

  async completeEvent(eventId: number): Promise<Event> {
    return this.eventsRepository.update(eventId, {
      status: 'COMPLETED',
      updatedAt: new Date(),
    });
  }

  async deleteEvent(id: number): Promise<Event> {
    const event = await this.findOne(id);
    const jobIds = new Set([
      event.bullJobId,
      `event-${id}-activate`,
      `event-${id}-complete`,
    ]);

    await Promise.all(
      [...jobIds].map((jobId) => this.queueService.removeScheduledJob(jobId)),
    );

    const deletedEvent = await this.eventsRepository.delete(id);

    if (!deletedEvent) {
      throw new NotFoundException(`Event with id ${id} not found`);
    }

    return deletedEvent;
  }

  async cancelSchedule(id: number): Promise<Event> {
    const event = await this.eventsRepository.findById(id);

    if (!event) {
      throw new NotFoundException(`Event with id ${id} not found`);
    }

    if (event.status !== 'PENDING') {
      throw new BadRequestException(
        `Schedule cancellation is only allowed for events in status PENDING. Current status: ${event.status}.`,
      );
    }

    await this.queueService.removeScheduledJob(event.bullJobId ?? '');
    await this.queueService.removeScheduledJob(`event-${id}-complete`);

    return this.eventsRepository.update(id, {
      status: 'CANCELLED_SCHEDULE',
      bullJobId: null,
      updatedAt: new Date(),
    });
  }

  async cancelEvent(id: number): Promise<Event> {
    const event = await this.eventsRepository.findById(id);

    if (!event) {
      throw new NotFoundException(`Event with id ${id} not found`);
    }

    if (event.status === 'CANCELLED' || event.status === 'COMPLETED') {
      throw new BadRequestException(
        `Cannot cancel event with status '${event.status}'.`,
      );
    }

    if (event.status === 'PENDING') {
      await this.queueService.removeScheduledJob(event.bullJobId ?? '');
    }

    if (event.status === 'ACTIVE') {
      await this.queueService.removeScheduledJob(`event-${id}-complete`);
    }

    return this.eventsRepository.update(id, {
      status: 'CANCELLED',
      bullJobId: null,
      updatedAt: new Date(),
    });
  }
}
