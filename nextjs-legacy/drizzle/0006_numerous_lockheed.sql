PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`amount` real NOT NULL,
	`currencyId` integer NOT NULL,
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
ALTER TABLE `__new_transactions` RENAME TO `transactions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;