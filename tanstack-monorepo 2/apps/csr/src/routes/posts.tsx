import { createFileRoute } from '@tanstack/react-router'
import { getPosts, PostsPage } from '@repo/app'

export const Route = createFileRoute('/posts')({
  loader: () => getPosts(),
  head: () => ({ meta: [{ title: 'Posts – TanStack CSR' }] }),
  component: () => <PostsPage posts={Route.useLoaderData()} />,
})
