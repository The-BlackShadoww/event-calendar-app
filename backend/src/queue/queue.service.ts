import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class QueueService {
  /*
   * Constructor
   *
   * What it does:
   * Injects the 'events' queue into this service using BullMQ's @InjectQueue decorator.
   * This gives us an instance of the queue that we can interact with (e.g., adding or
   * removing jobs) which points directly to our Redis store under the 'events' namespace.
   */
  constructor(@InjectQueue('events') private eventsQueue: Queue) {}

  /*
   * Schedule Event Activation
   *
   * What it does:
   * Calculates the time difference between right now and the desired 'scheduledAt' date.
   * It then adds a new delayed job to the 'events' queue. We use a deterministic jobId
   * (e.g., 'event-5') so that if we try to schedule the same event again, BullMQ ignores
   * the duplicate. The job won't be processed by our worker until the delay has passed.
   *
   * Returns the scheduled Job object so the caller can capture its generated ID.
   */
  async scheduleEventActivation(eventId: number, scheduledAt: Date) {
    const now = new Date().getTime();
    const delay = scheduledAt.getTime() - now;

    return await this.eventsQueue.add(
      'activate-event', // The name of the job
      { eventId }, // The job data payload
      {
        jobId: `event-${eventId}`,
        delay: Math.max(0, delay), // Ensure we don't pass a negative delay
      },
    );
  }

  /*
   * Remove Scheduled Job
   *
   * What it does:
   * Looks up an existing job in the queue using its specific, deterministic jobId
   * (e.g., 'event-5'). If the job is found (meaning it hasn't been processed yet or
   * is still in the queue system), it removes it entirely so it will never execute.
   */
  async removeScheduledJob(jobId: string | null) {
    if (!jobId) {
      return;
    }

    const job = await this.eventsQueue.getJob(jobId);
    if (job) {
      await job.remove();
    }
  }
}
