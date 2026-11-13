# File Manager — Frontend

React 19 + TypeScript + Vite client for the **File Storage API** (upload to S3 via presigned URLs, browse, preview, download, delete, storage quota).

**Stack:** Axios (HTTP) · TanStack Query (server state) · Zustand (UI state) · Zod (request/response validation)

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
```

The backend must be running (default `http://localhost:5000`, API docs at `/api/docs`). In dev, Vite proxies `/api/*` to it, so no CORS setup is needed for API calls.

| Script | |
|---|---|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Type-check + production build to `dist/` |
| `npm run lint` | ESLint |
| `npm run preview` | Serve the production build |

### Environment (`.env`)

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | `/api` | Axios base URL. Use a full URL (e.g. `https://api.example.com/api`) when not using the dev proxy. |
| `VITE_API_PROXY_TARGET` | `http://localhost:5000` | Backend the dev server proxies `/api` to. |

### Backend requirements for uploads

Files go **straight from the browser to S3** using the presigned URL from the backend, so:

- The backend's AWS credentials and `AWS_REGION` must be real and match the bucket's region — otherwise S3 rejects the PUT (shows as *"Couldn't upload to cloud storage"* in the upload list).
- The bucket's CORS must allow `PUT` from the frontend origin with the `Content-Type` header.

## Project structure

```
src/
├── main.tsx                 QueryClientProvider + app root
├── App.tsx                  <FileManager /> + <ToastViewport />
├── index.css                Design tokens, reset, shared tone classes
├── components/              Reusable UI (each: Component.tsx + Component.css)
│   ├── Button  Dropdown  FileCard  FileDropzone  FilePreview  Icon
│   ├── Modal  SearchInput  StorageQuota  Tabs  TextField  Toast  UploadQueue
├── hooks/useDebouncedValue.ts
├── store/useToastStore.ts   App-wide toasts (`toast.success/error/info`)
├── types/file.ts            Shared FileItem model
├── utils/
│   ├── axios.ts             apiClient, s3Client, ApiError + error normalization
│   ├── api.ts               Zod helpers: successEnvelope, parseResponse, validateInput
│   ├── queryClient.ts       TanStack Query defaults
│   ├── store.ts             Zustand store factory (devtools in dev)
│   └── file.ts              Formatting + file-type helpers
└── pages/FileManager/
    ├── FileManager.tsx      Page layout only
    ├── api/                 One module per API tag (files, uploads, storage, health) + endpoints + mappers
    ├── schemas/             Zod schemas mirroring the OpenAPI spec
    ├── types/               Types inferred from schemas + UI types
    ├── constants/           Limits, sort/tab/filter options
    ├── hooks/               TanStack Query hooks + query keys
    ├── store/               Zustand UI store (filters, upload queue, modal)
    └── components/          Page sections: SidebarHeader, UploadPanel, StorageSummary,
                             FilesHeader, FilesToolbar, FileGrid, FileManagerModal, …
```

## How data flows

- **Server state** (files, storage, health, download URLs) lives only in TanStack Query. Components read it through hooks in `pages/FileManager/hooks/`.
- **UI state** (tab, sort, search, upload queue, which modal is open) lives in the Zustand store.
- **Every API call** validates its input with Zod before sending and its response after receiving. Any failure — backend error, S3, network, bad response — becomes an `ApiError { status, code, message, details }`; `code` matches backend codes such as `STORAGE_LIMIT_EXCEEDED`.

| Endpoint | Hook | Used for |
|---|---|---|
| `POST /uploads/presigned-url` → S3 `PUT` → `POST /uploads/complete` | `useUploadFiles` | Upload queue (3 in parallel, progress, cancel, retry) |
| `GET /files` | `useFiles` / `useVisibleFiles` | Grid — infinite scroll, server search + sort |
| `GET /files/:id` | `useFileDetails` | Preview details |
| `GET /files/:id/download-url` | `usePreviewUrl`, `useDownloadFile` | Preview (`inline=true`) and Download |
| `DELETE /files/:id` | `useDeleteFile` | Delete with optimistic update + rollback |
| `GET /storage` | `useStorage` | Quota bar |
| `PATCH /storage/limit` | `useUpdateStorageLimit` | "Edit storage limit" modal |
| `GET /health` | `useHealth` | Status pill (polled every 30s) |

**Note:** the type tabs (PDFs / PNGs / Images) filter the pages already loaded, because `GET /files` has no type filter.

## Adding an endpoint

1. Add the Zod schema in `schemas/` and its inferred type in `types/`.
2. Add the path in `api/endpoints.ts` and a function in the matching `api/*.api.ts` using `validateInput` / `parseResponse`.
3. Add a query key in `hooks/queryKeys.ts` and a `useQuery` / `useMutation` hook in `hooks/`.
