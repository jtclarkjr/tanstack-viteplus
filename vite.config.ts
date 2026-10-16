import { defineConfig, lazyPlugins } from 'vite-plus'
import { devtools } from '@tanstack/devtools-vite'
import tailwindcss from '@tailwindcss/vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import { voidPlugin } from 'void'

const config = defineConfig({
  staged: {
    '*': 'vp check --fix'
  },
  fmt: {
    $schema: './node_modules/oxfmt/configuration_schema.json',
    semi: false,
    tabWidth: 2,
    singleQuote: true,
    printWidth: 80,
    trailingComma: 'none',
    proseWrap: 'always',
    sortPackageJson: false,
    ignorePatterns: ['*.gen.ts', '*.md']
  },
  lint: {
    plugins: ['react', 'typescript', 'unicorn'],
    categories: {
      correctness: 'error',
      suspicious: 'warn'
    },
    rules: {
      'func-style': ['error', 'expression'],
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
      '*.gen.ts',
      '*.md',
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
    tsconfigPaths: true,
    dedupe: ['solid-js']
  },
  environments: {
    client: {
      build: {
        rolldownOptions: {
          output: {
            codeSplitting: {
              groups: [
                {
                  name: 'react-vendor',
                  test: /node_modules\/(?:react|react-dom|scheduler)\//
                }
              ]
            }
          }
        }
      }
    }
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    pool: 'forks'
  },
  plugins: lazyPlugins(() => [
    !process.env.VITEST && devtools(),
    !process.env.VITEST && voidPlugin(),
    tailwindcss(),
    !process.env.VITEST && tanstackStart(),
    viteReact()
  ])
})

export default config
