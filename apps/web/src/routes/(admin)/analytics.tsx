import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(admin)/analytics')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(admin)/analytics"!</div>
}
