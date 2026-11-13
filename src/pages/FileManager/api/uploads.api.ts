import { parseResponse, validateInput } from '../../../utils/api'
import { apiClient, s3Client } from '../../../utils/axios'
import type { FileItem } from '../../../types/file'
import {
  CompleteUploadRequestSchema,
  FileResponseSchema,
  PresignedUrlRequestSchema,
  PresignedUrlResponseSchema,
} from '../schemas/fileManager.schemas'
import type { CompleteUploadRequest, PresignedUrl, PresignedUrlRequest } from '../types/fileManager.types'
import { ENDPOINTS } from './endpoints'
import { toFileItem } from './mappers'

interface S3UploadOptions {
  signal?: AbortSignal
  /** 0–100 */
  onProgress?: (percent: number) => void
}

/**
 * Uploads tag — presigned flow:
 *   1. createPresignedUrl  → reserves space, returns S3 PUT url
 *   2. uploadToS3          → browser PUTs the bytes straight to S3
 *   3. complete            → server verifies the object and marks it COMPLETED
 */
export const uploadsApi = {
  /** POST /uploads/presigned-url */
  async createPresignedUrl(input: PresignedUrlRequest, signal?: AbortSignal): Promise<PresignedUrl> {
    const body = validateInput(PresignedUrlRequestSchema, input)
    const res = await apiClient.post(ENDPOINTS.presignedUrl, body, { signal })
    return parseResponse(PresignedUrlResponseSchema, res).data
  },

  /** PUT <uploadUrl> — raw bytes to S3 with the headers the server signed */
  async uploadToS3(presigned: PresignedUrl, file: File, { signal, onProgress }: S3UploadOptions = {}): Promise<void> {
    await s3Client.request({
      url: presigned.uploadUrl,
      method: presigned.method || 'PUT',
      data: file,
      headers: presigned.headers,
      signal,
      onUploadProgress: (event) => {
        if (onProgress && event.total) onProgress(Math.round((event.loaded / event.total) * 100))
      },
    })
  },

  /** POST /uploads/complete */
  async complete(input: CompleteUploadRequest, signal?: AbortSignal): Promise<FileItem> {
    const body = validateInput(CompleteUploadRequestSchema, input)
    const res = await apiClient.post(ENDPOINTS.completeUpload, body, { signal })
    return toFileItem(parseResponse(FileResponseSchema, res).data)
  },
}
