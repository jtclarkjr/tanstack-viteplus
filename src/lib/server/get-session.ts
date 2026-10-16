import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { getAuth } from '@/lib/server/auth'

export const getServerSession = createServerFn({ method: 'GET' }).handler(
  async () => {
    const request = getRequest()

    const session = await getAuth().api.getSession({
      headers: request.headers
    })

    return session
  }
)
