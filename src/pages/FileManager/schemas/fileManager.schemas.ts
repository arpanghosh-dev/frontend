/**
 * Zod schemas for the File Storage API (OpenAPI: http://localhost:5000/api/docs).
 * Requests are validated before sending; responses are validated on arrival.
 */
import { z } from 'zod'
import { successEnvelope } from '../../../utils/api'
import { MB } from '../../../utils/file'

/** Server-side hard limit from the API docs (5120 MB) */
export const SERVER_MAX_FILE_SIZE = 5120 * MB

/* ---------- Shared ---------- */

export const FILE_STATUSES = ['PENDING', 'COMPLETED', 'DELETING', 'FAILED'] as const
export const FileStatusSchema = z.enum(FILE_STATUSES)

export const FileIdSchema = z.uuid('Invalid file id')

export const FileDtoSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  originalName: z.string(),
  mimeType: z.string(),
  extension: z.string().nullable(),
  fileSize: z.number().int().nonnegative(),
  fileSizeFormatted: z.string(),
  s3Key: z.string(),
  status: FileStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const PaginationSchema = z.object({
  page: z.number().int(),
  limit: z.number().int(),
  total: z.number().int(),
  totalPages: z.number().int(),
  hasNextPage: z.boolean(),
  hasPrevPage: z.boolean(),
})

/* ---------- Files ---------- */

export const FileListParamsSchema = z.object({
  page: z.int().min(1),
  limit: z.int().min(1).max(100),
  status: z.enum([...FILE_STATUSES, 'ALL']).optional(),
  search: z.string().trim().max(255, 'Search must be 255 characters or less').optional(),
  sortBy: z.enum(['createdAt', 'fileSize', 'originalName']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
})

export const FileListResponseSchema = successEnvelope(z.array(FileDtoSchema)).extend({
  meta: z.object({ pagination: PaginationSchema }),
})

export const FileResponseSchema = successEnvelope(FileDtoSchema)

export const DownloadUrlSchema = z.object({
  fileId: z.string(),
  fileName: z.string(),
  mimeType: z.string(),
  fileSize: z.number().int(),
  fileSizeFormatted: z.string(),
  downloadUrl: z.url(),
  expiresIn: z.number().int().positive(),
  expiresAt: z.string(),
})
export const DownloadUrlResponseSchema = successEnvelope(DownloadUrlSchema)

export const DeleteResultSchema = z.object({
  id: z.string(),
  originalName: z.string(),
  freedBytes: z.number().int().nonnegative(),
})
export const DeleteResponseSchema = successEnvelope(DeleteResultSchema)

/* ---------- Uploads ---------- */

export const PresignedUrlRequestSchema = z.object({
  fileName: z.string().trim().min(1, 'File name is required').max(255, 'File name must be 255 characters or less'),
  mimeType: z.string().min(1, 'Unknown file type').max(150, 'MIME type is too long'),
  fileSize: z
    .int()
    .min(1, 'File is empty')
    .max(SERVER_MAX_FILE_SIZE, 'File is larger than the 5120 MB server limit'),
})

export const PresignedUrlSchema = z.object({
  uploadSessionId: z.string(),
  fileId: z.string(),
  uploadUrl: z.url(),
  method: z.string(),
  headers: z.record(z.string(), z.string()),
  s3Key: z.string(),
  expiresIn: z.number().int(),
  expiresAt: z.string(),
  completeBefore: z.string(),
})
export const PresignedUrlResponseSchema = successEnvelope(PresignedUrlSchema)

export const CompleteUploadRequestSchema = z.object({
  uploadSessionId: z.uuid('Invalid upload session id'),
})

/* ---------- Storage ---------- */

export const StorageStatsSchema = z.object({
  totalLimit: z.number().int(),
  usedStorage: z.number().int(),
  reservedStorage: z.number().int(),
  availableStorage: z.number().int(),
  usagePercentage: z.number(),
  committedPercentage: z.number(),
  formatted: z.object({
    totalLimit: z.string(),
    usedStorage: z.string(),
    reservedStorage: z.string(),
    availableStorage: z.string(),
  }),
  fileCount: z.number().int(),
  pendingUploads: z.number().int(),
  updatedAt: z.string(),
})
export const StorageStatsResponseSchema = successEnvelope(StorageStatsSchema)

/** Exactly one of limitGB / limitBytes */
export const UpdateStorageLimitRequestSchema = z.union([
  z.strictObject({ limitGB: z.number().positive('Limit must be greater than 0') }),
  z.strictObject({ limitBytes: z.int().positive('Limit must be greater than 0') }),
])

/* ---------- Health ---------- */

export const HealthResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.object({
    status: z.enum(['ok', 'degraded']),
    services: z.object({
      api: z.string(),
      database: z.enum(['up', 'down']),
    }),
    uptime: z.number(),
    timestamp: z.string(),
  }),
})
