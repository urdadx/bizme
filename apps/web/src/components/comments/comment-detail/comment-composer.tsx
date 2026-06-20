import { GalleryLinear } from "@/assets/icons/gallery-icon";
import { Button } from "@/components/ui/button";
import {
	PromptInput,
	PromptInputAction,
	PromptInputActions,
	PromptInputTextarea,
} from "@/components/ui/prompt-input";
import { Paperclip, X } from "lucide-react";
import type { ChangeEvent } from "react";
import { useRef, useState } from "react";

export function CommentComposer({
	uploadId = "comment-file-upload",
	onSubmit,
	isSubmitting = false,
}: {
	uploadId?: string;
	onSubmit?: (body: string) => Promise<void> | void;
	isSubmitting?: boolean;
}) {
	const [input, setInput] = useState("");
	const [files, setFiles] = useState<File[]>([]);
	const uploadInputRef = useRef<HTMLInputElement>(null);

	const handleSubmit = async () => {
		const body = input.trim();

		if (body) {
			await onSubmit?.(body);
			setInput("");
			setFiles([]);

			if (uploadInputRef.current) {
				uploadInputRef.current.value = "";
			}
		}
	};

	const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		if (event.target.files) {
			setFiles((prev) => [...prev, ...Array.from(event.target.files ?? [])]);
		}
	};

	const handleRemoveFile = (index: number) => {
		setFiles((prev) => prev.filter((_, i) => i !== index));
		if (uploadInputRef.current) {
			uploadInputRef.current.value = "";
		}
	};

	return (
		<PromptInput
			value={input}
			onValueChange={setInput}
			isLoading={isSubmitting}
			onSubmit={handleSubmit}
			className="flex min-h-25 w-full flex-col rounded-xl shadow-none">
			{files.length > 0 && (
				<div className="flex w-full flex-wrap gap-2 pb-2">
					{files.map((file, index) => (
						<div
							key={`${file.name}-${index}`}
							className="flex max-w-full items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm"
							onClick={(event) => event.stopPropagation()}>
							<Paperclip className="size-4 shrink-0" />
							<span className="max-w-30 truncate">{file.name}</span>
							<button
								type="button"
								onClick={() => handleRemoveFile(index)}
								className="shrink-0 rounded-full p-1 hover:bg-secondary/50">
								<X className="size-4" />
							</button>
						</div>
					))}
				</div>
			)}

			<PromptInputTextarea placeholder="Write a reply..." className="min-h-0 flex-1" />

			<PromptInputActions className="mt-auto flex w-full items-center justify-between gap-2 pt-2">
				<PromptInputAction tooltip="Attach files">
					<label
						htmlFor={uploadId}
						className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-2xl hover:bg-secondary-foreground/10">
						<input
							ref={uploadInputRef}
							type="file"
							multiple
							onChange={handleFileChange}
							className="hidden"
							id={uploadId}
						/>
						<GalleryLinear color="currentColor" className="size-5 text-primary" />
					</label>
				</PromptInputAction>

				<PromptInputAction tooltip="Submit reply">
					<Button
						variant="default"
						size="sm"
						disabled={isSubmitting || input.trim().length === 0}
						onClick={handleSubmit}>
						{isSubmitting ? "Replying..." : "Reply"}
					</Button>
				</PromptInputAction>
			</PromptInputActions>
		</PromptInput>
	);
}
