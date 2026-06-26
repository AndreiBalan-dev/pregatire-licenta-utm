CREATE TABLE "challenge_answers" (
	"id" serial PRIMARY KEY NOT NULL,
	"lobby_code" varchar(24) NOT NULL,
	"player_id" integer NOT NULL,
	"question_id" integer NOT NULL,
	"selected" varchar(1) NOT NULL,
	"is_correct" boolean NOT NULL,
	"time_ms" integer DEFAULT 0 NOT NULL,
	"points_awarded" numeric DEFAULT '0' NOT NULL,
	"answered_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "challenge_lobbies" (
	"code" varchar(24) PRIMARY KEY NOT NULL,
	"host_token_hash" varchar(64) NOT NULL,
	"mode" varchar(16) NOT NULL,
	"status" varchar(16) DEFAULT 'lobby' NOT NULL,
	"config" jsonb NOT NULL,
	"question_ids" jsonb,
	"current_index" integer DEFAULT 0 NOT NULL,
	"question_started_at" timestamp with time zone,
	"ip_hash" varchar(64) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "challenge_players" (
	"id" serial PRIMARY KEY NOT NULL,
	"lobby_code" varchar(24) NOT NULL,
	"player_token_hash" varchar(64) NOT NULL,
	"name" varchar(20) NOT NULL,
	"is_host" boolean DEFAULT false NOT NULL,
	"score" numeric DEFAULT '0' NOT NULL,
	"correct_count" integer DEFAULT 0 NOT NULL,
	"answered_count" integer DEFAULT 0 NOT NULL,
	"total_time_ms" integer DEFAULT 0 NOT NULL,
	"question_order" jsonb,
	"option_order" jsonb,
	"finished_at" timestamp with time zone,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" varchar(16) DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_sessions" (
	"key" varchar(24) PRIMARY KEY NOT NULL,
	"display_name" varchar(50),
	"session_data" jsonb NOT NULL,
	"total_answered" integer DEFAULT 0 NOT NULL,
	"total_correct" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_hash" varchar(64) NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_challenge_answers_player" ON "challenge_answers" USING btree ("player_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_challenge_answer" ON "challenge_answers" USING btree ("player_id","question_id");--> statement-breakpoint
CREATE INDEX "idx_challenge_lobbies_ip_hash" ON "challenge_lobbies" USING btree ("ip_hash");--> statement-breakpoint
CREATE INDEX "idx_challenge_players_lobby" ON "challenge_players" USING btree ("lobby_code");--> statement-breakpoint
CREATE INDEX "idx_challenge_players_token" ON "challenge_players" USING btree ("player_token_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_challenge_player_name" ON "challenge_players" USING btree ("lobby_code","name");--> statement-breakpoint
CREATE INDEX "idx_saved_sessions_ip_hash" ON "saved_sessions" USING btree ("ip_hash");