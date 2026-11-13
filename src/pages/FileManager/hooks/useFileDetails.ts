import { useQuery } from '@tanstack/react-query'
import { filesApi } from '../api/files.api'
import { fileKeys } from './queryKeys'

/** GET /files/:id — fresh details for the preview modal. */
export function useFileDetails(id: string | undefined) {
  return useQuery({
    queryKey: fileKeys.detail(id ?? ''),
    queryFn: ({ signal }) => filesApi.get(id!, signal),
    enabled: !!id,
  })
}
