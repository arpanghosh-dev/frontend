import { parseResponse, validateInput } from '../../../utils/api'
import { apiClient } from '../../../utils/axios'
import type { FileItem } from '../../../types/file'
import {
  DeleteResponseSchema,
  DownloadUrlResponseSchema,
  FileIdSchema,
  FileListParamsSchema,
  FileListResponseSchema,
  FileResponseSchema,
} from '../schemas/fileManager.schemas'
import type { DeleteResult, DownloadUrl, FileListParams, FilePage } from '../types/fileManager.types'
import { ENDPOINTS } from './endpoints'
import { toFileItem } from './mappers'

/** Files tag — browse, details, download URL, delete */
export const filesApi = {
  /** GET /files — paginated, searchable, sortable */
  async list(params: FileListParams, signal?: AbortSignal): Promise<FilePage> {
    const query = validateInput(FileListParamsSchema, params)
    if (!query.search) delete query.search
    const res = await apiClient.get(ENDPOINTS.files, { params: query, signal })
    const body = parseResponse(FileListResponseSchema, res)
    return { items: body.data.map(toFileItem), pagination: body.meta.pagination }
  },

  /** GET /files/:id */
  async get(id: string, signal?: AbortSignal): Promise<FileItem> {
    const fileId = validateInput(FileIdSchema, id)
    const res = await apiClient.get(ENDPOINTS.file(fileId), { signal })
    return toFileItem(parseResponse(FileResponseSchema, res).data)
  },

  /** GET /files/:id/download-url — `inline: true` lets the browser display it (preview) */
  async getDownloadUrl(id: string, inline: boolean, signal?: AbortSignal): Promise<DownloadUrl> {
    const fileId = validateInput(FileIdSchema, id)
    const res = await apiClient.get(ENDPOINTS.downloadUrl(fileId), {
      params: { inline: String(inline) },
      signal,
    })
    return parseResponse(DownloadUrlResponseSchema, res).data
  },

  /** DELETE /files/:id — removes from S3 + DB and frees storage */
  async remove(id: string): Promise<DeleteResult> {
    const fileId = validateInput(FileIdSchema, id)
    const res = await apiClient.delete(ENDPOINTS.file(fileId))
    return parseResponse(DeleteResponseSchema, res).data
  },
}
