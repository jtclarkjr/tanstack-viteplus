import { redirect } from '@tanstack/react-router'

export const requireAuth = ({
  context
}: {
  context: { session: { user: { id: string } } | null }
}) => {
  if (!context.session) {
    throw redirect({ to: '/login' })
  }
}
