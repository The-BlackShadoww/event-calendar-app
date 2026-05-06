import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Inject, forwardRef } from '@nestjs/common';
import { EventsService } from '../events/events.service';

@Processor('events')
export class EventsProcessor extends WorkerHost {
  constructor(
    @Inject(forwardRef(() => EventsService))
    private readonly eventsService: EventsService,
  ) {
    super();
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    console.log(`Processing job ${job.id}`);
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { eventId } = job.data as { eventId: number };

    if (!eventId) {
      throw new Error('No eventId provided in job data');
    }

    try {
      // Update the event: set status to 'ACTIVE' and clear the bullJobId
      // since the scheduled job is now running/completed.
      await this.eventsService.activateEvent(eventId);

      console.log(`Job ${job.id} completed. Event ${eventId} is now ACTIVE.`);
    } catch (error) {
      // If the update fails, we throw the error.
      // BullMQ catches this and marks the job as failed, allowing for retries.
      console.error(`Job ${job.id} failed to update event ${eventId}:`, error);
      throw error;
    }
  }
}
