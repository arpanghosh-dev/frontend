import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useDebouncedValue } from '../../../hooks/useDebouncedValue'
import { filesApi } from '../api/files.api'
import { PAGE_SIZE, SORT_PARAMS } from '../constants/fileManager.constants'
import { useFileManagerStore } from '../store/useFileManagerStore'
import type { FileListParams } from '../types/fileManager.types'
import { fileKeys } from './queryKeys'

/** Query params derived from the UI store (search is debounced). */
function useFileListParams(): Omit<FileListParams, 'page'> {
  const sort = useFileManagerStore((s) => s.sort)
  const search = useDebouncedValue(useFileManagerStore((s) => s.search).trim(), 300)

  return useMemo(
    () => ({ limit: PAGE_SIZE, status: 'COMPLETED', search: search || undefined, ...SORT_PARAMS[sort] }),
    [sort, search],
  )
}

/** GET /files — infinite pagination, server-side search + sort. */
export function useFiles() {
  const params = useFileListParams()

  return useInfiniteQuery({
    queryKey: fileKeys.list(params),
    queryFn: ({ pageParam, signal }) => filesApi.list({ ...params, page: pageParam }, signal),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.pagination.hasNextPage ? last.pagination.page + 1 : undefined),
    placeholderData: keepPreviousData, // keep showing old results while a new search/sort loads
  })
}

/** Loaded files after applying the type tab (client-side), plus the server total. */
export function useVisibleFiles() {
  const query = useFiles()
  const tab = useFileManagerStore((s) => s.tab)

  const all = useMemo(() => query.data?.pages.flatMap((p) => p.items) ?? [], [query.data])
  const files = useMemo(
    () =>
      all.filter((f) => {
        if (tab === 'all') return true
        if (tab === 'image') return f.type === 'png' || f.type === 'jpg'
        return f.type === tab
      }),
    [all, tab],
  )
  const total = query.data?.pages[0]?.pagination.total

  return { ...query, files, total }
}
