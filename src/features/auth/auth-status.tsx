import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { LogOut, UserCircle } from 'lucide-react'

import { useSession, signOut } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { LoginModal } from '@/features/auth/login-modal'
import { authConfigQueryOptions } from '@/features/auth/auth.query'

export const AuthStatus = () => {
  const { data: authConfig } = useQuery(authConfigQueryOptions())
  const { data: sessionData, isPending } = useSession()
  const [modalOpen, setModalOpen] = useState(false)

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

  const initial =
    user?.name?.charAt(0).toUpperCase() ??
    user?.email?.charAt(0).toUpperCase() ??
    '?'

  return (
    <div className="flex items-center gap-2">
      <div className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
        {user?.image ? (
          <img
            src={user.image}
            alt={user.name ?? 'Avatar'}
            className="size-8 rounded-full"
          />
        ) : (
          initial
        )}
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => signOut()}
        aria-label="Sign out"
      >
        <LogOut className="size-4" />
      </Button>
    </div>
  )
}
