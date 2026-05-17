import type { SVGProps } from "react";

export const CuteIconWrapper: React.FC<{
	icon: React.ComponentType<SVGProps<SVGSVGElement>>;
	color?: string;
}> = ({ icon: Icon, color = "#888888" }) => {
	return (
		<div className="relative shrink-0" style={{ width: "32px", height: "32px" }}>
			<svg
				className="absolute left-0 top-0"
				fill="none"
				height="32"
				id="status-icon"
				style={{ color: color }}
				viewBox="0 0 32 32"
				width="32"
				xmlns="http://www.w3.org/2000/svg">
				<g clipPath="url(#a)">
					<rect
						fill="currentColor"
						fillOpacity="0.15"
						height="32"
						rx="11"
						stroke="#fff"
						strokeWidth="8"
						width="32"></rect>
					<rect
						height="30"
						rx="10"
						stroke="#D6D6D6"
						strokeWidth="2"
						width="30"
						x="1"
						y="1"></rect>
					<mask
						height="30"
						id="d"
						maskUnits="userSpaceOnUse"
						width="30"
						x="1"
						y="1"
						style={{ maskType: "alpha" }}>
						<path
							d="M1.641 1.637h29.091v29.091H1.641z"
							fill="url(#c)"></path>
					</mask>
					<g mask="url(#d)">
						<path
							d="M.5.5h5v5h-5zM5.5.5h5v5h-5z"
							stroke="#404040"
							strokeOpacity="0.06"></path>
						<path
							d="M11 1h4v4h-4z"
							fill="#404040"
							fillOpacity="0.06"></path>
						<path
							d="M10.5.5h5v5h-5zM15.5.5h5v5h-5zM20.5.5h5v5h-5z"
							stroke="#404040"
							strokeOpacity="0.06"></path>
						<path
							d="M26 1h4v4h-4z"
							fill="#404040"
							fillOpacity="0.06"></path>
						<path
							d="M25.5.5h5v5h-5z"
							stroke="#404040"
							strokeOpacity="0.06"></path>
						<path
							d="M.5 5.5h5v5h-5z"
							opacity="0.4"
							stroke="#404040"
							strokeOpacity="0.06"></path>
						<g opacity="0.4">
							<path
								d="M6 6h4v4H6z"
								fill="#404040"
								fillOpacity="0.06"></path>
							<path
								d="M5.5 5.5h5v5h-5z"
								stroke="#404040"
								strokeOpacity="0.06"></path>
						</g>
						<path
							d="M10.5 5.5h5v5h-5z"
							opacity="0.4"
							stroke="#404040"
							strokeOpacity="0.06"></path>
						<g opacity="0.4">
							<path
								d="M16 6h4v4h-4z"
								fill="#404040"
								fillOpacity="0.06"></path>
							<path
								d="M15.5 5.5h5v5h-5z"
								stroke="#404040"
								strokeOpacity="0.06"></path>
						</g>
						<path
							d="M20.5 5.5h5v5h-5zM25.5 5.5h5v5h-5z"
							opacity="0.4"
							stroke="#404040"
							strokeOpacity="0.06"></path>
						<path d="M1 11h4v4H1z" fill="#404040" fillOpacity="0.06"></path>
						<path
							d="M.5 10.5h5v5h-5zM5.5 10.5h5v5h-5zM10.5 10.5h5v5h-5zM15.5 10.5h5v5h-5z"
							stroke="#404040"
							strokeOpacity="0.06"></path>
						<path
							d="M21 11h4v4h-4z"
							fill="#404040"
							fillOpacity="0.06"></path>
						<path
							d="M20.5 10.5h5v5h-5zM25.5 10.5h5v5h-5zM.5 15.5h5v5h-5zM5.5 15.5h5v5h-5zM10.5 15.5h5v5h-5zM15.5 15.5h5v5h-5zM20.5 15.5h5v5h-5z"
							stroke="#404040"
							strokeOpacity="0.06"></path>
						<path
							d="M26 16h4v4h-4z"
							fill="#404040"
							fillOpacity="0.06"></path>
						<path
							d="M25.5 15.5h5v5h-5zM.5 20.5h5v5h-5z"
							stroke="#404040"
							strokeOpacity="0.06"></path>
						<path d="M6 21h4v4H6z" fill="#404040" fillOpacity="0.06"></path>
						<path
							d="M5.5 20.5h5v5h-5zM10.5 20.5h5v5h-5zM15.5 20.5h5v5h-5z"
							stroke="#404040"
							strokeOpacity="0.06"></path>
						<path
							d="M21 21h4v4h-4z"
							fill="#404040"
							fillOpacity="0.06"></path>
						<path
							d="M20.5 20.5h5v5h-5zM25.5 20.5h5v5h-5zM.5 25.5h5v5h-5zM5.5 25.5h5v5h-5z"
							stroke="#404040"
							strokeOpacity="0.06"></path>
						<path
							d="M11 26h4v4h-4z"
							fill="#404040"
							fillOpacity="0.06"></path>
						<path
							d="M10.5 25.5h5v5h-5zM15.5 25.5h5v5h-5zM20.5 25.5h5v5h-5zM25.5 25.5h5v5h-5z"
							stroke="#404040"
							strokeOpacity="0.06"></path>
					</g>
				</g>
				<defs>
					<radialGradient
						cx="0"
						cy="0"
						gradientTransform="rotate(90 .002 16.184) scale(12.3182)"
						gradientUnits="userSpaceOnUse"
						id="c"
						r="1">
						<stop></stop>
						<stop offset="0.805" stopOpacity="0.88"></stop>
						<stop offset="1" stopOpacity="0"></stop>
					</radialGradient>
					<linearGradient
						gradientUnits="userSpaceOnUse"
						id="b"
						x1="16"
						x2="16"
						y1="2.5"
						y2="36.5">
						<stop offset="0.105" style={{ stopColor: "#008647d4" }}></stop>
						<stop
							fillOpacity="0.9"
							offset="1"
							stopColor="transparent"></stop>
					</linearGradient>
				</defs>
			</svg>
			<Icon
				className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
				color={color}
				width="17"
				height="17"
				fillOpacity="0.9"
				filter="brightness(0.6)"
			/>
		</div>
	);
};
