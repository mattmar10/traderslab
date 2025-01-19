CREATE TABLE IF NOT EXISTS "simple_quotes" (
	"bid_size" integer NOT NULL,
	"ask_price" double precision NOT NULL,
	"volume" integer NOT NULL,
	"ask_size" integer NOT NULL,
	"bid_price" double precision NOT NULL,
	"last_sale_price" double precision NOT NULL,
	"last_sale_size" integer NOT NULL,
	"last_sale_time" bigint NOT NULL,
	"fmp_last" double precision NOT NULL,
	"last_updated" bigint NOT NULL,
	"symbol" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
