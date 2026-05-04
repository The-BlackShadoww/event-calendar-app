// This file aggregates all Drizzle schemas.
// Drizzle requires a single object containing all schema definitions for its relations API.
// e.g., export * from './users.schema';

import { sql, type InferSelectModel, type InferInsertModel } from 'drizzle-orm';
import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  check,
  index,
} from 'drizzle-orm/pg-core';

export const events = pgTable(
  'events',
  {
    // The id is a serial primary key. We use serial because it is an auto-incrementing integer, which provides fast lookups and efficient indexing.
    id: serial('id').primaryKey(),

    // The title column is a varchar(255) to limit the text length for standard titles. It cannot be null because every event needs a name.
    title: varchar('title', { length: 255 }).notNull(),

    // The description is a text column because descriptions can be long and varying in length, and text handles large strings without a strict upper limit. It is nullable because a description might not be provided.
    description: text('description'),

    // scheduledAt stores the event schedule time. We use timestamp with timezone to correctly handle users across different timezones, and mode: 'date' to work with JS Date objects natively in our code. It is not null as scheduled events require a time.
    scheduledAt: timestamp('scheduled_at', {
      mode: 'date',
      withTimezone: true,
    }).notNull(),

    // The status defines the lifecycle of an event. varchar(50) is sufficient for state names. It defaults to 'PENDING' for newly created events.
    status: varchar('status', { length: 50 }).notNull().default('PENDING'),

    // bullJobId stores a reference to a background task (BullMQ job) created for this event. It's nullable since not all events might have an active job. This helps in cancelling scheduled tasks if the event is cancelled.
    bullJobId: varchar('bull_job_id', { length: 255 }),

    // createdAt records when the row was inserted. We use timestamp with timezone to maintain accurate historical logs, defaulting to the current time.
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow(),

    // updatedAt records when the row was last changed. We initialize it with the current time, and it will be updated by the application or a trigger whenever the record is modified.
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    // This check constraint ensures that our application cannot insert invalid string values into the status column.
    check(
      'status_check',
      sql`${table.status} IN ('PENDING', 'ACTIVE', 'CANCELLED_SCHEDULE', 'CANCELLED')`,
    ),

    // An index on the status column allows us to quickly filter and fetch events by their current state without scanning the whole table.
    index('status_idx').on(table.status),

    // An index on the scheduledAt column is crucial for calendar apps, enabling fast date range queries (e.g. finding events within a specific month).
    index('scheduled_at_idx').on(table.scheduledAt),

    // A composite index on status and scheduledAt is useful when we need to find events of a certain status ordered by date, or occurring within a specific time window.
    index('status_scheduled_at_idx').on(table.status, table.scheduledAt),
  ],
);

export type Event = InferSelectModel<typeof events>;
export type CreateEvent = InferInsertModel<typeof events>;
