import DottedMap from "dotted-map";

export const AnalyticsCard = () => {
  return (
    <div className="relative w-full">
      {/* Notification badges - responsive positioning */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* South Africa notification */}
        <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 sm:inset-x-auto sm:left-[8%] sm:top-[38%] sm:w-auto sm:translate-y-0">
          <div className="pointer-events-auto">
            <NotificationBadge flag="🇳🇬" text="New visitor from Lagos, Nigeria" />
          </div>
        </div>

        {/* Ghana notification */}
        <div className="absolute inset-x-2 top-4 sm:inset-x-auto sm:left-1/4 sm:top-8 sm:w-auto">
          <div className="pointer-events-auto">
            <NotificationBadge flag="🇬🇭" text="New visitor from Accra, Ghana" />
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
  <div className="inline-block w-full rounded-md border bg-white px-3 py-2 shadow-lg shadow-zinc-950/10 dark:bg-muted">
    <div className="flex min-w-0 items-center gap-2 font-medium sm:whitespace-nowrap">
      <span className="text-lg shrink-0">{flag}</span>
      <span className="min-w-0 text-xs leading-tight sm:text-sm">{text}</span>
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
        preserveAspectRatio="xMidYMid meet"
      >
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
