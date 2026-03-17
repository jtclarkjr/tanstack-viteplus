import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

let context:
  | {
      queryClient: QueryClient
    }
  | undefined

const makeQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: 1,
        refetchOnWindowFocus: false
      }
    }
  })
}

export const getContext = () => {
  if (context) {
    return context
  }

  const queryClient = makeQueryClient()

  context = {
    queryClient
  }

  return context
}

const TanStackQueryProvider = ({ children }: { children: ReactNode }) => {
  const { queryClient } = getContext()

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

export default TanStackQueryProvider
