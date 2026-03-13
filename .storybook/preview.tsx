// @ts-nocheck
import { useEffect } from 'react'
import type { Preview } from '@storybook/react-vite'

import {
  ThemeProvider,
  useTheme,
  type Theme
} from '@/components/theme-provider'
import '@/styles.css'

function StorybookThemeSync({ theme }: { theme: Theme }) {
  const { setTheme } = useTheme()

  useEffect(() => {
    setTheme(theme)
  }, [setTheme, theme])

  return null
}

const preview: Preview = {
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for all component stories',
      defaultValue: 'system',
      toolbar: {
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
          { value: 'system', title: 'System' }
        ],
        dynamicTitle: true
      }
    }
  },
  parameters: {
    layout: 'padded',
    controls: {
      expanded: true
    },
    backgrounds: {
      disable: true
    }
  },
  decorators: [
    (Story, context) => {
      const selectedTheme = context.globals.theme as Theme

      return (
        <ThemeProvider>
          <StorybookThemeSync theme={selectedTheme} />
          <div className="min-h-screen bg-background p-6 text-foreground antialiased">
            <Story />
          </div>
        </ThemeProvider>
      )
    }
  ]
}

export default preview
