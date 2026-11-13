import { useIsMutating, useMutation, useQueryClient } from '@tanstack/react-query'
import type { FileItem } from '../../../types/file'
import { fileApi } from '../api/fileApi'
import { useFileManagerStore } from '../store/useFileManagerStore'
import { fileKeys } from './queryKeys'

export function useUploadFiles() {
  const queryClient = useQueryClient()
  const setRecentIds = useFileManagerStore((s) => s.setRecentIds)

  return useMutation({
    mutationKey: fileKeys.upload(),
    mutationFn: fileApi.uploadFiles,
    onSuccess: (created) => {
      // Put the new files straight into the cached list (no refetch needed)
      queryClient.setQueryData<FileItem[]>(fileKeys.list(), (old = []) => [...created, ...old])
      setRecentIds(created.map((f) => f.id))
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: fileKeys.storage() }),
  })
}

/** True while any upload is in flight — usable from any component. */
export function useIsUploading() {
  return useIsMutating({ mutationKey: fileKeys.upload() }) > 0
}
