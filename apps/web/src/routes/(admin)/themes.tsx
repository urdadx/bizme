import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(admin)/themes')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(admin)/customize"!</div>
}
