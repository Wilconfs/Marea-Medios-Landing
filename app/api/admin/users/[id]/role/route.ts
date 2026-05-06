import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/auth-helpers'

export const dynamic = 'force-dynamic'

const schema = z.object({
  role: z.enum(['SUPERADMIN', 'ADMIN', 'AUXILIAR', 'CLIENTE']),
})

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const auth = await requireRole(['SUPERADMIN', 'ADMIN'])
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === 'unauthorized' ? 401 : 403 })
  }

  // Prevent self-demotion to avoid lockout
  if (auth.session.user.id === params.id) {
    return NextResponse.json(
      { error: 'cannot_modify_self' },
      { status: 400 },
    )
  }

  try {
    const body = await req.json()
    const data = schema.parse(body)

    // Solo SUPERADMIN puede asignar SUPERADMIN
    if (data.role === 'SUPERADMIN' && auth.session.user.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { error: 'forbidden', message: 'Solo Super Admin puede asignar el rol Super Admin' },
        { status: 403 },
      )
    }

    // ADMIN no puede modificar a un SUPERADMIN
    const targetUser = await prisma.user.findUnique({ where: { id: params.id }, select: { role: true } })
    if (targetUser?.role === 'SUPERADMIN' && auth.session.user.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { error: 'forbidden', message: 'No puedes modificar un Super Admin' },
        { status: 403 },
      )
    }

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: { role: data.role as any },
      select: { id: true, name: true, email: true, role: true },
    })

    return NextResponse.json(updated)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'invalid_input' }, { status: 400 })
    }
    console.error('[admin/users/role PATCH]', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
