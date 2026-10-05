import { Outlet, createRootRoute, HeadContent } from '@tanstack/react-router'
import { Layout } from '@repo/app'

export const Route = createRootRoute({
  head: () => ({ meta: [{ title: 'TanStack CSR' }] }),
  component: () => (
    <>
      <HeadContent />
      <Layout mode="CSR">
        <Outlet />
      </Layout>
    </>
  ),
})
