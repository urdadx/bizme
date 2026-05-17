import type { SVGProps } from "react";

export function SolarChartBoldDuotone(props: SVGProps<SVGSVGElement>) {
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
				fillRule="evenodd"
				d="M14 20.5V4.25c0-.728-.002-1.2-.048-1.546c-.044-.325-.115-.427-.172-.484s-.159-.128-.484-.172C12.949 2.002 12.478 2 11.75 2s-1.2.002-1.546.048c-.325.044-.427.115-.484.172s-.128.159-.172.484c-.046.347-.048.818-.048 1.546V20.5z"
				clipRule="evenodd"
			/>
			<path
				fill={color}
				d="M8 8.75A.75.75 0 0 0 7.25 8h-3a.75.75 0 0 0-.75.75V20.5H8zm12 5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75v6.75H20z"
				opacity=".7"
			/>
			<path
				fill={color}
				d="M1.75 20.5a.75.75 0 0 0 0 1.5h20a.75.75 0 0 0 0-1.5z"
				opacity=".5"
			/>
		</svg>
	);
}

export function ChartLinear(props: SVGProps<SVGSVGElement>) {
	const { color = "#888888" } = props;
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="1em"
			height="1em"
			viewBox="0 0 24 24"
			{...props}>
			{/* Icon from Solar by 480 Design - https://creativecommons.org/licenses/by/4.0/ */}
			<g fill="none" stroke={color} strokeWidth="1.3">
				<path strokeLinecap="round" d="M22 22H2" />
				<path d="M21 22v-7.5a1.5 1.5 0 0 0-1.5-1.5h-3a1.5 1.5 0 0 0-1.5 1.5V22m0 0V5c0-1.414 0-2.121-.44-2.56C14.122 2 13.415 2 12 2s-2.121 0-2.56.44C9 2.878 9 3.585 9 5v17m0 0V9.5A1.5 1.5 0 0 0 7.5 8h-3A1.5 1.5 0 0 0 3 9.5V22" />
			</g>
		</svg>
	);
}
export function ChartLinear2(props: SVGProps<SVGSVGElement>) {
	const { color = "#888888" } = props;
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="1em"
			height="1em"
			viewBox="0 0 24 24"
			{...props}>
			{/* Icon from Solar by 480 Design - https://creativecommons.org/licenses/by/4.0/ */}
			<g fill="none" stroke={color} strokeWidth="2">
				<path strokeLinecap="round" d="M22 22H2" />
				<path d="M21 22v-7.5a1.5 1.5 0 0 0-1.5-1.5h-3a1.5 1.5 0 0 0-1.5 1.5V22m0 0V5c0-1.414 0-2.121-.44-2.56C14.122 2 13.415 2 12 2s-2.121 0-2.56.44C9 2.878 9 3.585 9 5v17m0 0V9.5A1.5 1.5 0 0 0 7.5 8h-3A1.5 1.5 0 0 0 3 9.5V22" />
			</g>
		</svg>
	);
}

export function ChartUp(props: SVGProps<SVGSVGElement>) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="1em"
			height="1em"
			viewBox="0 0 24 24"
			{...props}>
			{/* Icon from Huge Icons by Hugeicons - undefined */}
			<g fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.2">
				<path d="M20.5 10.5v9c0 .466 0 .699-.076.883a1 1 0 0 1-.541.54C19.699 21 19.466 21 19 21s-.699 0-.883-.076a1 1 0 0 1-.54-.541c-.077-.184-.077-.417-.077-.883v-9c0-.466 0-.699.076-.883a1 1 0 0 1 .541-.54C18.301 9 18.534 9 19 9s.699 0 .883.076a1 1 0 0 1 .54.541c.077.184.077.417.077.883Z" />
				<path strokeLinecap="round" d="M16.5 3h3v3" />
				<path strokeLinecap="round" d="M19 3.5s-4 5-14.5 8.5" />
				<path d="M13.5 14v5.5c0 .466 0 .699-.076.883a1 1 0 0 1-.541.54C12.699 21 12.466 21 12 21s-.699 0-.883-.076a1 1 0 0 1-.54-.541c-.077-.184-.077-.417-.077-.883V14c0-.466 0-.699.076-.883a1 1 0 0 1 .541-.54c.184-.077.417-.077.883-.077s.699 0 .883.076a1 1 0 0 1 .54.541c.077.184.077.417.077.883Zm-7 2.5v3c0 .466 0 .699-.076.883a1 1 0 0 1-.541.54C5.699 21 5.466 21 5 21s-.699 0-.883-.076a1 1 0 0 1-.54-.541c-.077-.184-.077-.417-.077-.883v-3c0-.466 0-.699.076-.883a1 1 0 0 1 .541-.54C4.301 15 4.534 15 5 15s.699 0 .883.076a1 1 0 0 1 .54.541c.077.184.077.417.077.883Z" />
			</g>
		</svg>
	);
}
