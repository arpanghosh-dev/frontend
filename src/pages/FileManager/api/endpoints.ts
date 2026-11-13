/** File Storage API routes (relative to VITE_API_BASE_URL, i.e. /api). */
export const ENDPOINTS = {
  files: '/files',
  file: (id: string) => `/files/${encodeURIComponent(id)}`,
  downloadUrl: (id: string) => `/files/${encodeURIComponent(id)}/download-url`,
  presignedUrl: '/uploads/presigned-url',
  completeUpload: '/uploads/complete',
  storage: '/storage',
  storageLimit: '/storage/limit',
  health: '/health',
} as const
