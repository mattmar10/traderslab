CREATE TABLE IF NOT EXISTS "quotes" (
	"symbol" varchar(20) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"price" numeric(18, 4) NOT NULL,
	"changes_percentage" numeric(10, 4) NOT NULL,
	"change" numeric(18, 4) NOT NULL,
	"day_low" numeric(18, 4) NOT NULL,
	"day_high" numeric(18, 4) NOT NULL,
	"year_high" numeric(18, 4) NOT NULL,
	"year_low" numeric(18, 4) NOT NULL,
	"market_cap" numeric(24, 4),
	"exchange" varchar(20) NOT NULL,
	"volume" numeric(18, 4) NOT NULL,
	"avg_volume" numeric(18, 4) NOT NULL,
	"open" numeric(18, 4) NOT NULL,
	"previous_close" numeric(18, 4) NOT NULL,
	"earnings_announcement" varchar(30),
	"shares_outstanding" numeric(18, 4),
	"timestamp" bigint NOT NULL
);
--> statement-breakpoint
DROP TABLE "simple_quotes";