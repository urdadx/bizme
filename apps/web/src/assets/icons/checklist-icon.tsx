import type { SVGProps } from "react";

export function ChecklistLinear(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      {/* Icon from Solar by 480 Design - https://creativecommons.org/licenses/by/4.0/ */}
      <g fill="none" stroke={props.color || "#888888"} strokeLinecap="round" strokeWidth="1.5">
        <path
          strokeLinejoin="round"
          d="M2 5.5L3.214 7L7.5 3M2 12.5L3.214 14L7.5 10M2 19.5L3.214 21L7.5 17"
        />
        <path d="M22 19H12m10-7H12m10-7H12" />
      </g>
    </svg>
  );
}
