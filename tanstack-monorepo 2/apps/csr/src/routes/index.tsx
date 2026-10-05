import { createFileRoute } from '@tanstack/react-router'
import { HomePage } from '@repo/app'

export const Route = createFileRoute('/')({
  component: HomePage,
})
