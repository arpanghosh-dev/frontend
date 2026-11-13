import { createStore } from '../utils/store'

export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'theme'

function readInitialTheme(): Theme {
  // index.html already applied the saved theme before first paint — just read it back
  const applied = document.documentElement.dataset.theme
  return applied === 'light' ? 'light' : 'dark'
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // storage unavailable (private mode) — theme still applies for this visit
  }
}

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

/** App-wide colour theme (dark by default), persisted in localStorage. */
export const useThemeStore = createStore<ThemeState>('theme', (set, get) => ({
  theme: readInitialTheme(),
  setTheme: (theme) => {
    applyTheme(theme)
    set({ theme }, false, 'setTheme')
  },
  toggleTheme: () => get().setTheme(get().theme === 'dark' ? 'light' : 'dark'),
}))
