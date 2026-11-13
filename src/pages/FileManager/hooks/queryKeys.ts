import type { FileListParams } from '../types/fileManager.types'

/** TanStack Query keys for the File Manager — one source of truth. */
export const fileKeys = {
  all: ['files'] as const,
  lists: () => [...fileKeys.all, 'list'] as const,
  list: (params: Omit<FileListParams, 'page'>) => [...fileKeys.lists(), params] as const,
  details: () => [...fileKeys.all, 'detail'] as const,
  detail: (id: string) => [...fileKeys.details(), id] as const,
  downloadUrl: (id: string, inline: boolean) => [...fileKeys.all, 'download-url', id, inline] as const,
  upload: () => [...fileKeys.all, 'upload'] as const,
  remove: () => [...fileKeys.all, 'delete'] as const,
  download: () => [...fileKeys.all, 'download'] as const,
}

export const storageKeys = {
  all: ['storage'] as const,
  stats: () => [...storageKeys.all, 'stats'] as const,
  updateLimit: () => [...storageKeys.all, 'update-limit'] as const,
}

export const healthKeys = {
  status: () => ['health'] as const,
}
