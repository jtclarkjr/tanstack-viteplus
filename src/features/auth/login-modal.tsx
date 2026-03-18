import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { LoginForm } from '@/features/auth/login.page'

import type { AuthConfig } from '@/lib/server/auth-config'

export const LoginModal = ({
  open,
  onOpenChange,
  authConfig
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  authConfig: AuthConfig
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome</DialogTitle>
          <DialogDescription>Sign in or create an account.</DialogDescription>
        </DialogHeader>
        <LoginForm
          authConfig={authConfig}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
