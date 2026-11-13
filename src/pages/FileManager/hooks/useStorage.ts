import { useIsMutating, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '../../../store/useToastStore'
import { storageApi } from '../api/storage.api'
import type { UpdateStorageLimitRequest } from '../types/fileManager.types'
import { storageKeys } from './queryKeys'

/** GET /storage — usage statistics. */
export function useStorage() {
  return useQuery({
    queryKey: storageKeys.stats(),
    queryFn: ({ signal }) => storageApi.getStats(signal),
  })
}

/** PATCH /storage/limit — the response is the new stats, so write it straight into the cache. */
export function useUpdateStorageLimit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: storageKeys.updateLimit(),
    mutationFn: (input: UpdateStorageLimitRequest) => storageApi.updateLimit(input),
    onSuccess: (stats) => {
      queryClient.setQueryData(storageKeys.stats(), stats)
      toast.success('Storage limit updated', `New limit: ${stats.formatted.totalLimit}`)
    },
  })
}

export function useIsUpdatingStorageLimit() {
  return useIsMutating({ mutationKey: storageKeys.updateLimit() }) > 0
}
