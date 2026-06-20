CREATE TABLE `comment_attachment` (
	`id` text PRIMARY KEY NOT NULL,
	`comment_id` text NOT NULL,
	`url` text NOT NULL,
	`filename` text NOT NULL,
	`mime_type` text NOT NULL,
	`size` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`comment_id`) REFERENCES `comment`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE INDEX `comment_attachment_commentId_idx` ON `comment_attachment` (`comment_id`);
