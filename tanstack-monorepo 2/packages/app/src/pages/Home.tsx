import { Counter } from '../components/Counter'

export function HomePage({ renderedAt }: { renderedAt?: string }) {
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">TanStack SSR + CSR monorepo</h1>
      <p className="text-gray-600 dark:text-gray-400">
        This page comes from <code>@repo/app</code> and is rendered by both the TanStack Start (SSR) app and the
        TanStack Router (CSR) app.
      </p>
      {renderedAt && (
        <p className="text-sm">
          Server rendered at <time dateTime={renderedAt}>{renderedAt}</time>
        </p>
      )}
      <Counter />
    </section>
  )
}
