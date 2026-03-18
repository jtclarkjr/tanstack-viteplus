import {
  HeadContent,
  Scripts,
  createRootRouteWithContext
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import { ThemeProvider, themeInitScript } from '@/providers/theme-provider'
import TanStackQueryProvider from '@/providers/tanstack-query-provider'
import TanStackQueryDevtools from '@/integrations/tanstack-query/devtools'
import { AuthStatus } from '@/features/auth/auth-status'
import { getAuthConfig } from '@/lib/server/auth-config'
import { getServerSession } from '@/lib/server/get-session'
import appCss from '@/styles.css?url'

import type { AuthConfig } from '@/lib/server/auth-config'
import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
  session: { user: { id: string }; session: { id: string } } | null
  authConfig: AuthConfig | null
}

const RootDocument = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <HeadContent />
      </head>
      <body>
        <ThemeProvider>
          <TanStackQueryProvider>
            <div className="fixed top-4 right-4 z-50">
              <AuthStatus />
            </div>
            {children}
            <TanStackDevtools
              config={{
                position: 'bottom-right'
              }}
              plugins={[
                {
                  name: 'Tanstack Router',
                  render: <TanStackRouterDevtoolsPanel />
                },
                TanStackQueryDevtools
              ]}
            />
          </TanStackQueryProvider>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: async () => {
    const [session, authConfig] = await Promise.all([
      getServerSession(),
      getAuthConfig()
    ])
    return { session, authConfig }
  },
  notFoundComponent: () => <p>Page not found</p>,
  head: () => ({
    meta: [
      {
        charSet: 'utf-8'
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1'
      },
      {
        title: 'TanStack Start Vite+ Boilerplate'
      },
      {
        name: 'description',
        content:
          'A TanStack Start starter wired with React Query, shared Zod API schemas, and a pnpm-first VitePlus workflow.'
      }
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss
      }
    ]
  }),
  shellComponent: RootDocument
})
