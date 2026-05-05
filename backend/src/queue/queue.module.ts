import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EventsProcessor } from './events.processor';
import { QueueService } from './queue.service';
import { EventsModule } from '../events/events.module';

@Module({
  /*
   * Module Imports
   *
   * What it does:
   * Imports the BullModule and registers a queue named 'events'.
   * BullModule acts as the bridge between our application and Redis,
   * allowing us to define and manage queues. By naming it 'events', we
   * create a specific channel or namespace for our event-related background
   * jobs, which can be imported and used by other modules.
   */
  imports: [
    BullModule.registerQueue({
      name: 'events',
    }),
    forwardRef(() => EventsModule),
  ],
  providers: [EventsProcessor, QueueService],
  exports: [BullModule, QueueService],
})
export class QueueModule {}
