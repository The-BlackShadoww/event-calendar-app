CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"scheduled_at" timestamp with time zone NOT NULL,
	"status" varchar(50) DEFAULT 'PENDING' NOT NULL,
	"bull_job_id" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "status_check" CHECK ("events"."status" IN ('PENDING', 'ACTIVE', 'CANCELLED_SCHEDULE', 'CANCELLED'))
);
--> statement-breakpoint
CREATE INDEX "status_idx" ON "events" USING btree ("status");--> statement-breakpoint
CREATE INDEX "scheduled_at_idx" ON "events" USING btree ("scheduled_at");--> statement-breakpoint
CREATE INDEX "status_scheduled_at_idx" ON "events" USING btree ("status","scheduled_at");