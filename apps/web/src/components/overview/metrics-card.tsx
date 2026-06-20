import { Button } from "@/components/ui/button";
import NumberFlow from "@number-flow/react";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import type { ComponentType } from "react";

interface MetricCardProps {
	icon: ComponentType<{ className?: string }>;
	title?: string;
	value: number;
	href?: string;
	suffix?: string;
}

export function MetricCard({
	icon: Icon,
	title,
	value,
	href,
	suffix = "",
}: MetricCardProps) {
	return (
		<div
			className={
				"group relative overflow-hidden rounded-xl border border-foreground/10 bg-linear-to-bl from-slate-50 via-slate-25 to-background p-2.5 dark:shadow-none dark:from-orange-950/20 dark:via-orange-900/10"
			}>
			<div className="flex flex-row items-center gap-3">
				<div className="relative size-15 shrink-0 scale-90 rounded-4xl shadow-[3px_5px_15px_-2px_rgb(0_0_0/0.075),2px_3px_6px_-4px_rgb(0_0_0/0.075)] dark:shadow-[3px_5px_15px_-2px_rgb(255_255_255/0.075),2px_3px_6px_-4px_rgb(255_255_255/0.075)]">
					<div className="absolute inset-0 rounded-[20px] bg-white dark:bg-black"></div>
					<div className="absolute inset-0.75 rounded-[18px] bg-linear-to-br from-gray-200 via-white to-white dark:from-gray-700 dark:via-black dark:to-black"></div>
					<div className="absolute inset-1 rounded-[17px] bg-linear-to-tl from-gray-100 via-white to-white dark:from-gray-800 dark:via-black dark:to-black"></div>
					<div className="absolute inset-0 flex items-center justify-center text-foreground">
						<Icon className="size-5" />
					</div>
				</div>

				<div className="flex grow flex-col justify-center gap-0.75">
					{title && (
						<h3 className="text-sm font-sans text-gray-600">{title}</h3>
					)}

					<div className="flex items-baseline">
						<NumberFlow
							className="whitespace-nowrap font-extrabold text-2xl leading-none tracking-tight"
							value={value}
							suffix={suffix}
						/>
					</div>
				</div>
			</div>

			{href && (
				<Button
					variant="outline"
					size="sm"
					className="absolute bottom-2.5 right-2.5 h-6 gap-1 rounded-sm text-xs text-muted-foreground bg-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
					<Link className="flex items-center" to={href}>
						View
						<ChevronRight className="size-3" />
					</Link>
				</Button>
			)}
		</div>
	);
}
