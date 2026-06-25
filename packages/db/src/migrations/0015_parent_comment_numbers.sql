UPDATE `comment` SET `comment_number` = NULL;--> statement-breakpoint
UPDATE `comment`
SET `comment_number` = (
  SELECT COUNT(*)
  FROM `comment` AS numbered_comment
  WHERE numbered_comment.`page_id` = `comment`.`page_id`
    AND numbered_comment.`parent_id` IS NULL
    AND (
      numbered_comment.`created_at` < `comment`.`created_at`
      OR (
        numbered_comment.`created_at` = `comment`.`created_at`
        AND numbered_comment.`id` <= `comment`.`id`
      )
    )
)
WHERE `parent_id` IS NULL;
