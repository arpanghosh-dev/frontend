/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL for the Axios client, e.g. https://api.example.com */
  readonly VITE_API_BASE_URL?: string
  /** "false" sends requests to the real API; anything else uses the in-browser mock */
  readonly VITE_USE_MOCK_API?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
