import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const tokenArraySchema = z.array(z.string()).min(1)

export const getServerSession = createServerFn({ method: 'GET' }).handler(
  async () => {
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY

    if (!supabaseUrl || !supabaseSecretKey) {
      return null
    }

    const request = getRequest()
    const cookieHeader = request.headers.get('cookie') ?? ''

    const tokenMatch = cookieHeader.match(/sb-[^-]+-auth-token=([^;]+)/)

    if (!tokenMatch) {
      return null
    }

    let accessToken: string
    try {
      const decoded = decodeURIComponent(tokenMatch[1])
      const parsed = tokenArraySchema.parse(JSON.parse(decoded))
      accessToken = parsed[0]
    } catch {
      accessToken = decodeURIComponent(tokenMatch[1])
    }

    const supabase = createClient(supabaseUrl, supabaseSecretKey)
    const {
      data: { user },
      error
    } = await supabase.auth.getUser(accessToken)

    if (error || !user) {
      return null
    }

    return {
      user: {
        id: user.id,
        email: user.email ?? '',
        name: user.user_metadata?.name ?? user.email?.split('@')[0] ?? '',
        image: user.user_metadata?.avatar_url ?? null
      },
      session: { id: user.id }
    }
  }
)
