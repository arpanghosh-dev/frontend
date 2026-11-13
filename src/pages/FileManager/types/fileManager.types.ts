import type { z } from 'zod'
import type { FileItem } from '../../../types/file'
import type {
  CompleteUploadRequestSchema,
  DeleteResultSchema,
  DownloadUrlSchema,
  FileDtoSchema,
  FileListParamsSchema,
  HealthResponseSchema,
  PaginationSchema,
  PresignedUrlRequestSchema,
  PresignedUrlSchema,
  StorageStatsSchema,
  UpdateStorageLimitRequestSchema,
} from '../schemas/fileManager.schemas'

/* ---------- API contracts (inferred from the Zod schemas) ---------- */

export type FileDto = z.infer<typeof FileDtoSchema>
export type Pagination = z.infer<typeof PaginationSchema>
export type FileListParams = z.input<typeof FileListParamsSchema>
export type DownloadUrl = z.infer<typeof DownloadUrlSchema>
export type DeleteResult = z.infer<typeof DeleteResultSchema>
export type PresignedUrlRequest = z.infer<typeof PresignedUrlRequestSchema>
export type PresignedUrl = z.infer<typeof PresignedUrlSchema>
export type CompleteUploadRequest = z.infer<typeof CompleteUploadRequestSchema>
export type StorageStats = z.infer<typeof StorageStatsSchema>
export type UpdateStorageLimitRequest = z.infer<typeof UpdateStorageLimitRequestSchema>
export type Health = z.infer<typeof HealthResponseSchema>['data']

/** One page of the file list, already mapped for the UI */
export interface FilePage {
  items: FileItem[]
  pagination: Pagination
}

/* ---------- UI state ---------- */

/** Sidebar "File type pre-filter" — limits what can be selected for upload */
export type TypeFilter = 'all' | 'pdf' | 'png' | 'jpg'

/** Tabs above the grid (filtered client-side; the API has no type filter) */
export type TabValue = 'all' | 'pdf' | 'png' | 'image'

/** Maps to the API's sortBy + order */
export type SortValue = 'recent' | 'oldest' | 'name' | 'size'

export type UploadStatus = 'queued' | 'uploading' | 'completing' | 'done' | 'error'

/** A file in the sidebar upload queue */
export interface UploadItem {
  id: string
  file: File
  status: UploadStatus
  /** 0–100 */
  progress: number
  error?: string
}

export type ModalState =
  | { kind: 'preview'; file: FileItem }
  | { kind: 'delete'; file: FileItem }
  | { kind: 'storage-limit' }
