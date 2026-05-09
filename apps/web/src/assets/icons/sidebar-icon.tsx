import type { SVGProps } from "react";

export function SiderbarLinear(props: SVGProps<SVGSVGElement>) {
  const { color = "#888888" } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1.2em"
      height="1.2em"
      viewBox="0 0 24 24"
      {...props}
    >
      {/* Icon from Solar by 480 Design - https://creativecommons.org/licenses/by/4.0/ */}
      <g fill="none" stroke={color} strokeWidth="1.5">
        <path d="M2 11c0-3.771 0-5.657 1.172-6.828S6.229 3 10 3h4c3.771 0 5.657 0 6.828 1.172S22 7.229 22 11v2c0 3.771 0 5.657-1.172 6.828S17.771 21 14 21h-4c-3.771 0-5.657 0-6.828-1.172S2 16.771 2 13z" />
        <path strokeLinecap="round" d="M5.5 10h6m-5 4h4m4.5 7V3" />
      </g>
    </svg>
  );
}
