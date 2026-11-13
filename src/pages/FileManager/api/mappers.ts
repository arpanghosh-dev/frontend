import type { FileItem } from '../../../types/file'
import { getFileType } from '../../../utils/file'
import { TYPE_PRESENTATION } from '../constants/fileManager.constants'
import type { FileDto } from '../types/fileManager.types'

/** API File DTO → UI model */
export function toFileItem(dto: FileDto): FileItem {
  const type = getFileType(dto.originalName, dto.mimeType)
  return {
    id: dto.id,
    name: dto.originalName,
    type,
    mimeType: dto.mimeType,
    extension: dto.extension,
    size: dto.fileSize,
    status: dto.status,
    addedAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
    ...TYPE_PRESENTATION[type],
    note: dto.status === 'COMPLETED' ? 'Synced to Cloud' : dto.status.toLowerCase(),
  }
}
