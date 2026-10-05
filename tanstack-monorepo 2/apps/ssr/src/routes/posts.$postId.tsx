import { createFileRoute, notFound } from '@tanstack/react-router'
import { getPost, PostPage } from '@repo/app'

export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ params }) => {
    const post = await getPost(params.postId)
    if (!post) throw notFound()
    return post
  },
  head: ({ loaderData }) => ({ meta: [{ title: `${loaderData?.title ?? 'Post'} – TanStack SSR` }] }),
  component: () => <PostPage post={Route.useLoaderData()} />,
})
