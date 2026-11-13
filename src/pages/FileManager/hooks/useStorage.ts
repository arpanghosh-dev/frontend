import { useQuery } from '@tanstack/react-query'
import { fileApi } from '../api/fileApi'
import { fileKeys } from './queryKeys'

/** Storage quota (server state). */
export function useStorage() {
  return useQuery({
    queryKey: fileKeys.storage(),
    queryFn: fileApi.getStorage,
  })
}
