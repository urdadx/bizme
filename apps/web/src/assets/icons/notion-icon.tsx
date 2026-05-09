import type { SVGProps } from "react";

export function NotionIcon(props: SVGProps<SVGSVGElement>) {
	const { color = "#888888" } = props;
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="1em"
			height="1em"
			viewBox="0 0 24 24"
			{...props}>
			<g
				fill="none"
				stroke={color}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1.5">
				<path d="m2.5 3.5l14-1l5 3m-19-2l4 3m-4-3v13l4 5m15-16l-15 1m15-1v14l-15 2m0-15v15" />
				<path d="M12.47 17.704L9.5 18.1m9-9.4l-2.235.149m1.235-.082V17l-5.785-7.848L9.5 9.3m1.5-.1v8.5" />
			</g>
		</svg>
	);
}
