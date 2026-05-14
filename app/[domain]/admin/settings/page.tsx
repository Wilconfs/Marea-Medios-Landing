import { redirect } from 'next/navigation'
import { getCurrentSession } from '@/lib/auth-helpers'
import { SettingsView } from './_components/settings-view'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  const session = await getCurrentSession()
  if (session?.user?.role !== 'SUPERADMIN') redirect('/admin')
  return <SettingsView />
}
