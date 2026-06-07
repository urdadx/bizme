"use client";

import { Button } from "@/components/ui/button";
import { Paperclip, X } from "lucide-react";
import { useRef, useState } from "react";
import {
	PromptInput,
	PromptInputTextarea,
	PromptInputActions,
	PromptInputAction,
} from "./ui/prompt-input";
import { GalleryLinear } from "@/assets/icons/gallery-icon";

export function ComposerPreview() {
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

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.files) {
			const newFiles = Array.from(event.target.files);
			setFiles((prev) => [...prev, ...newFiles]);
		}
	};

	const handleRemoveFile = (index: number) => {
		setFiles((prev) => prev.filter((_, i) => i !== index));
		if (uploadInputRef?.current) {
			uploadInputRef.current.value = "";
		}
	};

	return (
		<PromptInput
			value={input}
			onValueChange={setInput}
			isLoading={isLoading}
			onSubmit={handleSubmit}
			className="w-150 shadow-none rounded-xl h-25 max-w-xl">
			{files.length > 0 && (
				<div className="flex flex-wrap gap-2 pb-2">
					{files.map((file, index) => (
						<div
							key={index}
							className="bg-secondary flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
							onClick={(e) => e.stopPropagation()}>
							<Paperclip className="size-4" />
							<span className="max-w-30 truncate">{file.name}</span>
							<button
								onClick={() => handleRemoveFile(index)}
								className="hover:bg-secondary/50 rounded-full p-1">
								<X className="size-4" />
							</button>
						</div>
					))}
				</div>
			)}

			<PromptInputTextarea placeholder="Write a comment..." />

			<PromptInputActions className="flex items-center justify-between gap-2 pt-2">
				<PromptInputAction tooltip="Attach files">
					<label
						htmlFor="file-upload"
						className="hover:bg-secondary-foreground/10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-2xl">
						<input
							type="file"
							multiple
							onChange={handleFileChange}
							className="hidden"
							id="file-upload"
						/>
						<GalleryLinear
							color="currentColor"
							className="text-primary size-5"
						/>
					</label>
				</PromptInputAction>

				<PromptInputAction tooltip={"Submit comment"}>
					<Button
						variant="default"
						size="sm"
						className=""
						onClick={handleSubmit}>
						Comment
					</Button>
				</PromptInputAction>
			</PromptInputActions>
		</PromptInput>
	);
}
