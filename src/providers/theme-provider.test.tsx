import { act, fireEvent, render, screen } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { ThemeProvider, useTheme } from '@/providers/theme-provider'

const ThemeControls = () => {
  const { theme, mounted, setTheme } = useTheme()
  return (
    <>
      <output aria-label="Theme">{mounted ? theme : 'pending'}</output>
      <button onClick={() => setTheme('light')}>Light</button>
      <button onClick={() => setTheme('system')}>System</button>
    </>
  )
}

const themeView = (
  <ThemeProvider>
    <ThemeControls />
  </ThemeProvider>
)

describe('ThemeProvider', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    window.localStorage.clear()
    delete document.documentElement.dataset.theme
    document.documentElement.classList.remove('dark')
  })

  it('hydrates with the saved theme without overwriting it or mismatching server HTML', () => {
    window.localStorage.setItem('theme', 'dark')
    document.documentElement.dataset.theme = 'dark'
    document.documentElement.classList.add('dark')
    const setItem = vi.spyOn(window.localStorage, 'setItem')
    const onRecoverableError = vi.fn()
    const container = document.createElement('div')
    container.innerHTML = renderToString(themeView)
    document.body.appendChild(container)

    expect(container.textContent).toContain('pending')
    expect(setItem).not.toHaveBeenCalled()

    render(themeView, { container, hydrate: true, onRecoverableError })

    expect(screen.getByLabelText('Theme')).toHaveTextContent('dark')
    expect(window.localStorage.getItem('theme')).toBe('dark')
    expect(document.documentElement).toHaveClass('dark')
    expect(onRecoverableError).not.toHaveBeenCalled()
    expect(setItem.mock.calls.every(([, theme]) => theme === 'dark')).toBe(true)
  })

  it('persists user choices and follows system changes only in system mode', () => {
    const mediaQuery = Object.assign(new EventTarget(), {
      matches: false,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn()
    })
    vi.spyOn(window, 'matchMedia').mockReturnValue(mediaQuery)
    document.documentElement.dataset.theme = 'invalid'
    const { unmount } = render(themeView)

    expect(screen.getByLabelText('Theme')).toHaveTextContent('system')

    act(() => {
      mediaQuery.matches = true
      mediaQuery.dispatchEvent(new Event('change'))
    })
    expect(document.documentElement).toHaveClass('dark')

    fireEvent.click(screen.getByRole('button', { name: 'Light' }))
    expect(window.localStorage.getItem('theme')).toBe('light')
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(document.documentElement).not.toHaveClass('dark')

    act(() => {
      mediaQuery.dispatchEvent(new Event('change'))
    })
    expect(document.documentElement).not.toHaveClass('dark')

    fireEvent.click(screen.getByRole('button', { name: 'System' }))
    expect(window.localStorage.getItem('theme')).toBe('system')
    expect(document.documentElement).toHaveClass('dark')

    unmount()
    mediaQuery.matches = false
    mediaQuery.dispatchEvent(new Event('change'))
    expect(document.documentElement).toHaveClass('dark')
  })
})
