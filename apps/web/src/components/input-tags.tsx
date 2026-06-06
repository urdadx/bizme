"use client";

import { type Tag, TagInput } from "emblor";
import { useId, useState } from "react";

const tags = [
	{
		id: "1",
		text: "Sport",
	},
	{
		id: "2",
		text: "Coding",
	},
	{
		id: "3",
		text: "Travel",
	},
];

type InputTagsProps = {
	label?: string;
	placeholder?: string;
	defaultTags?: Tag[];
	showAttribution?: boolean;
};

export function InputTags({ defaultTags = tags }: InputTagsProps) {
	const id = useId();
	const [exampleTags, setExampleTags] = useState<Tag[]>(defaultTags);
	const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);

	return (
		<div className="*:not-first:mt-2">
			{/* <Label htmlFor={id}>{label}</Label> */}
			<TagInput
				activeTagIndex={activeTagIndex}
				id={id}
				setActiveTagIndex={setActiveTagIndex}
				setTags={(newTags) => {
					setExampleTags(newTags);
				}}
				styleClasses={{
					inlineTagsContainer:
						"border-input rounded-md bg-background  focus-within:border-ring outline-none focus-within:ring focus-within:ring-ring/50 p-1 gap-1",
					input: "w-full min-w-[80px] shadow-none px-2 h-7",
					tag: {
						body: "h-7 relative bg-background border border-input hover:bg-background rounded-md font-medium text-xs ps-2 pe-7",
						closeButton:
							"absolute -inset-y-px -end-px p-0 rounded-e-md flex size-7 transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] text-muted-foreground/80 hover:text-foreground",
					},
				}}
				tags={exampleTags}
			/>
		</div>
	);
}
