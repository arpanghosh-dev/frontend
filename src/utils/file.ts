import type { FileType } from '../types/file'

export const KB = 1024
export const MB = 1024 * KB
export const GB = 1024 * MB

export function formatBytes(bytes: number): string {
  if (bytes < KB) return `${bytes} B`
  const units = ['KB', 'MB', 'GB', 'TB']
  let value = bytes / KB
  let i = 0
  while (value >= KB && i < units.length - 1) {
    value /= KB
    i++
  }
  const n = value >= 100 || i === 0 ? Math.round(value) : Number(value.toFixed(1))
  return `${n} ${units[i]}`
}

export function formatDate(date: Date): string {
  const now = new Date()
  if (date.toDateString() === now.toDateString()) {
    return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function getExtension(name: string): string {
  return name.split('.').pop()?.toLowerCase() ?? ''
}

export function getFileType(name: string): FileType {
  const ext = getExtension(name)
  if (ext === 'pdf') return 'pdf'
  if (ext === 'png') return 'png'
  if (ext === 'jpg' || ext === 'jpeg') return 'jpg'
  return 'other'
}

/** Only these three types can be previewed in the modal. */
export function isPreviewable(type: FileType): boolean {
  return type === 'pdf' || type === 'png' || type === 'jpg'
}
