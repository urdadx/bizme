import { cn } from "@/lib/utils";
import type { PropsWithChildren } from "react";

export function FeatureCard({
	title,
	description,
	children,
	className,
	graphicClassName,
}: PropsWithChildren<{
	title: string;
	description: string;
	linkText?: string;
	href?: string;
	className?: string;
	graphicClassName?: string;
}>) {
	return (
		<div className={cn("relative flex flex-col gap-10 px-4 py-14 sm:px-12", className)}>
			<div
				className={cn(
					"absolute left-1/2 top-1/3 h-1/2 w-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10 blur-[50px]",
					"bg-[conic-gradient(from_270deg,#3B82F6,#1E40AF,transparent,transparent)]",
				)}
			/>
			<div className={cn("relative h-64 overflow-hidden sm:h-75.5", graphicClassName)}>
				{children}
			</div>
			<div className="relative flex flex-col">
				<h3 className="text-lg font-sans font-normal">{title}</h3>
				<div
					className={cn(
						"mt-2 text-neutral-500 transition-colors",
						"[&_a]:font-medium [&_a]:text-blue-600 [&_a]:underline [&_a]:decoration-dotted [&_a]:underline-offset-2 hover:[&_a]:text-blue-800",
					)}>
					{description}
				</div>
			</div>
		</div>
	);
}
