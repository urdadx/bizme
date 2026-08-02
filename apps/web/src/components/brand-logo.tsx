import { cn } from "@/lib/utils";
import type { SVGProps } from "react";

export function BrandLogo({ className, ...props }: SVGProps<SVGSVGElement>) {
	return (
		<svg
			viewBox="0 0 64 64"
			role="img"
			aria-label="Bizme"
			className={cn("size-9 shrink-0", className)}
			{...props}
		>
			<rect width="64" height="64" rx="12" className="fill-primary" />
			<path
				className="fill-primary-foreground"
				d="M12 7h25a5 5 0 0 1 5 5v15.4l-3.7 6.4-7.9 13.8-.4.8-.8 4.6H12a5 5 0 0 1-5-5V12a5 5 0 0 1 5-5Zm30.7 23.2 5.5-9.6a2 2 0 0 1 2.7-.7l7.8 4.5a2 2 0 0 1 .7 2.7l-5.5 9.6-11.2-6.5Zm-2 3.5 11.2 6.5-8 13.8-13.3 3.5 2.1-13.6 8-10.2Z"
			/>
		</svg>
	);
}
