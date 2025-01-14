CREATE TABLE IF NOT EXISTS "filter_group_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"filter_group_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "filter_group_tags" ADD CONSTRAINT "filter_group_tags_filter_group_id_filter_groups_id_fk" FOREIGN KEY ("filter_group_id") REFERENCES "public"."filter_groups"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "filter_group_tags" ADD CONSTRAINT "filter_group_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
