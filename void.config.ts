import { defineConfig } from 'void/config'

export default defineConfig({
  target: 'cloudflare',
  worker: {
    compatibility_date: '2026-02-24',
    compatibility_flags: ['nodejs_compat', 'nodejs_als']
  },
  cloudflare: {
    name: 'tanstack-viteplus',
    account_id: '',
    workers_dev: true,
    preview_urls: true
  }
})
