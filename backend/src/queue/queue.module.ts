import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EventsProcessor } from './events.processor';
import { QueueService } from './queue.service';
import { EventsModule } from '../events/events.module';

@Module({
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
