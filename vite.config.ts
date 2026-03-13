import { defineConfig } from 'vite-plus'
import { devtools } from '@tanstack/devtools-vite'
import tailwindcss from '@tailwindcss/vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'

const config = defineConfig({
  staged: {
    '*': 'vp check --fix'
  },
  lint: {
    plugins: ['react', 'typescript', 'unicorn'],
    categories: {
      correctness: 'error',
      suspicious: 'warn'
    },
    rules: {
      'react/react-in-jsx-scope': 'off'
    },
    overrides: [
      {
        files: ['src/components/**/*.{ts,tsx}'],
        rules: {
          'no-nested-ternary': 'error'
        }
      },
      {
        files: ['src/components/ui/**/*.{ts,tsx}', '**/*.stories.{ts,tsx}'],
        rules: {
          'no-nested-ternary': 'off'
        }
      }
    ],
    ignorePatterns: [
      'out',
      'build',
      '.storybook',
      '.storybook/**',
      '**/*.stories.ts',
      '**/*.stories.tsx',
      'storybook-static',
      'storybook-static/**',
      'public/storybook',
      'public/storybook/**'
    ],
    options: { typeAware: true, typeCheck: true }
  },
  resolve: {
    tsconfigPaths: true
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts']
  },
  plugins: [
    devtools(),
    nitro({ rollupConfig: { external: [/^@sentry\//] } }),
    tailwindcss(),
    tanstackStart(),
    viteReact()
  ]
})

export default config
