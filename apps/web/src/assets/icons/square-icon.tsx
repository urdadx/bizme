import { SVGProps } from "react";

export function SquareIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="1em"
			height="1em"
			viewBox="0 0 24 24"
			{...props}>
			{/* Icon from Huge Icons by Hugeicons - undefined */}
			<g fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5">
				<path d="M2.5 12c0-4.478 0-6.718 1.391-8.109S7.521 2.5 12 2.5c4.478 0 6.718 0 8.109 1.391S21.5 7.521 21.5 12c0 4.478 0 6.718-1.391 8.109S16.479 21.5 12 21.5c-4.478 0-6.718 0-8.109-1.391S2.5 16.479 2.5 12Z" />
				<path
					strokeLinecap="round"
					d="M9 8c-1.205.86-2 2.33-2 4s.795 3.14 2 4m6-8c1.206.86 2 2.33 2 4s-.794 3.14-2 4"
				/>
			</g>
		</svg>
	);
}
