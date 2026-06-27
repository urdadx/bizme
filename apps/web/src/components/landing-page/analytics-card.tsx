import DottedMap from "dotted-map";

export const AnalyticsCard = () => {
	return (
		<div className="relative w-full">
			{/* Notification badges - responsive positioning */}
			<div className="absolute inset-0 z-10 pointer-events-none">
				{/* South Africa notification */}
				<div className="absolute left-1/2 top-1/2 w-[90%] transform -translate-x-1/2 -translate-y-1/2 sm:left-[8%] sm:top-[38%] sm:w-auto sm:translate-x-0 sm:translate-y-0">
					<div className="pointer-events-auto">
						<NotificationBadge
							flag="🇳🇬"
							text="New visitor from Lagos, Nigeria"
						/>
					</div>
				</div>

				{/* Ghana notification */}
				<div className="absolute left-1/2 top-4 w-[90%] transform -translate-x-1/2 sm:left-1/4 sm:top-8 sm:w-auto sm:translate-x-0">
					<div className="pointer-events-auto">
						<NotificationBadge
							flag="🇬🇭"
							text="New visitor from Accra, Ghana"
						/>
					</div>
				</div>
			</div>

			{/* Map container with responsive sizing */}
			<div className="relative overflow-hidden rounded-lg h-48 sm:h-64 md:h-80 lg:h-96">
				<div className="absolute inset-0 bg-gradient-radial from-transparent to-75% to-background z-10"></div>
				<DottedMapComponent />
			</div>
		</div>
	);
};

const NotificationBadge = ({ flag, text }: { flag: string; text: string }) => (
	<div className="bg-white dark:bg-muted border rounded-md px-3 py-2 shadow-lg shadow-zinc-950/10 w-full inline-block">
		<div className="flex items-center gap-2 font-medium whitespace-nowrap">
			<span className="text-lg shrink-0">{flag}</span>
			<span className="text-sm leading-tight">{text}</span>
		</div>
	</div>
);

const map = new DottedMap({
	height: 60,
	grid: "diagonal",
	width: 90,
});

const points = map.getPoints();

const svgOptions = {
	backgroundColor: "var(--color-background)",
	color: "currentColor",
	radius: 0.12,
};

const DottedMapComponent = () => {
	return (
		<div className="w-full h-full flex items-center justify-center">
			<svg
				viewBox="0 0 90 60"
				className="w-full h-full max-w-4xl"
				style={{
					background: svgOptions.backgroundColor,
					minHeight: "100%",
				}}
				preserveAspectRatio="xMidYMid meet">
				{points.map((point, index) => (
					<circle
						key={index}
						cx={point.x}
						cy={point.y}
						r={svgOptions.radius}
						fill={svgOptions.color}
						className="transition-opacity duration-200"
					/>
				))}
			</svg>
		</div>
	);
};
