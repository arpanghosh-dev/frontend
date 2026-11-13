import { createStore } from '../utils/store'

export type ToastTone = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  tone: ToastTone
  title: string
  message?: string
}

interface ToastState {
  toasts: Toast[]
  show: (toast: Omit<Toast, 'id'>, durationMs?: number) => void
  dismiss: (id: string) => void
}

/** App-wide toast notifications (rendered by <ToastViewport />). */
export const useToastStore = createStore<ToastState>('toasts', (set, get) => ({
  toasts: [],
  show: (toast, durationMs = 4500) => {
    const id = crypto.randomUUID()
    set((s) => ({ toasts: [...s.toasts.slice(-3), { ...toast, id }] }), false, 'show')
    setTimeout(() => get().dismiss(id), durationMs)
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }), false, 'dismiss'),
}))

/** Call from anywhere — hooks, event handlers, mutation callbacks. */
export const toast = {
  success: (title: string, message?: string) => useToastStore.getState().show({ tone: 'success', title, message }),
  error: (title: string, message?: string) => useToastStore.getState().show({ tone: 'error', title, message }, 7000),
  info: (title: string, message?: string) => useToastStore.getState().show({ tone: 'info', title, message }),
}
