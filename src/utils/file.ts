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

export function formatDateTime(date: Date): string {
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export function getExtension(name: string): string {
  return name.includes('.') ? (name.split('.').pop()?.toLowerCase() ?? '') : ''
}

const MIME_TO_TYPE: Record<string, FileType> = {
  'application/pdf': 'pdf',
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
}

/** File type from the extension, falling back to the MIME type. */
export function getFileType(name: string, mimeType?: string): FileType {
  const ext = getExtension(name)
  if (ext === 'pdf') return 'pdf'
  if (ext === 'png') return 'png'
  if (ext === 'jpg' || ext === 'jpeg') return 'jpg'
  return (mimeType && MIME_TO_TYPE[mimeType.toLowerCase()]) || 'other'
}

const EXT_TO_MIME: Record<string, string> = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
}

/** MIME type for an upload — the browser's value, else derived from the extension. */
export function resolveMimeType(file: File): string {
  return file.type || EXT_TO_MIME[getExtension(file.name)] || 'application/octet-stream'
}

/** Only these three types can be previewed in the modal. */
export function isPreviewable(type: FileType): boolean {
  return type === 'pdf' || type === 'png' || type === 'jpg'
}
