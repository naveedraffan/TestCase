import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

const linkClass = 'px-3 py-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10'
const activeProps = { className: `${linkClass} font-semibold text-brand` }

export function Layout({ mode, children }: { mode: 'SSR' | 'CSR'; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <header className="border-b border-gray-200 dark:border-gray-800">
        <nav className="mx-auto flex max-w-3xl items-center gap-2 p-3">
          <Link to="/" className={linkClass} activeProps={activeProps} activeOptions={{ exact: true }}>Home</Link>
          <Link to="/posts" className={linkClass} activeProps={activeProps}>Posts</Link>
          <Link to="/about" className={linkClass} activeProps={activeProps}>About</Link>
          <span className="ml-auto rounded-full bg-brand/10 px-3 py-1 text-xs font-mono text-brand">{mode}</span>
        </nav>
      </header>
      <main className="mx-auto max-w-3xl p-6">{children}</main>
    </div>
  )
}
