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
      'storybook-static',
      'storybook-static/**',
      'public/**',
      'src/routeTree.gen.ts'
    ],
    options: { typeAware: true, typeCheck: true }
  },
  server: {
    watch: {
      ignored: ['**/routeTree.gen.ts']
    }
  },
  resolve: {
    tsconfigPaths: true
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    pool: 'forks'
  },
  plugins: [
    !process.env.VITEST && devtools(),
    !process.env.VITEST &&
      nitro({ rollupConfig: { external: [/^@sentry\//] } }),
    tailwindcss(),
    !process.env.VITEST && tanstackStart(),
    viteReact()
  ]
})

export default config
