ALTER TABLE "simple_quotes" ADD PRIMARY KEY ("symbol");--> statement-breakpoint
ALTER TABLE "simple_quotes" ALTER COLUMN "symbol" SET DATA TYPE varchar(12);