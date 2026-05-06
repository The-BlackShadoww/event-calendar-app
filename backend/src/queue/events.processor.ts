import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Inject, Logger, NotFoundException, forwardRef } from '@nestjs/common';
import { EventsService } from '../events/events.service';

@Processor('events')
export class EventsProcessor extends WorkerHost {
  private readonly logger = new Logger(EventsProcessor.name);

  constructor(
    @Inject(forwardRef(() => EventsService))
    private readonly eventsService: EventsService,
  ) {
    super();
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    this.logger.log(`Processing ${job.name} job ${job.id}`);
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { eventId } = job.data as { eventId: number };

    if (!eventId) {
      throw new Error('No eventId provided in job data');
    }

    if (job.name === 'activate-event') {
      try {
        this.logger.log(`Activation job ${job.id} fired for event ${eventId}.`);
        await this.eventsService.activateEvent(eventId);
        this.logger.log(
          `Activation job ${job.id} set event ${eventId} ACTIVE.`,
        );
        return;
      } catch (error) {
        this.logger.error(
          `Activation job ${job.id} failed for event ${eventId}.`,
          error instanceof Error ? error.stack : undefined,
        );
        throw error;
      }
    }

    if (job.name === 'complete-event') {
      try {
        this.logger.log(`Completion job ${job.id} fired for event ${eventId}.`);

        const event = await this.eventsService.findOne(eventId);

        if (event.status !== 'ACTIVE') {
          this.logger.warn(
            `Completion job ${job.id} skipped because event ${eventId} is ${event.status}, not ACTIVE.`,
          );
          return;
        }

        await this.eventsService.completeEvent(eventId);

        this.logger.log(
          `Completion job ${job.id} set event ${eventId} COMPLETED.`,
        );
        return;
      } catch (error) {
        if (error instanceof NotFoundException) {
          this.logger.warn(
            `Completion job ${job.id} skipped because event ${eventId} was not found.`,
          );
          return;
        }

        this.logger.error(
          `Completion job ${job.id} failed for event ${eventId}.`,
          error instanceof Error ? error.stack : undefined,
        );
        throw error;
      }
    }

    this.logger.warn(
      `Received unsupported job type "${job.name}" for job ${job.id}.`,
    );
  }
}
