import { createStore } from '../../../utils/store'
import { getExtension } from '../../../utils/file'
import type { FileItem } from '../../../types/file'
import { TYPE_FILTERS } from '../constants/fileManager.constants'
import type { ModalState, SortValue, TabValue, TypeFilter } from '../types/fileManager.types'

/**
 * Client/UI state for the File Manager page (Zustand).
 * Server data (files, storage) lives in TanStack Query — see ../hooks.
 */
interface FileManagerState {
  /* Upload panel */
  typeFilter: TypeFilter
  staged: File[]
  dropError: string
  /* Grid */
  tab: TabValue
  sort: SortValue
  recentIds: string[]
  /* Shared modal */
  modal: ModalState | null
  modalOpen: boolean

  setTypeFilter: (value: TypeFilter) => void
  addStaged: (valid: File[], rejected: string[]) => void
  removeStaged: (index: number) => void
  clearStaged: () => void
  setTab: (tab: TabValue) => void
  setSort: (sort: SortValue) => void
  setRecentIds: (ids: string[]) => void
  openPreview: (file: FileItem) => void
  openDelete: (file: FileItem) => void
  closeModal: () => void
}

export const useFileManagerStore = createStore<FileManagerState>('fileManager', (set) => ({
  typeFilter: 'all',
  staged: [],
  dropError: '',
  tab: 'all',
  sort: 'recent',
  recentIds: [],
  modal: null,
  modalOpen: false,

  setTypeFilter: (typeFilter) =>
    set(
      (state) => {
        // Drop selected files that no longer match the new filter
        const allowed = TYPE_FILTERS[typeFilter].accept.split(',')
        const staged = state.staged.filter((f) => allowed.includes(`.${getExtension(f.name)}`))
        const removed = staged.length !== state.staged.length
        return {
          typeFilter,
          staged,
          dropError: removed ? "Removed selected files that don't match the new filter." : '',
        }
      },
      false,
      'setTypeFilter',
    ),

  addStaged: (valid, rejected) =>
    set(
      (state) => ({
        dropError: rejected.length ? `Skipped: ${rejected.join(', ')}` : '',
        staged: [
          ...state.staged,
          ...valid.filter((f) => !state.staged.some((s) => s.name === f.name && s.size === f.size)),
        ],
      }),
      false,
      'addStaged',
    ),

  removeStaged: (index) =>
    set((state) => ({ staged: state.staged.filter((_, i) => i !== index) }), false, 'removeStaged'),

  clearStaged: () => set({ staged: [], dropError: '' }, false, 'clearStaged'),

  setTab: (tab) => set({ tab }, false, 'setTab'),
  setSort: (sort) => set({ sort }, false, 'setSort'),
  setRecentIds: (recentIds) => set({ recentIds }, false, 'setRecentIds'),

  openPreview: (file) => set({ modal: { kind: 'preview', file }, modalOpen: true }, false, 'openPreview'),
  openDelete: (file) => set({ modal: { kind: 'delete', file }, modalOpen: true }, false, 'openDelete'),
  // Keep `modal` so content stays visible during the fade-out
  closeModal: () => set({ modalOpen: false }, false, 'closeModal'),
}))
