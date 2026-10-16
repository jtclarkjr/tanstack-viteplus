import { beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { getAuthConfig } from '@/lib/server/auth-config'

const env = vi.hoisted(() => ({
  BETTER_AUTH_SECRET: 'test-auth-secret-with-at-least-32-characters',
  BETTER_AUTH_URL: 'http://localhost:3000',
  GITHUB_CLIENT_ID: '',
  GITHUB_CLIENT_SECRET: '',
  GOOGLE_CLIENT_ID: '',
  GOOGLE_CLIENT_SECRET: ''
}))

vi.mock('void/env', () => ({ env }))
vi.mock('@tanstack/react-start', () => ({
  createServerFn: () => ({ handler: (handler: () => unknown) => handler })
}))

describe('D1 auth configuration', () => {
  beforeEach(() => {
    env.GITHUB_CLIENT_ID = ''
    env.GITHUB_CLIENT_SECRET = ''
    env.GOOGLE_CLIENT_ID = ''
    env.GOOGLE_CLIENT_SECRET = ''
  })

  it('enables email authentication without a PostgreSQL connection string', async () => {
    const config = await getAuthConfig()

    expect(config).toEqual({
      configured: true,
      providers: { email: true, github: false, google: false }
    })
  })

  it('enables OAuth only when both provider credentials exist', async () => {
    env.GITHUB_CLIENT_ID = 'github-client'
    env.GOOGLE_CLIENT_ID = 'google-client'
    env.GOOGLE_CLIENT_SECRET = 'google-secret'

    const config = await getAuthConfig()

    expect(config.providers).toEqual({
      email: true,
      github: false,
      google: true
    })
  })
})
