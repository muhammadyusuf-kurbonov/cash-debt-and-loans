CREATE TABLE `contact` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`firstName` text NOT NULL,
	`lastName` text NOT NULL,
	`email` text,
	`phone` text,
	`createdAt` integer NOT NULL,
	`deleted` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `currency` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`symbol` text NOT NULL,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`amount` integer NOT NULL,
	`currencyId` integer,
	`description` text,
	`contact` integer,
	`createdAt` integer NOT NULL,
	`cancelled` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`currencyId`) REFERENCES `currency`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`contact`) REFERENCES `contact`(`id`) ON UPDATE no action ON DELETE no action
);
