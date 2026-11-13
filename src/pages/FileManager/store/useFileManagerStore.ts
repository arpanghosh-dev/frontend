import { createStore } from '../../../utils/store'
import { getExtension } from '../../../utils/file'
import type { FileItem } from '../../../types/file'
import { TYPE_FILTERS } from '../constants/fileManager.constants'
import type { ModalState, SortValue, TabValue, TypeFilter, UploadItem } from '../types/fileManager.types'

/**
 * Client/UI state for the File Manager page (Zustand).
 * Server data (files, storage, health) lives in TanStack Query — see ../hooks.
 */
interface FileManagerState {
  /* Upload panel */
  typeFilter: TypeFilter
  uploads: UploadItem[]
  dropError: string
  /* Grid */
  tab: TabValue
  sort: SortValue
  search: string
  recentIds: string[]
  /* Shared modal */
  modal: ModalState | null
  modalOpen: boolean

  setTypeFilter: (value: TypeFilter) => void
  addFiles: (valid: File[], rejected: string[]) => void
  updateUpload: (id: string, patch: Partial<Omit<UploadItem, 'id' | 'file'>>) => void
  removeUpload: (id: string) => void
  setTab: (tab: TabValue) => void
  setSort: (sort: SortValue) => void
  setSearch: (search: string) => void
  markRecent: (id: string) => void
  openPreview: (file: FileItem) => void
  openDelete: (file: FileItem) => void
  openStorageLimit: () => void
  closeModal: () => void
}

export const useFileManagerStore = createStore<FileManagerState>('fileManager', (set) => ({
  typeFilter: 'all',
  uploads: [],
  dropError: '',
  tab: 'all',
  sort: 'recent',
  search: '',
  recentIds: [],
  modal: null,
  modalOpen: false,

  setTypeFilter: (typeFilter) =>
    set(
      (state) => {
        // Drop queued files that no longer match the new filter (in-flight ones are left alone)
        const allowed = TYPE_FILTERS[typeFilter].accept.split(',')
        const uploads = state.uploads.filter(
          (u) => u.status !== 'queued' || allowed.includes(`.${getExtension(u.file.name)}`),
        )
        const removed = uploads.length !== state.uploads.length
        return {
          typeFilter,
          uploads,
          dropError: removed ? "Removed selected files that don't match the new filter." : '',
        }
      },
      false,
      'setTypeFilter',
    ),

  addFiles: (valid, rejected) =>
    set(
      (state) => {
        const isDuplicate = (f: File) =>
          state.uploads.some((u) => u.status === 'queued' && u.file.name === f.name && u.file.size === f.size)
        const added: UploadItem[] = valid
          .filter((f) => !isDuplicate(f))
          .map((file) => ({ id: crypto.randomUUID(), file, status: 'queued', progress: 0 }))
        return {
          dropError: rejected.length ? `Skipped: ${rejected.join(', ')}` : '',
          uploads: [...state.uploads, ...added],
        }
      },
      false,
      'addFiles',
    ),

  updateUpload: (id, patch) =>
    set((state) => ({ uploads: state.uploads.map((u) => (u.id === id ? { ...u, ...patch } : u)) }), false, 'updateUpload'),

  removeUpload: (id) => set((state) => ({ uploads: state.uploads.filter((u) => u.id !== id) }), false, 'removeUpload'),

  setTab: (tab) => set({ tab }, false, 'setTab'),
  setSort: (sort) => set({ sort }, false, 'setSort'),
  setSearch: (search) => set({ search }, false, 'setSearch'),
  markRecent: (id) => set((state) => ({ recentIds: [...state.recentIds.slice(-19), id] }), false, 'markRecent'),

  openPreview: (file) => set({ modal: { kind: 'preview', file }, modalOpen: true }, false, 'openPreview'),
  openDelete: (file) => set({ modal: { kind: 'delete', file }, modalOpen: true }, false, 'openDelete'),
  openStorageLimit: () => set({ modal: { kind: 'storage-limit' }, modalOpen: true }, false, 'openStorageLimit'),
  // Keep `modal` so content stays visible during the fade-out
  closeModal: () => set({ modalOpen: false }, false, 'closeModal'),
}))
