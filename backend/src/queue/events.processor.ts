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

  /*
   * Event Processor Worker
   *
   * This class extends WorkerHost to handle background jobs for the 'events' queue.
   */

  /*
   * Worker Lifecycle Listener (@OnWorkerEvent)
   *
   * What it does:
   * This acts as an event hook. Whenever ANY job on the 'events' queue transitions
   * to the 'active' state (meaning the worker picked it up to start working on it),
   * BullMQ triggers this method. It is used for side-effects like metrics or logging,
   * separated from the actual core job logic.
   */
  @OnWorkerEvent('active')
  onActive(job: Job) {
    console.log(`Processing job ${job.id}`);
  }

  /*
   * The Core Job Handler (process method)
   *
   * What it does:
   * This is the engine that does the actual work. By extending WorkerHost, BullMQ
   * knows that it must call this 'process' method, passing in the job data payload.
   * This is where your heavy lifting and business logic lives. Once this method
   * completes, the job is officially marked as finished in Redis.
   */
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
