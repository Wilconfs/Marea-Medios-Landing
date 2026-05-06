import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/auth-helpers'

export const dynamic = 'force-dynamic'

const schema = z.object({
  role: z.enum(['SUPERADMIN', 'ADMIN', 'CLIENTE']),
})

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const auth = await requireRole(['SUPERADMIN'])
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

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: { role: data.role },
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
