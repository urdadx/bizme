CREATE TABLE `notification` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`href` text NOT NULL,
	`actor_name` text,
	`actor_avatar` text,
	`read_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`workspace_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `notification_workspaceId_idx` ON `notification` (`workspace_id`);
--> statement-breakpoint
CREATE INDEX `notification_workspaceId_readAt_idx` ON `notification` (`workspace_id`,`read_at`);
