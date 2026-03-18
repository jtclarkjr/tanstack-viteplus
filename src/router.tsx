import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from '@/routeTree.gen'

import { getContext } from '@/providers/tanstack-query-provider'

export const getRouter = () => {
  const router = createTanStackRouter({
    routeTree,

    context: {
      ...getContext(),
      session: null,
      authConfig: null
    },

    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    defaultNotFoundComponent: () => <p>Page not found</p>
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
