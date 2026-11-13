import axios, { AxiosError } from 'axios'
import { mockAdapter } from './mockAdapter'

export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== 'false'

/**
 * Shared Axios instance for every API call in the app.
 * With VITE_USE_MOCK_API=true (default) requests are answered in-browser by
 * the mock adapter; set it to "false" to hit VITE_API_BASE_URL for real.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 30_000,
  headers: { Accept: 'application/json' },
  adapter: USE_MOCK_API ? mockAdapter : undefined,
})

// Attach auth token (if any) to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

/** Normalized error shape so UI code never deals with raw Axios errors. */
export interface ApiError {
  status?: number
  message: string
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const apiError: ApiError = {
      status: error.response?.status,
      message: error.response?.data?.message ?? error.message ?? 'Something went wrong',
    }
    return Promise.reject(apiError)
  },
)
