import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { FileItem } from '../../../types/file'
import { fileApi } from '../api/fileApi'
import { fileKeys } from './queryKeys'

/** Delete with optimistic update: the card disappears immediately and comes back if the request fails. */
export function useDeleteFile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: fileKeys.remove(),
    mutationFn: (file: FileItem) => fileApi.deleteFile(file.id),
    onMutate: async (file) => {
      await queryClient.cancelQueries({ queryKey: fileKeys.list() })
      const previous = queryClient.getQueryData<FileItem[]>(fileKeys.list())
      queryClient.setQueryData<FileItem[]>(fileKeys.list(), (old = []) => old.filter((f) => f.id !== file.id))
      return { previous }
    },
    onError: (_error, _file, context) => {
      if (context?.previous) queryClient.setQueryData(fileKeys.list(), context.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: fileKeys.list() })
      queryClient.invalidateQueries({ queryKey: fileKeys.storage() })
    },
  })
}
