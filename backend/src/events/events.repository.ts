import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/constants';
import type { DrizzleDB } from 'src/database/types';
import { CreateEventDto } from './dto/create-event.dto';
import { events, type Event } from '../database/schema';
import { eq, gte, lte, and, asc, type SQL } from 'drizzle-orm';

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

  async findAll(filters?: {
    status?: string;
    from?: Date;
    to?: Date;
  }): Promise<Event[]> {
    const conditions: SQL[] = [];

    // eq(): Drizzle operator that compiles to a SQL equality check (e.g., `status = ?`).
    if (filters?.status) {
      conditions.push(eq(events.status, filters.status));
    }

    // gte(): Drizzle operator for 'Greater Than or Equal to' (`scheduledAt >= ?`).
    if (filters?.from) {
      conditions.push(gte(events.scheduledAt, filters.from));
    }

    // lte(): Drizzle operator for 'Less Than or Equal to' (`scheduledAt <= ?`).
    if (filters?.to) {
      conditions.push(lte(events.scheduledAt, filters.to));
    }

    // and(): Combines multiple SQL condition expressions with logical AND.
    // If no filters are provided, whereClause is undefined, returning all rows.
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    return this.db
      .select()
      .from(events)
      .where(whereClause)
      .orderBy(asc(events.scheduledAt));
  }

  async findById(id: number): Promise<Event | null> {
    const [event] = await this.db
      .select()
      .from(events)
      .where(eq(events.id, id))
      // .limit(1) instructs the database to stop searching once the first matching row is found.
      // Even though 'id' is a primary key and unique, adding .limit(1) guarantees minimal
      // data transfer and processing, providing a slight performance optimization.
      .limit(1);

    return event || null;
  }

  /**
   * Updates an existing event record in the database.
   *
   * By accepting `Partial<Event>`, this method allows us to perform targeted
   * updates (e.g., just updating the `status` or the `bullJobId`) without
   * requiring the caller to provide the entire, fully-populated event object.
   *
   * SQL-level behavior:
   * - Drizzle compiles this into `UPDATE events SET ... WHERE id = $1 RETURNING *`.
   * - Only columns present in `data` are included in `SET`, so untouched columns remain unchanged.
   * - PostgreSQL executes the update atomically for the matched row and `RETURNING *`
   *   sends the full updated row back in the same round trip.
   */
  async update(id: number, data: Partial<Event>): Promise<Event> {
    const [updatedEvent] = await this.db
      .update(events)
      .set(data)
      .where(eq(events.id, id))
      .returning();

    return updatedEvent;
  }

  async updateStatus(
    id: number,
    status: string,
    extraData?: Partial<Event>,
  ): Promise<Event> {
    return this.update(id, { status, ...extraData });
  }
}
