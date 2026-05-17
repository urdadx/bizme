import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(admin)/moderation')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(admin)/moderation"!</div>
}
