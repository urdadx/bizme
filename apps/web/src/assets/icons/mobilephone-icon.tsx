import type { SVGProps } from "react";

export function MobilePhoneLinear(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      {/* Icon from Huge Icons by Hugeicons - undefined */}
      <g fill="none" stroke={props.color || "#888888"} strokeLinecap="round" strokeLinejoin="round">
        <path strokeWidth="2" d="M12 19h.01" />
        <path
          strokeWidth="1.5"
          d="M13.5 2h-3c-2.357 0-3.536 0-4.268.732S5.5 4.643 5.5 7v10c0 2.357 0 3.535.732 4.268S8.143 22 10.5 22h3c2.357 0 3.535 0 4.268-.732c.732-.733.732-1.911.732-4.268V7c0-2.357 0-3.536-.732-4.268C17.035 2 15.857 2 13.5 2"
        />
      </g>
    </svg>
  );
}
