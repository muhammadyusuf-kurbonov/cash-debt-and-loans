PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_contact` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`fullName` text NOT NULL,
	`email` text,
	`phone` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`deleted` integer DEFAULT false NOT NULL,
	`balance` real DEFAULT 0 NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_contact`("id", "fullName", "email", "phone", "createdAt", "updatedAt", "deleted", "balance") SELECT "id", "fullName", "email", "phone", "createdAt", "updatedAt", "deleted", "balance" FROM `contact`;--> statement-breakpoint
DROP TABLE `contact`;--> statement-breakpoint
ALTER TABLE `__new_contact` RENAME TO `contact`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`amount` real NOT NULL,
	`currencyId` integer,
	`description` text,
	`contact` integer,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`cancelled` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`currencyId`) REFERENCES `currency`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`contact`) REFERENCES `contact`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_transactions`("id", "amount", "currencyId", "description", "contact", "createdAt", "updatedAt", "cancelled") SELECT "id", "amount", "currencyId", "description", "contact", "createdAt", "updatedAt", "cancelled" FROM `transactions`;--> statement-breakpoint
DROP TABLE `transactions`;--> statement-breakpoint
ALTER TABLE `__new_transactions` RENAME TO `transactions`;