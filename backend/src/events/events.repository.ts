import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/constants';
import type { DrizzleDB } from 'src/database/types';
import { CreateEventDto } from './dto/create-event.dto';
import { events, type Event } from '../database/schema';

@Injectable()
export class EventsRepository {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: DrizzleDB) {}

  /**
   * We require `data: CreateEventDto & { status: string }` instead of just `CreateEventDto`
   * to enforce a strict separation of concerns.
   *
   * 1. Security: The DTO represents exactly what the external client is allowed to send.
   *    We do not want users dictating internal system state like the `status` of an event.
   * 2. Explicit Business Logic: While the database schema has a `.default('PENDING')`
   *    which would technically allow us to insert just the DTO, requiring the status here
   *    forces the Service layer to explicitly decide and enrich the event data before saving.
   *
   * By chaining `.returning()`, we instruct PostgreSQL to return the newly inserted row,
   * including auto-generated fields like `id`, `createdAt`, and `updatedAt`, which we
   * wouldn't have access to otherwise.
   */
  async create(data: CreateEventDto & { status: string }): Promise<Event> {
    const [event] = await this.db.insert(events).values(data).returning();
    return event;
  }
}
