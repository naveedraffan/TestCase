/**
 * Router options shared by both the SSR (TanStack Start) and CSR (Vite SPA)
 * shells so navigation behaviour stays identical.
 */
export const defaultRouterOptions = {
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
  defaultStructuralSharing: true,
} as const
