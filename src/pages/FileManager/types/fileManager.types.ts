import type { FileItem, FileType } from '../../../types/file'

/* ---------- API contracts (what the server sends) ---------- */

/** Presentation hint the server can attach to a file. */
export type FileCategory = 'document' | 'asset' | 'diagram' | 'photo' | 'signed'

export interface FileDto {
  id: string
  name: string
  type: FileType
  size: number
  /** ISO 8601 */
  createdAt: string
  url: string
  category?: FileCategory
  /** Badge text, e.g. "Signed PDF" */
  label?: string
  /** Footer text, e.g. "Synced to Cloud" */
  description?: string
  /** "2560 × 1440" for images */
  dimensions?: string
}

export interface StorageDto {
  used: number
  total: number
}

/* ---------- UI state ---------- */

/** Sidebar "File type pre-filter" — limits what can be selected for upload */
export type TypeFilter = 'all' | 'pdf' | 'png' | 'jpg'

/** Tabs above the grid */
export type TabValue = 'all' | 'pdf' | 'png' | 'image'

export type SortValue = 'recent' | 'oldest' | 'name' | 'size'

export interface ModalState {
  kind: 'preview' | 'delete'
  file: FileItem
}
