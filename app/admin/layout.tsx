import { redirect } from 'next/navigation'
import { getCurrentSession } from '@/lib/auth-helpers'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminTopbar } from '@/components/admin/admin-topbar'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getCurrentSession()
  if (!session?.user?.id) redirect('/login?callbackUrl=/admin')
  const role = session.user.role
  if (role !== 'SUPERADMIN' && role !== 'ADMIN') redirect('/')

  return (
    <div className="flex min-h-screen bg-secondary/30">
      <AdminSidebar role={role} userName={session.user.name ?? 'Admin'} />
      <div className="flex min-h-screen flex-1 flex-col">
        <AdminTopbar role={role} userName={session.user.name ?? 'Admin'} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
