export type Post = { id: string; title: string; body: string }

const POSTS: Post[] = [
  { id: '1', title: 'One codebase, two render modes', body: 'The same routes and components render on the server with TanStack Start and purely in the browser with TanStack Router.' },
  { id: '2', title: 'Shared package', body: '@repo/app owns pages, components, data access and Tailwind styles. Apps are thin shells.' },
  { id: '3', title: 'Loaders work everywhere', body: 'Route loaders call the same async functions; Start runs them on the server for the first request, the SPA runs them in the browser.' },
]

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function getPosts(): Promise<Post[]> {
  await delay(100)
  return POSTS
}

export async function getPost(id: string): Promise<Post | undefined> {
  await delay(100)
  return POSTS.find((p) => p.id === id)
}
