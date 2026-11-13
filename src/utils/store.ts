import { create, type StateCreator } from 'zustand'
import { devtools } from 'zustand/middleware'

/**
 * Zustand store factory used by every feature store.
 * Wires Redux DevTools (dev builds only) and names the store so its actions
 * show up as "<storeName>/<action>" in the devtools timeline.
 *
 *   export const useThingStore = createStore<ThingState>('thing', (set) => ({ ... }))
 */
export function createStore<T>(name: string, initializer: StateCreator<T, [['zustand/devtools', never]], []>) {
  return create<T>()(devtools(initializer, { name, enabled: import.meta.env.DEV }))
}
