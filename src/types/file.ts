import type { IconName } from '../components/Icon/Icon'

export type FileType = 'pdf' | 'png' | 'jpg' | 'other'

export type Tone = 'red' | 'sky' | 'purple' | 'blue' | 'indigo'

export interface FileItem {
  id: string
  name: string
  type: FileType
  size: number
  addedAt: Date
  icon: IconName
  tone: Tone
  badge: string
  note: string
  url: string
  dimensions?: string
}
