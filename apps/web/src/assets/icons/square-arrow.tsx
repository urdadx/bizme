import type { SVGProps } from "react";

export function SolarArrowUpLinear(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      {/* Icon from Solar by 480 Design - https://creativecommons.org/licenses/by/4.0/ */}
      <path
        fill="none"
        stroke={props.color || "#888888"}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M12 20V4m0 0l6 6m-6-6l-6 6"
      />
    </svg>
  );
}
