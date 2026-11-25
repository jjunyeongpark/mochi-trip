CREATE TABLE `monthly_spend` (
	`month` text PRIMARY KEY NOT NULL,
	`amount` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `trips` (
	`id` text PRIMARY KEY NOT NULL,
	`payload` text NOT NULL,
	`created` integer NOT NULL,
	`expires` integer NOT NULL
);
