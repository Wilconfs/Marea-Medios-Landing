import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/auth-helpers'

export const dynamic = 'force-dynamic'

const statusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
})

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const auth = await requireRole(['SUPERADMIN', 'ADMIN'])
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === 'unauthorized' ? 401 : 403 })
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { user: { select: { name: true, email: true } } },
  })

  if (!order) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  return NextResponse.json(order)
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const auth = await requireRole(['SUPERADMIN', 'ADMIN'])
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === 'unauthorized' ? 401 : 403 })
  }

  try {
    const body = await req.json()
    const data = statusSchema.parse(body)

    const updated = await prisma.order.update({
      where: { id: params.id },
      data: { status: data.status },
    })
    return NextResponse.json(updated)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'invalid_input' }, { status: 400 })
    }
    console.error('[admin/orders PATCH]', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
