import { redirect } from 'next/navigation'
import { getCurrentSession } from '@/lib/auth-helpers'
import { UsersView } from './_components/users-view'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const session = await getCurrentSession()
  
  // CORRECCIÓN: Permitir la entrada si es SUPERADMIN o ADMIN
  const role = session?.user?.role
  if (role !== 'SUPERADMIN' && role !== 'ADMIN') {
    redirect('/admin')
  }

  return <UsersView />
}