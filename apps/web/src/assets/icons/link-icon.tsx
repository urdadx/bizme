import type { SVGProps } from "react";

export function NewLinkIcon(props: SVGProps<SVGSVGElement>) {
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
				fill={color}
				d="M15.728 3.884c1.434-1.44 3.532-1.47 4.694-.304c1.164 1.168 1.132 3.28-.303 4.72l-2.424 2.433a.75.75 0 0 0 1.063 1.059l2.424-2.433c1.91-1.919 2.15-4.982.303-6.838c-1.85-1.857-4.907-1.615-6.82.304L9.818 7.692c-1.912 1.919-2.152 4.982-.303 6.837a.75.75 0 1 0 1.062-1.058c-1.163-1.168-1.132-3.28.303-4.72z"
			/>
			<path
				fill={color}
				d="M14.485 9.47a.75.75 0 0 0-1.063 1.06c1.164 1.168 1.132 3.279-.303 4.72L8.27 20.116c-1.434 1.44-3.532 1.47-4.694.304c-1.163-1.168-1.132-3.28.303-4.72l2.424-2.433a.75.75 0 1 0-1.062-1.059l-2.424 2.433C.906 16.56.666 19.623 2.515 21.48c1.85 1.858 4.907 1.615 6.819-.304l4.848-4.867c1.91-1.918 2.15-4.982.303-6.837"
				opacity=".5"
			/>
		</svg>
	);
}

export function ExternalLink(props: SVGProps<SVGSVGElement>) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="1em"
			height="1em"
			viewBox="0 0 24 24"
			{...props}>
			{/* Icon from Huge Icons by Hugeicons - undefined */}
			<path
				fill="none"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1.5"
				d="M11.1 3c-3.65.007-5.56.096-6.782 1.318C3 5.636 3 7.757 3 12c0 4.242 0 6.364 1.318 7.682S7.757 21 12 21s6.363 0 7.68-1.318c1.222-1.221 1.312-3.133 1.318-6.782m-.442-9.404l-9.507 9.563m9.507-9.563c-.494-.494-3.822-.448-4.525-.438m4.525.438c.494.495.448 3.827.438 4.531"
			/>
		</svg>
	);
}
