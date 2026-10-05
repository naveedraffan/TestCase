import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { HomePage } from '@repo/app'

// SSR-only capability: runs on the server, result is streamed/hydrated to the client.
const getServerTime = createServerFn({ method: 'GET' }).handler(async () => {
  return new Date().toISOString()
})

export const Route = createFileRoute('/')({
  loader: () => getServerTime(),
  component: () => <HomePage renderedAt={Route.useLoaderData()} />,
})
