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
}: {
	uploadId?: string;
}) {
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [files, setFiles] = useState<File[]>([]);
	const uploadInputRef = useRef<HTMLInputElement>(null);

	const handleSubmit = () => {
		if (input.trim() || files.length > 0) {
			setIsLoading(true);
			setTimeout(() => {
				setIsLoading(false);
				setInput("");
				setFiles([]);
			}, 2000);
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
			isLoading={isLoading}
			onSubmit={handleSubmit}
			className="min-h-25 w-full rounded-xl shadow-none">
			{files.length > 0 && (
				<div className="flex flex-wrap gap-2 pb-2">
					{files.map((file, index) => (
						<div
							key={`${file.name}-${index}`}
							className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm"
							onClick={(event) => event.stopPropagation()}>
							<Paperclip className="size-4" />
							<span className="max-w-30 truncate">{file.name}</span>
							<button
								type="button"
								onClick={() => handleRemoveFile(index)}
								className="rounded-full p-1 hover:bg-secondary/50">
								<X className="size-4" />
							</button>
						</div>
					))}
				</div>
			)}

			<PromptInputTextarea placeholder="Write a reply..." />

			<PromptInputActions className="flex items-center justify-between gap-2 pt-2">
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
					<Button variant="default" size="sm" onClick={handleSubmit}>
						Reply
					</Button>
				</PromptInputAction>
			</PromptInputActions>
		</PromptInput>
	);
}
