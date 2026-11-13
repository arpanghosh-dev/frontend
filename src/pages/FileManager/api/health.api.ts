import { parseResponse } from '../../../utils/api'
import { apiClient } from '../../../utils/axios'
import { HealthResponseSchema } from '../schemas/fileManager.schemas'
import type { Health } from '../types/fileManager.types'
import { ENDPOINTS } from './endpoints'

/** Health tag */
export const healthApi = {
  /** GET /health — 503 still carries a body (database down), so treat it as data, not an error */
  async get(signal?: AbortSignal): Promise<Health> {
    const res = await apiClient.get(ENDPOINTS.health, {
      signal,
      timeout: 8_000,
      validateStatus: (status) => status === 200 || status === 503,
    })
    return parseResponse(HealthResponseSchema, res).data
  },
}
