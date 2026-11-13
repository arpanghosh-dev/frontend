import type { DropdownOption } from '../../../components/Dropdown/Dropdown'
import type { TabItem } from '../../../components/Tabs/Tabs'
import type { FileItem } from '../../../types/file'
import { MB } from '../../../utils/file'
import type { FileCategory, SortValue, TabValue, TypeFilter } from '../types/fileManager.types'

export const MAX_UPLOAD_SIZE = 25 * MB

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

export const TAB_ITEMS: TabItem<TabValue>[] = [
  { value: 'all', label: 'All Files' },
  { value: 'pdf', label: 'PDFs' },
  { value: 'png', label: 'PNGs' },
  { value: 'image', label: 'Images' },
]

export const SORTERS: Record<SortValue, (a: FileItem, b: FileItem) => number> = {
  recent: (a, b) => b.addedAt.getTime() - a.addedAt.getTime(),
  oldest: (a, b) => a.addedAt.getTime() - b.addedAt.getTime(),
  name: (a, b) => a.name.localeCompare(b.name),
  size: (a, b) => b.size - a.size,
}

/** Icon + colour for each server-side category */
export const CATEGORY_STYLE: Record<FileCategory, Pick<FileItem, 'icon' | 'tone'>> = {
  document: { icon: 'file-text', tone: 'red' },
  asset: { icon: 'image', tone: 'sky' },
  diagram: { icon: 'chart', tone: 'purple' },
  photo: { icon: 'camera', tone: 'blue' },
  signed: { icon: 'shield-check', tone: 'indigo' },
}

/** Fallback presentation by file type when the server sends no category/label */
export const TYPE_DEFAULTS: Record<FileItem['type'], Pick<FileItem, 'icon' | 'tone' | 'badge'>> = {
  pdf: { icon: 'file-text', tone: 'red', badge: 'PDF Document' },
  png: { icon: 'image', tone: 'sky', badge: 'PNG Image' },
  jpg: { icon: 'image', tone: 'blue', badge: 'JPG Image' },
  other: { icon: 'file', tone: 'indigo', badge: 'File' },
}
