import type { SVGProps } from "react";

export function SolarUsersGroupRoundedBoldDuotone(props: SVGProps<SVGSVGElement>) {
  const { color = "#888888" } = props;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      {/* Icon from Solar by 480 Design - https://creativecommons.org/licenses/by/4.0/ */}
      <circle cx="15" cy="6" r="3" fill={color} opacity=".4" />
      <ellipse cx="16" cy="17" fill={color} opacity=".4" rx="5" ry="3" />
      <circle cx="9.001" cy="6" r="4" fill={color} />
      <ellipse cx="9.001" cy="17.001" fill={color} rx="7" ry="4" />
    </svg>
  );
}
