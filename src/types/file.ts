import type { IconName } from '../components/Icon/Icon'

export type FileType = 'pdf' | 'png' | 'jpg' | 'other'

export type FileStatus = 'PENDING' | 'COMPLETED' | 'DELETING' | 'FAILED'

export type Tone = 'red' | 'sky' | 'purple' | 'blue' | 'indigo'

/** A stored file as the UI uses it (mapped from the API's File DTO). */
export interface FileItem {
  id: string
  /** Original name as uploaded */
  name: string
  type: FileType
  mimeType: string
  extension: string | null
  size: number
  status: FileStatus
  addedAt: Date
  updatedAt: Date
  /* presentation */
  icon: IconName
  tone: Tone
  badge: string
  note: string
}
