import { Link } from '@tanstack/react-router'
import type { Post } from '../data/posts'

export function PostsPage({ posts }: { posts: Post[] }) {
  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-bold">Posts</h1>
      <ul className="divide-y divide-gray-200 dark:divide-gray-800">
        {posts.map((p) => (
          <li key={p.id} className="py-2">
            <Link to="/posts/$postId" params={{ postId: p.id }} className="text-brand hover:underline">
              {p.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
