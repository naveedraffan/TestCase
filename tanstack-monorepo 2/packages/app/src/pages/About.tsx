export function AboutPage() {
  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-bold">About</h1>
      <ul className="list-disc space-y-1 pl-6">
        <li><code>apps/ssr</code> – TanStack Start, server rendering + hydration, server functions.</li>
        <li><code>apps/csr</code> – Vite + TanStack Router single-page app.</li>
        <li><code>packages/app</code> – pages, components, data and Tailwind theme shared by both.</li>
      </ul>
    </section>
  )
}
