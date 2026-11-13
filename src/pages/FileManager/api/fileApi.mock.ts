/**
 * Mock backend for the File Manager endpoints (in-memory, resets on reload).
 * Only active while VITE_USE_MOCK_API is enabled — see src/utils/axios.ts.
 */
import { registerMockRoutes } from '../../../utils/mockAdapter'
import { GB, KB, MB, getFileType } from '../../../utils/file'
import type { FileDto } from '../types/fileManager.types'

import q3ReportPdf from '../../../assets/samples/q3_financial_report.pdf?url'
import contractPdf from '../../../assets/samples/contract_agreement_v2.pdf?url'
import heroBannerPng from '../../../assets/samples/hero_product_banner_v2.png'
import architecturePng from '../../../assets/samples/app_architecture_diagram.png'
import profilePhotoPng from '../../../assets/samples/profile_photo_hd.png'

const TOTAL_QUOTA = 50 * GB
/** Storage used by files outside this list (matches the design mock) */
const BASE_USED = 14.2 * GB

const todayAt1024 = new Date()
todayAt1024.setHours(10, 24, 0, 0)

let db: FileDto[] = [
  {
    id: 'f1', name: 'q3_financial_report.pdf', type: 'pdf', size: 2.4 * MB, createdAt: todayAt1024.toISOString(),
    url: q3ReportPdf, category: 'document', label: 'PDF Document', description: 'Synced to Cloud',
  },
  {
    id: 'f2', name: 'hero_product_banner_v2.png', type: 'png', size: 4.8 * MB, createdAt: '2024-10-14T09:00:00',
    url: heroBannerPng, category: 'asset', label: 'PNG Asset', dimensions: '2560 × 1440',
  },
  {
    id: 'f3', name: 'app_architecture_diagram.png', type: 'png', size: 1.9 * MB, createdAt: '2024-10-12T09:00:00',
    url: architecturePng, category: 'diagram', label: 'Architecture', description: 'Cloud Schematics',
  },
  {
    id: 'f4', name: 'profile_photo_hd.png', type: 'png', size: 3.2 * MB, createdAt: '2024-09-29T09:00:00',
    url: profilePhotoPng, category: 'photo', label: 'PNG Image', description: 'Original HD',
  },
  {
    id: 'f5', name: 'contract_agreement_v2.pdf', type: 'pdf', size: 840 * KB, createdAt: '2024-09-15T09:00:00',
    url: contractPdf, category: 'signed', label: 'Signed PDF', description: 'Verified Signature',
  },
]

const initialBytes = db.reduce((sum, f) => sum + f.size, 0)

function readImageDimensions(url: string): Promise<string | undefined> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(`${img.naturalWidth} × ${img.naturalHeight}`)
    img.onerror = () => resolve(undefined)
    img.src = url
  })
}

registerMockRoutes({
  'GET /files': () => ({ data: db }),

  'POST /files': async ({ body }) => {
    if (!(body instanceof FormData)) return { status: 400, data: { message: 'Expected multipart form data' } }
    const files = body.getAll('files').filter((f): f is File => f instanceof File)
    if (!files.length) return { status: 400, data: { message: 'No files received' } }

    const created = await Promise.all(
      files.map(async (file): Promise<FileDto> => {
        const type = getFileType(file.name)
        const url = URL.createObjectURL(file)
        return {
          id: crypto.randomUUID(),
          name: file.name,
          type,
          size: file.size,
          createdAt: new Date().toISOString(),
          url,
          dimensions: type === 'pdf' ? undefined : await readImageDimensions(url),
        }
      }),
    )
    db = [...created, ...db]
    return { status: 201, data: created }
  },

  'DELETE /files/:id': ({ params }) => {
    const file = db.find((f) => f.id === params.id)
    if (!file) return { status: 404, data: { message: 'File not found' } }
    if (file.url.startsWith('blob:')) URL.revokeObjectURL(file.url)
    db = db.filter((f) => f.id !== params.id)
    return { status: 204 }
  },

  'GET /storage': () => ({
    data: { used: BASE_USED + db.reduce((sum, f) => sum + f.size, 0) - initialBytes, total: TOTAL_QUOTA },
  }),
})
