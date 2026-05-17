import { type Dispatch, type ReactNode, type SetStateAction, useMemo } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { LineItem } from "./line-item";

const EMPTY_DATA: BarListProps["data"] = [];

interface BarListProps {
	tab: string;
	unit: string;
	data: {
		icon: ReactNode;
		title: string;
		href: string;
		value: number;
		linkId?: string;
		barBackground?: string;
		hoverBackground?: string;
	}[];
	maxValue: number;
	barBackground?: string;
	hoverBackground?: string;
	setShowModal: Dispatch<SetStateAction<boolean>>;
	limit?: number;
	minBarWidth?: number;
}

export default function BarList({
	tab = "Websites",
	unit = "visits",
	data = EMPTY_DATA,
	barBackground = "bg-blue-500",
	hoverBackground = "hover:bg-gray-100",
	maxValue,
	limit,
	minBarWidth = 10,
}: Partial<BarListProps>) {
	const calculatedMaxValue = useMemo(() => {
		if (maxValue) return maxValue;
		return data.length > 0 ? Math.max(...data.map((item) => item.value)) : 1000;
	}, [data, maxValue]);

	const filteredData = useMemo(() => {
		if (limit) {
			return data.slice(0, limit);
		}
		return data;
	}, [data, limit]);

	const sortedData = useMemo(() => {
		return filteredData.toSorted((a, b) => b.value - a.value);
	}, [filteredData]);

	const bars = (
		<div className="grid gap-2">
			{sortedData.map((item) => (
				<LineItem
					key={item.linkId ?? item.href ?? item.title}
					{...item}
					maxValue={calculatedMaxValue}
					tab={tab}
					unit={unit}
					barBackground={item.barBackground || barBackground}
					hoverBackground={item.hoverBackground || hoverBackground}
					minBarWidth={minBarWidth}
				/>
			))}
		</div>
	);

	if (limit) {
		return bars;
	}

	return (
		<>
			<ScrollArea className="h-[45vh]  overflow-y-auto z-0 pr-4">
				{bars}
				<div className="h-8" />
			</ScrollArea>
		</>
	);
}
