import { Link } from '@tanstack/react-router'
import type { Post } from '../data/posts'

export function PostPage({ post }: { post: Post }) {
  return (
    <article className="space-y-3">
      <Link to="/posts" className="text-sm text-brand hover:underline">← Back to posts</Link>
      <h1 className="text-2xl font-bold">{post.title}</h1>
      <p>{post.body}</p>
    </article>
  )
}
