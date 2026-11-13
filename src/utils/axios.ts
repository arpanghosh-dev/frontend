import axios, { AxiosError, isCancel } from 'axios'

/* ---------- Normalized error ---------- */

export interface ApiErrorDetail {
  location?: string
  field?: string
  message: string
}

interface ApiErrorInit {
  message: string
  code: string
  status?: number
  details?: ApiErrorDetail[]
}

/**
 * Every failed request (backend, S3, network, validation) is turned into this
 * one shape, so UI code only ever handles `ApiError`.
 * `code` mirrors the backend error codes (e.g. STORAGE_LIMIT_EXCEEDED) plus
 * client-side ones: NETWORK_ERROR, TIMEOUT, CANCELLED, INVALID_RESPONSE,
 * VALIDATION_ERROR, S3_UPLOAD_FAILED.
 */
export class ApiError extends Error {
  readonly code: string
  readonly status?: number
  readonly details: ApiErrorDetail[]

  constructor({ message, code, status, details = [] }: ApiErrorInit) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
    this.details = details
  }

  get isCancelled() {
    return this.code === 'CANCELLED'
  }
}

interface BackendErrorBody {
  error?: { code?: string; message?: string; details?: unknown }
}

function toDetails(value: unknown): ApiErrorDetail[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((d): d is ApiErrorDetail => typeof d === 'object' && d !== null && typeof d.message === 'string')
    .map(({ location, field, message }) => ({ location, field, message }))
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error
  if (isCancel(error)) return new ApiError({ code: 'CANCELLED', message: 'Request was cancelled' })

  if (error instanceof AxiosError) {
    const body = error.response?.data as BackendErrorBody | undefined
    if (body?.error?.message) {
      return new ApiError({
        status: error.response?.status,
        code: body.error.code ?? 'UNKNOWN_ERROR',
        message: body.error.message,
        details: toDetails(body.error.details),
      })
    }
    if (error.response) {
      return new ApiError({
        status: error.response.status,
        code: `HTTP_${error.response.status}`,
        message: `Request failed (HTTP ${error.response.status})`,
      })
    }
    if (error.code === AxiosError.ECONNABORTED || error.code === AxiosError.ETIMEDOUT) {
      return new ApiError({ code: 'TIMEOUT', message: 'The server took too long to respond' })
    }
    return new ApiError({ code: 'NETWORK_ERROR', message: "Can't reach the server. Check your connection." })
  }

  return new ApiError({ code: 'UNKNOWN_ERROR', message: error instanceof Error ? error.message : 'Something went wrong' })
}

/* ---------- Clients ---------- */

/** Backend API client. Base URL comes from VITE_API_BASE_URL (proxied to the backend in dev). */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30_000,
  headers: { Accept: 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(toApiError(error)),
)

/**
 * Bare client for presigned S3 URLs — no base URL, no auth header
 * (extra headers would break the S3 signature), no timeout for big files.
 */
export const s3Client = axios.create({ timeout: 0 })

s3Client.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalized = toApiError(error)
    if (normalized.isCancelled) return Promise.reject(normalized)
    if (normalized.code === 'NETWORK_ERROR') {
      // S3 rejections without CORS headers (bad signature/region, bucket CORS) surface as network errors
      return Promise.reject(
        new ApiError({
          code: 'S3_UPLOAD_FAILED',
          message: "Couldn't upload to cloud storage. The upload URL was rejected or blocked — check the backend's S3 settings.",
        }),
      )
    }
    return Promise.reject(
      new ApiError({
        code: 'S3_UPLOAD_FAILED',
        status: normalized.status,
        message: `Upload to storage failed${normalized.status ? ` (HTTP ${normalized.status})` : ''}`,
      }),
    )
  },
)
