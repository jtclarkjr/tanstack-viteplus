import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

import type { Session, User } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? ''

export const supabase = createClient(supabaseUrl, supabasePublishableKey)

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  if (error) return { error: { message: error.message } }
  return { data, error: null }
}

export const signUpWithEmail = async (
  email: string,
  password: string,
  name: string
) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } }
  })
  if (error) return { error: { message: error.message } }
  return { data, error: null }
}

export const signOut = async () => {
  await supabase.auth.signOut()
}

export const signInWithOAuth = async (provider: 'github' | 'google') => {
  await supabase.auth.signInWithOAuth({ provider })
}

export const useSession = () => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isPending, setIsPending] = useState(true)

  useEffect(() => {
    void supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      setUser(s?.user ?? null)
      setIsPending(false)
    })

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      setUser(s?.user ?? null)
      setIsPending(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return {
    data: session ? { session, user } : null,
    isPending
  }
}
