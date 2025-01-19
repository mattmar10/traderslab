CREATE TABLE IF NOT EXISTS "market_breadth_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"timestamp" bigint NOT NULL,
	"data" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "market_breadth_snapshots_timestamp_idx" ON "market_breadth_snapshots" USING btree ("timestamp");