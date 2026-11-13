import { AxiosError, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'

/**
 * Tiny in-browser mock server for Axios. Features register their routes with
 * `registerMockRoutes`; the Axios instance uses `mockAdapter` while
 * VITE_USE_MOCK_API is enabled. Delete this once the real backend exists.
 */

type Method = 'get' | 'post' | 'put' | 'patch' | 'delete'

export interface MockRequest {
  params: Record<string, string>
  query: Record<string, unknown>
  body: unknown
}

export interface MockResult {
  status?: number
  data?: unknown
}

type MockHandler = (req: MockRequest) => MockResult | Promise<MockResult>

interface Route {
  method: Method
  pattern: RegExp
  keys: string[]
  handler: MockHandler
}

const routes: Route[] = []

/** Register routes like `{ 'GET /files': handler, 'DELETE /files/:id': handler }` */
export function registerMockRoutes(definitions: Record<string, MockHandler>) {
  Object.entries(definitions).forEach(([key, handler]) => {
    const [method, path] = key.split(' ')
    const keys: string[] = []
    const pattern = new RegExp(
      `^${path.replace(/:(\w+)/g, (_, k: string) => {
        keys.push(k)
        return '([^/]+)'
      })}/?$`,
    )
    routes.push({ method: method.toLowerCase() as Method, pattern, keys, handler })
  })
}

const LATENCY_MS = { min: 250, max: 650 }
const delay = () =>
  new Promise((r) => setTimeout(r, LATENCY_MS.min + Math.random() * (LATENCY_MS.max - LATENCY_MS.min)))

export const mockAdapter: AxiosAdapter = async (config: InternalAxiosRequestConfig) => {
  await delay()
  const method = (config.method ?? 'get').toLowerCase()
  const path = (config.url ?? '').split('?')[0]

  for (const route of routes) {
    const match = route.method === method ? route.pattern.exec(path) : null
    if (!match) continue

    const params = Object.fromEntries(route.keys.map((k, i) => [k, decodeURIComponent(match[i + 1])]))
    const body = typeof config.data === 'string' ? safeJson(config.data) : config.data
    const { status = 200, data = null } = await route.handler({ params, query: config.params ?? {}, body })

    const response: AxiosResponse = { data, status, statusText: String(status), headers: {}, config, request: {} }
    if (status >= 400) {
      throw new AxiosError(`Request failed with status code ${status}`, String(status), config, {}, response)
    }
    return response
  }

  const notFound: AxiosResponse = {
    data: { message: `No mock route for ${method.toUpperCase()} ${path}` },
    status: 404,
    statusText: 'Not Found',
    headers: {},
    config,
    request: {},
  }
  throw new AxiosError('Not Found', '404', config, {}, notFound)
}

function safeJson(text: string) {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}
