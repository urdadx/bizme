import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(admin)/pages')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(admin)/pages"!</div>
}
