import { Link } from '@tanstack/react-router'

export function NotFoundPage() {
  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-bold">404 – Not found</h1>
      <Link to="/" className="text-brand hover:underline">Go home</Link>
    </section>
  )
}
