import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Keep PDFs as real files (browsers won't render data: URL PDFs in an iframe)
    assetsInlineLimit: (filePath) => (filePath.endsWith('.pdf') ? false : undefined),
  },
})
