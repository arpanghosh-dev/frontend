import { useQuery } from '@tanstack/react-query'
import { healthApi } from '../api/health.api'
import { HEALTH_POLL_MS } from '../constants/fileManager.constants'
import { healthKeys } from './queryKeys'

export type ConnectionState = 'checking' | 'ok' | 'degraded' | 'offline'

/** GET /health, polled — drives the status pill in the sidebar. */
export function useHealth() {
  const query = useQuery({
    queryKey: healthKeys.status(),
    queryFn: ({ signal }) => healthApi.get(signal),
    refetchInterval: HEALTH_POLL_MS,
    refetchOnWindowFocus: true,
    retry: false,
  })

  let state: ConnectionState = 'checking'
  if (query.isError) state = 'offline'
  else if (query.data) state = query.data.status === 'ok' ? 'ok' : 'degraded'

  return { ...query, state }
}
