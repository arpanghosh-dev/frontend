import type { DropdownOption } from '../../../components/Dropdown/Dropdown'
import type { TabItem } from '../../../components/Tabs/Tabs'
import type { FileItem } from '../../../types/file'
import { MB } from '../../../utils/file'
import type { FileListParams, SortValue, TabValue, TypeFilter } from '../types/fileManager.types'

/** UI upload limit per file (the server allows up to 5120 MB) */
export const MAX_UPLOAD_SIZE = 25 * MB
/** Files uploaded in parallel */
export const UPLOAD_CONCURRENCY = 3
/** Files fetched per page */
export const PAGE_SIZE = 20
/** Health check polling interval */
export const HEALTH_POLL_MS = 30_000

export const TYPE_FILTERS: Record<TypeFilter, { label: string; accept: string; hint: string }> = {
  all: { label: 'All File Types', accept: '.png,.jpg,.jpeg,.pdf', hint: 'PNG, JPG, PDF up to 25MB' },
  pdf: { label: 'PDF Documents', accept: '.pdf', hint: 'PDF only, up to 25MB' },
  png: { label: 'PNG Images', accept: '.png', hint: 'PNG only, up to 25MB' },
  jpg: { label: 'JPG Images', accept: '.jpg,.jpeg', hint: 'JPG / JPEG only, up to 25MB' },
}

export const TYPE_FILTER_OPTIONS: DropdownOption<TypeFilter>[] = (Object.keys(TYPE_FILTERS) as TypeFilter[]).map(
  (value) => ({ value, label: TYPE_FILTERS[value].label }),
)

export const SORT_OPTIONS: DropdownOption<SortValue>[] = [
  { value: 'recent', label: 'Recent' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'name', label: 'Name (A–Z)' },
  { value: 'size', label: 'Size' },
]

/** UI sort → API query params */
export const SORT_PARAMS: Record<SortValue, Pick<FileListParams, 'sortBy' | 'order'>> = {
  recent: { sortBy: 'createdAt', order: 'desc' },
  oldest: { sortBy: 'createdAt', order: 'asc' },
  name: { sortBy: 'originalName', order: 'asc' },
  size: { sortBy: 'fileSize', order: 'desc' },
}

export const TAB_ITEMS: TabItem<TabValue>[] = [
  { value: 'all', label: 'All Files' },
  { value: 'pdf', label: 'PDFs' },
  { value: 'png', label: 'PNGs' },
  { value: 'image', label: 'Images' },
]

/** Icon, colour and badge per file type */
export const TYPE_PRESENTATION: Record<FileItem['type'], Pick<FileItem, 'icon' | 'tone' | 'badge'>> = {
  pdf: { icon: 'file-text', tone: 'red', badge: 'PDF Document' },
  png: { icon: 'image', tone: 'sky', badge: 'PNG Image' },
  jpg: { icon: 'camera', tone: 'blue', badge: 'JPG Image' },
  other: { icon: 'file', tone: 'indigo', badge: 'File' },
}
