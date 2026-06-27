import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

const items = [
	{
		value: "square",
		label: "Square",
		svg: (
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M4 20V4H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
			</svg>
		),
	},
	{
		value: "rounder",
		label: "Rounder",
			svg: (
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M4 20V12C4 7.58 7.58 4 12 4H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
			</svg>
		),
	},
	{
		value: "full",
		label: "Full",
			svg: (
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M4 20C4 11.16 11.16 4 20 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
			</svg>
		),
	},
];

export const CornerRoundnessOptions = () => {
	const [value, setValue] = useState("rounder");

	return (
		<RadioGroup
			className="grid grid-cols-3 gap-2"
			value={value}
			onValueChange={setValue}
			aria-label="Corner roundness"
		>
			{items.map((item) => (
				<div key={item.value} className="relative cursor-pointer">
					<RadioGroupItem
						value={item.value}
						aria-label={item.label}
						data-testid={`${item.label}-button`}
						className="peer absolute inset-0 opacity-0"
					/>
					<div
						className={`flex h-[48px] w-full items-center justify-center rounded-[16px] border-[1.5px] transition ${value === item.value ? "border-primary bg-elevated text-primary" : "text-tertiary"}`}
					>
						{item.svg}
					</div>
				</div>
			))}
		</RadioGroup>
	);
};
