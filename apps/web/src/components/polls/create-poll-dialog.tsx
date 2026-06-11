import { GalleryLinear } from "@/assets/icons/gallery-icon";
import { useState } from "react";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { PlusIcon } from "lucide-react";

const maxChoices = 4;

const createDefaultChoices = () => [
	{ id: "choice-1", value: "" },
	{ id: "choice-2", value: "" },
];

export const CreatePollDialog = () => {
	const [choices, setChoices] = useState(createDefaultChoices);

	const addChoice = () => {
		setChoices((current) => {
			if (current.length >= maxChoices) {
				return current;
			}

			return [...current, { id: `choice-${current.length + 1}`, value: "" }];
		});
	};

	const updateChoice = (id: string, value: string) => {
		setChoices((current) =>
			current.map((choice) => (choice.id === id ? { ...choice, value } : choice)),
		);
	};

	return (
		<>
			<Dialog>
				<DialogTrigger>
					<Button>
						<PlusIcon />
						Create a new poll
					</Button>
				</DialogTrigger>
				<DialogContent className="gap-5 shadow-none sm:max-w-xl">
					<DialogHeader>
						<DialogTitle className="text-xl font-semibold">
							Create a new poll
						</DialogTitle>
					</DialogHeader>

					<div className="flex flex-col gap-2">
						<div className="flex items-start gap-3">
							<Input
								placeholder="Ask a question"
								className="h-auto border-0 px-0 py-1 text-lg font-medium shadow-none outline-none ring-0 placeholder:text-muted-foreground focus-visible:ring-0"
							/>
						</div>

						<div className="flex flex-col gap-3">
							<div className="flex items-center justify-between">
								<h3 className="text-lg font-semibold">Choices</h3>
								<span className="text-xs text-muted-foreground">
									{choices.length}/{maxChoices}
								</span>
							</div>

							{choices.map((choice, index) => (
								<div
									key={choice.id}
									className="flex items-center gap-2">
									<label
										htmlFor={`poll-choice-image-${choice.id}`}
										className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-md border bg-background text-muted-foreground hover:bg-muted">
										<input
											id={`poll-choice-image-${choice.id}`}
											type="file"
											accept="image/*"
											className="hidden"
										/>
										<GalleryLinear className="size-5" />
									</label>
									<Input
										value={choice.value}
										onChange={(event) =>
											updateChoice(
												choice.id,
												event.target.value,
											)
										}
										placeholder={`Choice ${index + 1}`}
										className="h-10 shadow-none"
									/>
								</div>
							))}

							<div className="flex justify-end">
								<Button
									variant="outline"
									size="sm"
									onClick={addChoice}
									disabled={choices.length >= maxChoices}>
									<PlusIcon className="size-4" />
									Add choice
								</Button>
							</div>
						</div>

						<div className="flex flex-col gap-3 ">
							<div className="flex items-center gap-2">
								<h3 className="text-lg font-semibold">
									Poll length
								</h3>
							</div>
							<div className="grid grid-cols-3 gap-3">
								<PollLengthInput label="Days" placeholder="0" />
								<PollLengthInput label="Hours" placeholder="0" />
								<PollLengthInput label="Minutes" placeholder="0" />
							</div>
						</div>

						<DialogFooter className="flex justify-end gap-2 mt-3">
							<DialogClose>
								<Button variant="outline" className="shadow-none">
									Cancel
								</Button>
							</DialogClose>
							<Button className="shadow-none">Create poll</Button>
						</DialogFooter>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
};

function PollLengthInput({ label, placeholder }: { label: string; placeholder: string }) {
	return (
		<label className="flex flex-col gap-2">
			<span className="text-xs text-muted-foreground">{label}</span>
			<Input
				type="number"
				min={0}
				placeholder={placeholder}
				className="h-10 shadow-none"
			/>
		</label>
	);
}
