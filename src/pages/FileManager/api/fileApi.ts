import { apiClient } from '../../../utils/axios'
import type { FileItem } from '../../../types/file'
import { CATEGORY_STYLE, TYPE_DEFAULTS } from '../constants/fileManager.constants'
import type { FileDto, StorageDto } from '../types/fileManager.types'
import './fileApi.mock' // registers mock routes (only used while VITE_USE_MOCK_API is on)

/** Endpoint paths in one place */
export const FILE_ENDPOINTS = {
  list: '/files',
  upload: '/files',
  remove: (id: string) => `/files/${encodeURIComponent(id)}`,
  storage: '/storage',
} as const

/** Server DTO → UI model */
export function toFileItem(dto: FileDto): FileItem {
  const defaults = TYPE_DEFAULTS[dto.type]
  const style = dto.category ? CATEGORY_STYLE[dto.category] : defaults
  return {
    id: dto.id,
    name: dto.name,
    type: dto.type,
    size: dto.size,
    addedAt: new Date(dto.createdAt),
    url: dto.url,
    icon: style.icon,
    tone: style.tone,
    badge: dto.label ?? defaults.badge,
    note: dto.description ?? dto.dimensions ?? 'Uploaded just now',
    dimensions: dto.dimensions,
  }
}

export const fileApi = {
  async getFiles(): Promise<FileItem[]> {
    const { data } = await apiClient.get<FileDto[]>(FILE_ENDPOINTS.list)
    return data.map(toFileItem)
  },

  async uploadFiles(files: File[]): Promise<FileItem[]> {
    const form = new FormData()
    files.forEach((file) => form.append('files', file))
    const { data } = await apiClient.post<FileDto[]>(FILE_ENDPOINTS.upload, form)
    return data.map(toFileItem)
  },

  async deleteFile(id: string): Promise<void> {
    await apiClient.delete(FILE_ENDPOINTS.remove(id))
  },

  async getStorage(): Promise<StorageDto> {
    const { data } = await apiClient.get<StorageDto>(FILE_ENDPOINTS.storage)
    return data
  },
}
