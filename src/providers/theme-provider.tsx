import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode
} from 'react'
import { z } from 'zod'

export type Theme = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'theme'
const themeSchema = z.enum(['light', 'dark', 'system'])

// The init script sets this snapshot before hydration; user choices live in state.
const subscribeToInitialTheme = () => () => {}
const getInitialTheme = (): Theme => {
  const result = themeSchema.safeParse(document.documentElement.dataset.theme)
  return result.success ? result.data : 'system'
}

const ThemeContext = createContext<
  | {
      theme: Theme
      mounted: boolean
      setTheme: (theme: Theme) => void
    }
  | undefined
>(undefined)

const applyTheme = (theme: Theme) => {
  const root = document.documentElement
  const resolved =
    theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : theme

  root.classList.toggle('dark', resolved === 'dark')
  root.dataset.theme = theme
}

export const themeInitScript = `
(() => {
  const storageKey = "${STORAGE_KEY}";
  const stored = window.localStorage.getItem(storageKey);
  const theme = stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
  const resolved = theme === "system"
    ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    : theme;
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.dataset.theme = theme;
})();
`

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const initialTheme = useSyncExternalStore(
    subscribeToInitialTheme,
    getInitialTheme,
    () => null
  )
  const [selectedTheme, setThemeState] = useState<Theme | null>(null)
  const theme = selectedTheme ?? initialTheme ?? 'system'
  const mounted = initialTheme !== null

  useEffect(() => {
    if (!mounted) {
      return undefined
    }

    applyTheme(theme)
    window.localStorage.setItem(STORAGE_KEY, theme)

    if (theme !== 'system') {
      return undefined
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const listener = () => applyTheme('system')

    mediaQuery.addEventListener('change', listener)
    return () => mediaQuery.removeEventListener('change', listener)
  }, [mounted, theme])

  const value = useMemo(
    () => ({
      theme,
      mounted,
      setTheme: setThemeState
    }),
    [mounted, theme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider.')
  }

  return context
}
