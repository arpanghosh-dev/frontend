import { useMutation, useQuery } from '@tanstack/react-query'
import type { FileItem } from '../../../types/file'
import { toast } from '../../../store/useToastStore'
import { filesApi } from '../api/files.api'
import { fileKeys } from './queryKeys'

/** Refresh presigned URLs this long before they expire */
const EXPIRY_MARGIN_S = 30

/**
 * GET /files/:id/download-url?inline=true — presigned URL for previewing.
 * Cached until shortly before it expires, then refetched.
 */
export function usePreviewUrl(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: fileKeys.downloadUrl(id ?? '', true),
    queryFn: ({ signal }) => filesApi.getDownloadUrl(id!, true, signal),
    enabled: !!id && enabled,
    staleTime: (query) => {
      const expiresIn = query.state.data?.expiresIn ?? 0
      return Math.max(0, (expiresIn - EXPIRY_MARGIN_S) * 1000)
    },
    gcTime: 60_000,
  })
}

/** GET /files/:id/download-url?inline=false, then hands the URL to the browser to save. */
export function useDownloadFile() {
  return useMutation({
    mutationKey: fileKeys.download(),
    mutationFn: (file: FileItem) => filesApi.getDownloadUrl(file.id, false),
    onSuccess: ({ downloadUrl, fileName }) => {
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = fileName // ignored cross-origin; the server's inline=false URL sends it as an attachment
      link.target = '_blank' // never navigate the app away, even if the response is displayed inline
      link.rel = 'noopener'
      document.body.appendChild(link)
      link.click()
      link.remove()
    },
    onError: (error, file) => toast.error(`Couldn't download ${file.name}`, error.message),
  })
}
