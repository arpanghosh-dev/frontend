import { QueryClient } from '@tanstack/react-query'
import type { ApiError } from './axios'

/** TanStack Query client — global defaults for all server state. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // data counts as fresh for 30s
      gcTime: 5 * 60_000, // unused cache kept for 5 min
      retry: (failureCount, error) => {
        const status = (error as ApiError | undefined)?.status
        if (status && status >= 400 && status < 500) return false // don't retry client errors
        return failureCount < 2
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})

declare module '@tanstack/react-query' {
  interface Register {
    defaultError: ApiError
  }
}
