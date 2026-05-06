import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/auth-helpers'

export const dynamic = 'force-dynamic'

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(2000).optional(),
  price: z.number().positive().optional(),
  originalPrice: z.number().positive().nullable().optional(),
  discount: z.number().int().min(0).max(100).nullable().optional(),
  rating: z.number().min(0).max(5).optional(),
  soldCount: z.number().int().min(0).optional(),
  stock: z.number().int().min(0).optional(),
  imageUrl: z.string().url().optional(),
  categoryId: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
  isFlashSale: z.boolean().optional(),
})

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
    const data = updateSchema.parse(body)

    const updated = await prisma.product.update({
      where: { id: params.id },
      data,
    })

    return NextResponse.json(updated)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'invalid_input', details: err.errors }, { status: 400 })
    }
    console.error('[admin/products PATCH]', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const auth = await requireRole(['SUPERADMIN', 'ADMIN'])
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === 'unauthorized' ? 401 : 403 })
  }

  try {
    await prisma.product.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[admin/products DELETE]', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
