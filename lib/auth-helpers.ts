import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export type UserRole = 'SUPERADMIN' | 'ADMIN' | 'CLIENTE'

export async function getCurrentSession() {
  const session = await getServerSession(authOptions)
  return session
}

export async function requireRole(roles: UserRole[]) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { error: 'unauthorized' as const }
  }
  if (!roles.includes(session.user.role)) {
    return { error: 'forbidden' as const }
  }
  return { session }
}
