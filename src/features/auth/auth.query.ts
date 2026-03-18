import { queryOptions } from '@tanstack/react-query'
import { getAuthConfig } from '@/lib/server/auth-config'

export const authConfigQueryKey = ['auth-config']

export const authConfigQueryOptions = () => {
  return queryOptions({
    queryKey: authConfigQueryKey,
    queryFn: () => getAuthConfig(),
    staleTime: Infinity
  })
}
