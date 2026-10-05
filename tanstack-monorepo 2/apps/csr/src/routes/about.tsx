import { createFileRoute } from '@tanstack/react-router'
import { AboutPage } from '@repo/app'

export const Route = createFileRoute('/about')({
  head: () => ({ meta: [{ title: 'About – TanStack CSR' }] }),
  component: AboutPage,
})
