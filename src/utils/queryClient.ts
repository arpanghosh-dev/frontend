import { QueryClient } from '@tanstack/react-query'
import type { ApiError } from './axios'

/** TanStack Query client — global defaults for all server state. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // data counts as fresh for 30s
      gcTime: 5 * 60_000, // unused cache kept for 5 min
      retry: (failureCount, error) => {
        if (error.isCancelled) return false
        if (error.status && error.status >= 400 && error.status < 500) return false // client errors won't fix themselves
        if (error.code === 'INVALID_RESPONSE' || error.code === 'VALIDATION_ERROR') return false
        return failureCount < 2
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})

// Every query/mutation error is typed as ApiError (see utils/axios.ts)
declare module '@tanstack/react-query' {
  interface Register {
    defaultError: ApiError
  }
}
