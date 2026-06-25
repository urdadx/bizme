import { useState } from "react";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

export type CommentImageAttachment = {
	id: string;
	url: string;
	filename: string;
};

export function CommentImageDialog({ image }: { image: CommentImageAttachment }) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<button
				type="button"
				className="group block overflow-hidden rounded-lg border bg-muted text-left"
				onClick={() => setOpen(true)}>
				<img
					src={image.url}
					alt={image.filename}
					className="aspect-video w-full object-cover transition-transform group-hover:scale-105"
				/>
			</button>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="max-w-3xl! p-3">
					<DialogHeader className="sr-only">
						<DialogTitle>{image.filename}</DialogTitle>
						<DialogDescription>Comment image preview</DialogDescription>
					</DialogHeader>
					<img
						src={image.url}
						alt={image.filename}
						className="max-h-[80vh] w-full rounded-lg object-contain"
					/>
				</DialogContent>
			</Dialog>
		</>
	);
}
