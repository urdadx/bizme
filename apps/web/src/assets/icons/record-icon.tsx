import type {
  SVGProps
} from "react"

export function RecordIcon(props: SVGProps<SVGSVGElement>) {
  const { color = "#888888" } = props;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 26 26" {...props}>{/* Icon from Solar by 480 Design - https://creativecommons.org/licenses/by/4.0/ */}<circle cx="12" cy="12" r="7" fill={color} opacity=".5" /><path fill={color} fillRule="evenodd" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2S2 6.477 2 12s4.477 10 10 10m0-3a7 7 0 1 0 0-14a7 7 0 0 0 0 14" clipRule="evenodd" /></svg>
  )
}
