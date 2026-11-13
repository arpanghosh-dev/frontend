/** TanStack Query keys for the File Manager — one source of truth. */
export const fileKeys = {
  all: ['files'] as const,
  list: () => [...fileKeys.all, 'list'] as const,
  storage: () => ['storage'] as const,
  upload: () => [...fileKeys.all, 'upload'] as const,
  remove: () => [...fileKeys.all, 'delete'] as const,
}
