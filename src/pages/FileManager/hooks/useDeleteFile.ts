import { useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query'
import type { FileItem } from '../../../types/file'
import { toast } from '../../../store/useToastStore'
import { formatBytes } from '../../../utils/file'
import { filesApi } from '../api/files.api'
import type { FilePage } from '../types/fileManager.types'
import { fileKeys, storageKeys } from './queryKeys'

type FileListData = InfiniteData<FilePage, number>

/**
 * DELETE /files/:id with an optimistic update: the card disappears at once
 * from every cached list, and is restored if the server refuses.
 */
export function useDeleteFile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: fileKeys.remove(),
    mutationFn: (file: FileItem) => filesApi.remove(file.id),
    onMutate: async (file) => {
      await queryClient.cancelQueries({ queryKey: fileKeys.lists() })
      const snapshot = queryClient.getQueriesData<FileListData>({ queryKey: fileKeys.lists() })
      queryClient.setQueriesData<FileListData>({ queryKey: fileKeys.lists() }, (old) =>
        old
          ? {
              ...old,
              pages: old.pages.map((page) => ({
                items: page.items.filter((f) => f.id !== file.id),
                pagination: { ...page.pagination, total: Math.max(0, page.pagination.total - 1) },
              })),
            }
          : old,
      )
      return { snapshot }
    },
    onSuccess: (result) => {
      queryClient.removeQueries({ queryKey: fileKeys.detail(result.id) })
      toast.success(`Deleted ${result.originalName}`, `${formatBytes(result.freedBytes)} freed`)
    },
    onError: (error, file, context) => {
      context?.snapshot.forEach(([key, data]) => queryClient.setQueryData(key, data))
      toast.error(`Couldn't delete ${file.name}`, error.message)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: fileKeys.lists() })
      queryClient.invalidateQueries({ queryKey: storageKeys.all })
    },
  })
}
