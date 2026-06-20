import type { SVGProps } from "react";

export function ArrowDownLinear(props: SVGProps<SVGSVGElement>) {
	const { color = "#888888" } = props;
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="1em"
			height="1em"
			viewBox="0 0 24 24"
			{...props}>
			{/* Icon from Solar by 480 Design - https://creativecommons.org/licenses/by/4.0/ */}
			<path
				fill="none"
				stroke={color}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1.5"
				d="m19 9l-7 6l-7-6"
			/>
		</svg>
	);
}
