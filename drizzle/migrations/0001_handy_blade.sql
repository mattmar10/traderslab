CREATE TABLE IF NOT EXISTS "prerelease_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(320) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "prerelease_users_email_unique" UNIQUE("email")
);
