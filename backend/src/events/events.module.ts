import { Module, forwardRef } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { EventsRepository } from './events.repository';
import { QueueModule } from '../queue/queue.module';

@Module({
  /*
   * Module Imports
   *
   * What it does:
   * Imports the QueueModule to gain access to BullMQ's queue functionality,
   * specifically the QueueService. This allows the EventsService to schedule
   * and manage delayed jobs (like event activations) that are handled by the
   * background worker defined in the QueueModule.
   */
  imports: [forwardRef(() => QueueModule)],
  controllers: [EventsController],
  providers: [EventsService, EventsRepository],
  exports: [EventsService, EventsRepository],
})
export class EventsModule {}
