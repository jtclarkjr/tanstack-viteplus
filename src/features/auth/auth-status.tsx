import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { LogOut, UserCircle } from 'lucide-react'

import { z } from 'zod'

import { useSession, signOut } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { LoginModal } from '@/features/auth/login-modal'
import { authConfigQueryOptions } from '@/features/auth/auth.query'

export const AuthStatus = () => {
  const { data: authConfig } = useQuery(authConfigQueryOptions())
  const { data: sessionData, isPending } = useSession()
  const [modalOpen, setModalOpen] = useState(false)
  const router = useRouter()

  if (!authConfig?.configured || isPending) return null

  const session = sessionData?.session
  const user = sessionData?.user

  if (!session) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setModalOpen(true)}
          aria-label="Sign in"
        >
          <UserCircle className="size-5" />
        </Button>
        <LoginModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          authConfig={authConfig}
        />
      </>
    )
  }

  const optionalString = z.string().optional().catch(undefined)
  const name = optionalString.parse(user?.user_metadata?.name)
  const image = optionalString.parse(user?.user_metadata?.avatar_url)
  const initial =
    name?.charAt(0).toUpperCase() ?? user?.email?.charAt(0).toUpperCase() ?? '?'

  return (
    <div className="flex items-center gap-2">
      <div className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
        {image ? (
          <img
            src={image}
            alt={name ?? 'Avatar'}
            className="size-8 rounded-full"
          />
        ) : (
          initial
        )}
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => {
          void signOut().then(() => router.invalidate())
        }}
        aria-label="Sign out"
      >
        <LogOut className="size-4" />
      </Button>
    </div>
  )
}
