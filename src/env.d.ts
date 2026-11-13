/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL for the Axios client. Default "/api" (proxied to the backend by Vite in dev). */
  readonly VITE_API_BASE_URL?: string
  /** Backend origin the dev server proxies /api to. Default http://localhost:5000 */
  readonly VITE_API_PROXY_TARGET?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
