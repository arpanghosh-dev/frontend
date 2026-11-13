import { parseResponse, validateInput } from '../../../utils/api'
import { apiClient } from '../../../utils/axios'
import { StorageStatsResponseSchema, UpdateStorageLimitRequestSchema } from '../schemas/fileManager.schemas'
import type { StorageStats, UpdateStorageLimitRequest } from '../types/fileManager.types'
import { ENDPOINTS } from './endpoints'

/** Storage tag — usage stats and limit */
export const storageApi = {
  /** GET /storage */
  async getStats(signal?: AbortSignal): Promise<StorageStats> {
    const res = await apiClient.get(ENDPOINTS.storage, { signal })
    return parseResponse(StorageStatsResponseSchema, res).data
  },

  /** PATCH /storage/limit — send exactly one of limitGB / limitBytes */
  async updateLimit(input: UpdateStorageLimitRequest): Promise<StorageStats> {
    const body = validateInput(UpdateStorageLimitRequestSchema, input)
    const res = await apiClient.patch(ENDPOINTS.storageLimit, body)
    return parseResponse(StorageStatsResponseSchema, res).data
  },
}
