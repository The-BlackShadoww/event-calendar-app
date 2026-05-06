import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class QueueService {
  constructor(@InjectQueue('events') private eventsQueue: Queue) {}

  async scheduleEventActivation(eventId: number, scheduledAt: Date) {
    const now = new Date().getTime();
    const delay = scheduledAt.getTime() - now;

    return await this.eventsQueue.add(
      'activate-event', // The name of the job
      { eventId }, // The job data payload
      {
        jobId: `event-${eventId}`,
        delay: Math.max(0, delay),
      },
    );
  }

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
