import type { SVGProps } from "react";

function svgBase(props: SVGProps<SVGSVGElement>) {
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    "aria-hidden": true,
    ...props,
  } as const;
}

export function ImageIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase(props)}>
      <g stroke="currentColor" strokeLinecap="round" strokeWidth="1.5">
        <path d="M22 12c0 4.714 0 7.071-1.465 8.535C19.072 22 16.714 22 12 22s-7.071 0-8.536-1.465C2 19.072 2 16.714 2 12s0-7.071 1.464-8.536C4.93 2 7.286 2 12 2" />
        <path d="m2 12.5 1.752-1.533a2.3 2.3 0 0 1 3.14.105l4.29 4.29a2 2 0 0 0 2.564.222l.299-.21a3 3 0 0 1 3.731.225L21 18.5m-6-13h3.5m0 0H22m-3.5 0V9m0-3.5V2" />
      </g>
    </svg>
  );
}

export function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase(props)}>
      <path d="m8 8 8 8m0-8-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function EmptyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase(props)} fill="currentColor">
      <path d="M22 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
      <path
        d="M15.612 2.038C14.59 2 13.399 2 12 2 7.286 2 4.929 2 3.464 3.464 2 4.93 2 7.286 2 12s0 7.071 1.464 8.535C4.93 22 7.286 22 12 22s7.071 0 8.535-1.465C22 19.072 22 16.714 22 12c0-1.399 0-2.59-.038-3.612a4.5 4.5 0 0 1-6.35-6.35"
        opacity=".5"
      />
      <path d="M3.465 20.536C4.929 22 7.286 22 12 22s7.072 0 8.536-1.465C21.893 19.179 21.993 17.056 22 13h-3.16c-.905 0-1.358 0-1.755.183-.398.183-.693.527-1.282 1.214l-.605.706c-.59.687-.884 1.031-1.282 1.214s-.85.183-1.755.183h-.321c-.905 0-1.358 0-1.756-.183s-.692-.527-1.281-1.214l-.606-.706c-.589-.687-.883-1.031-1.281-1.214S6.066 13 5.16 13H2c.007 4.055.107 6.179 1.465 7.535" />
    </svg>
  );
}

export function LikeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase(props)}>
      <path
        d="M7.5 10v10H4.8A1.8 1.8 0 0 1 3 18.2v-6.4A1.8 1.8 0 0 1 4.8 10h2.7Zm0 0 3.3-6.1a1.5 1.5 0 0 1 2.8 1v3.2h4.2a2.2 2.2 0 0 1 2.1 2.8l-2 7.4a2.3 2.3 0 0 1-2.2 1.7H7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ReplyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase(props)}>
      <g stroke="currentColor" strokeWidth="1.5">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2S2 6.477 2 12c0 1.6.376 3.112 1.043 4.453c.178.356.237.763.134 1.148l-.595 2.226a1.3 1.3 0 0 0 1.591 1.592l2.226-.596a1.63 1.63 0 0 1 1.149.133A9.96 9.96 0 0 0 12 22Z" />
        <path d="M8 10.5h8M8 14h5.5" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export function EditIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase(props)}>
      <g stroke="currentColor" strokeWidth="1.5">
        <path d="m15.287 3.152-.927.927-8.521 8.52c-.577.578-.866.867-1.114 1.185a6.6 6.6 0 0 0-.749 1.211c-.173.364-.302.752-.56 1.526l-1.094 3.281-.268.802a1.06 1.06 0 0 0 1.342 1.342l.802-.268 3.281-1.094c.775-.258 1.162-.387 1.526-.56q.647-.308 1.211-.749c.318-.248.607-.537 1.184-1.114l8.521-8.521.927-.927a3.932 3.932 0 0 0-5.561-5.561Z" />
        <path d="M14.36 4.078s.116 1.97 1.854 3.708 3.707 1.853 3.707 1.853M4.198 21.678l-1.876-1.876" opacity=".5" />
      </g>
    </svg>
  );
}

export function DeleteIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase(props)}>
      <path
        d="M9.17 4a3.001 3.001 0 0 1 5.66 0m5.67 2h-17m15.333 2.5-.46 6.9c-.177 2.654-.265 3.981-1.13 4.79s-2.196.81-4.856.81h-.774c-2.66 0-3.991 0-4.856-.81-.865-.809-.954-2.136-1.13-4.79l-.46-6.9M9.5 11l.5 5m4.5-5-.5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MenuIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase(props)} fill="currentColor">
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </svg>
  );
}

export function GoogleMarkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgBase(props)}>
      <path
        fill="currentColor"
        d="M19.68 12.18c0-.57-.05-1.11-.15-1.63H12v3.09h4.31a3.67 3.67 0 0 1-1.6 2.41v2.06h2.59c1.51-1.4 2.38-3.45 2.38-5.93Z"
        opacity=".9"
      />
      <path
        fill="currentColor"
        d="M12 20c2.16 0 3.97-.72 5.3-1.94l-2.59-2.06c-.72.48-1.64.77-2.71.77-2.08 0-3.85-1.41-4.48-3.29H4.85v2.12a8 8 0 0 0 7.15 4.4Z"
        opacity=".7"
      />
      <path
        fill="currentColor"
        d="M7.52 13.48A4.8 4.8 0 0 1 7.28 12c0-.52.09-1.02.24-1.48V8.4H4.85a8 8 0 0 0 0 7.2l2.67-2.12Z"
        opacity=".45"
      />
      <path
        fill="currentColor"
        d="M12 7.18c1.18 0 2.23.41 3.06 1.2l2.29-2.3A7.98 7.98 0 0 0 4.85 8.4l2.67 2.12C8.15 8.59 9.92 7.18 12 7.18Z"
        opacity=".3"
      />
    </svg>
  );
}