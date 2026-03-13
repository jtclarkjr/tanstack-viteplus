import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react'

export type Theme = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'theme'

const ThemeContext = createContext<
  | {
      theme: Theme
      mounted: boolean
      setTheme: (theme: Theme) => void
    }
  | undefined
>(undefined)

function applyTheme(theme: Theme) {
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

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const nextTheme = document.documentElement.dataset.theme
    const resolvedTheme =
      nextTheme === 'light' || nextTheme === 'dark' || nextTheme === 'system'
        ? nextTheme
        : 'system'

    setThemeState(resolvedTheme)
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) {
      return
    }

    applyTheme(theme)
    window.localStorage.setItem(STORAGE_KEY, theme)

    if (theme !== 'system') {
      return
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

export function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider.')
  }

  return context
}
