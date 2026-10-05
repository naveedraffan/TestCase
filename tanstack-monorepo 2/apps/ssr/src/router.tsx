import { createRouter } from '@tanstack/react-router'
import { defaultRouterOptions, NotFoundPage } from '@repo/app'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  return createRouter({
    routeTree,
    ...defaultRouterOptions,
    defaultNotFoundComponent: NotFoundPage,
  })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
