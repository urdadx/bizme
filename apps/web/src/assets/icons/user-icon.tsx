import type { SVGProps } from "react";

export function SolarUserRoundedBoldDuotone(props: SVGProps<SVGSVGElement>) {
  const { color = "#888888" } = props;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      {/* Icon from Solar by 480 Design - https://creativecommons.org/licenses/by/4.0/ */}
      <circle cx="12" cy="6" r="4" fill={color} />
      <ellipse cx="12" cy="17" fill={color} opacity=".5" rx="7" ry="4" />
    </svg>
  );
}

export function UserLinear(props: SVGProps<SVGSVGElement>) {
  const { color = "#888888" } = props;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      {/* Icon from Solar by 480 Design - https://creativecommons.org/licenses/by/4.0/ */}
      <g fill="none" stroke={color} strokeWidth="1.5">
        <circle cx="12" cy="6" r="4" />
        <path d="M20 17.5c0 2.485 0 4.5-8 4.5s-8-2.015-8-4.5S7.582 13 12 13s8 2.015 8 4.5Z" />
      </g>
    </svg>
  );
}
