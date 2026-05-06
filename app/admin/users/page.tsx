import { redirect } from 'next/navigation'
import { getCurrentSession } from '@/lib/auth-helpers'
import { UsersView } from './_components/users-view'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const session = await getCurrentSession()
  if (session?.user?.role !== 'SUPERADMIN') redirect('/admin')
  return <UsersView />
}
