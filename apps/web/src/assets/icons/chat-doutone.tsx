import type { SVGProps } from "react";

export function SolarChatRoundUnreadBoldDuotone(props: SVGProps<SVGSVGElement>) {
  const { color = "#888888", ...restProps } = props;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...restProps}
    >
      {/* Icon from Solar by 480 Design - https://creativecommons.org/licenses/by/4.0/ */}
      <path fill={color} d="M22 5a3 3 0 1 1-6 0a3 3 0 0 1 6 0" />
      <path
        fill={color}
        d="M15.235 2.535A10 10 0 0 0 12 2C6.477 2 2 6.477 2 12c0 1.6.376 3.112 1.043 4.453c.178.356.237.763.134 1.148l-.595 2.226a1.3 1.3 0 0 0 1.591 1.592l2.226-.596a1.63 1.63 0 0 1 1.149.133A9.96 9.96 0 0 0 12 22c5.523 0 10-4.477 10-10c0-1.132-.188-2.22-.535-3.235a4.5 4.5 0 0 1-6.23-6.23"
        opacity=".3"
      />
    </svg>
  );
}
