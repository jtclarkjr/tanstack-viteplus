import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { auth } from '@/lib/server/auth'

export const getServerSession = createServerFn({ method: 'GET' }).handler(
  async () => {
    const request = getRequest()

    if (!process.env.BETTER_AUTH_SECRET || !process.env.DATABASE_URL) {
      return null
    }

    const session = await auth.api.getSession({
      headers: request.headers
    })

    return session
  }
)
