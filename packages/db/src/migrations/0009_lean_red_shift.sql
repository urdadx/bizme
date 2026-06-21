PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_poll` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`page_id` text,
	`question` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`closes_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`workspace_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`page_id`) REFERENCES `page`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_poll`("id", "workspace_id", "page_id", "question", "status", "closes_at", "created_at", "updated_at") SELECT "id", "workspace_id", "page_id", "question", "status", "closes_at", "created_at", "updated_at" FROM `poll`;--> statement-breakpoint
DROP TABLE `poll`;--> statement-breakpoint
ALTER TABLE `__new_poll` RENAME TO `poll`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `poll_workspaceId_idx` ON `poll` (`workspace_id`);--> statement-breakpoint
CREATE INDEX `poll_pageId_idx` ON `poll` (`page_id`);--> statement-breakpoint
CREATE INDEX `poll_status_idx` ON `poll` (`status`);
