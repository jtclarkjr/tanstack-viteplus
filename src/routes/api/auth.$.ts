import { createFileRoute } from '@tanstack/react-router'
import { getAuth } from '@/lib/server/auth'

const handleAuthRequest = async ({ request }: { request: Request }) => {
  return getAuth().handler(request)
}

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: handleAuthRequest,
      POST: handleAuthRequest
    }
  }
})
