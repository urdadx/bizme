import type { SVGProps } from "react";

export function ChatLogsIcon(props: SVGProps<SVGSVGElement>) {
  const { color = "#888888" } = props;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      <g fill="none" stroke={color} strokeLinecap="round" strokeWidth="1.5">
        <path d="M2 12c0 5.523 4.477 10 10 10s10-4.477 10-10S17.523 2 12 2" />
        <path strokeLinejoin="round" d="M12 9v4h4" />
        <circle cx="12" cy="12" r="10" strokeDasharray=".5 3.5" />
      </g>
    </svg>
  );
}
