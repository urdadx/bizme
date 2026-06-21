"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
	PromptInput,
	PromptInputTextarea,
	PromptInputActions,
	PromptInputAction,
} from "./ui/prompt-input";
import { GalleryLinear } from "@/assets/icons/gallery-icon";
import type { CustomizationSettingsValue } from "./customization/customize-settings";

export function ComposerPreview({ customization }: { customization?: CustomizationSettingsValue }) {
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [files, setFiles] = useState<File[]>([]);
	const [previews, setPreviews] = useState<string[]>([]);
	const uploadInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const newPreviews = files.map((file) => URL.createObjectURL(file));
		setPreviews(newPreviews);

		return () => {
			for (const url of newPreviews) {
				URL.revokeObjectURL(url);
			}
		};
	}, [files]);

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
			style={{ color: customization?.textColor }}
			className="flex flex-col w-full max-w-xl shadow-none rounded-xl min-h-25">
			{files.length > 0 && (
				<div className="flex flex-wrap gap-2 pb-2">
					{files.map((file, index) => (
						<div
							key={index}
							className="group relative h-20 w-20 overflow-hidden rounded-lg border bg-secondary"
							onClick={(e) => e.stopPropagation()}>
							<img
								src={previews[index]}
								alt={file.name}
								className="h-full w-full object-cover"
							/>
							<button
								onClick={() => handleRemoveFile(index)}
								className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100">
								<X className="size-3" />
							</button>
						</div>
					))}
				</div>
			)}

			<PromptInputTextarea placeholder="Write a comment..." className="flex-1" />

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
							color={customization?.brandColor ?? "currentColor"}
							className="text-primary size-5"
						/>
					</label>
				</PromptInputAction>

				<PromptInputAction tooltip={"Submit comment"}>
					<Button
						variant="default"
						size="sm"
						style={{ backgroundColor: customization?.brandColor }}
						className=""
						onClick={handleSubmit}>
						Comment
					</Button>
				</PromptInputAction>
			</PromptInputActions>
		</PromptInput>
	);
}
