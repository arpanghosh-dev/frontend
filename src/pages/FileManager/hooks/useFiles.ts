import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { fileApi } from '../api/fileApi'
import { SORTERS } from '../constants/fileManager.constants'
import { useFileManagerStore } from '../store/useFileManagerStore'
import { fileKeys } from './queryKeys'

/** All files (server state). */
export function useFiles() {
  return useQuery({
    queryKey: fileKeys.list(),
    queryFn: fileApi.getFiles,
  })
}

/** Files after applying the active tab + sort from the UI store. */
export function useVisibleFiles() {
  const query = useFiles()
  const tab = useFileManagerStore((s) => s.tab)
  const sort = useFileManagerStore((s) => s.sort)

  const files = useMemo(() => {
    const list = (query.data ?? []).filter((f) => {
      if (tab === 'all') return true
      if (tab === 'image') return f.type === 'png' || f.type === 'jpg'
      return f.type === tab
    })
    return list.sort(SORTERS[sort])
  }, [query.data, tab, sort])

  return { ...query, files }
}
