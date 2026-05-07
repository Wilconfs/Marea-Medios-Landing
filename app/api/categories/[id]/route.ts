import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/auth-helpers'

export const dynamic = 'force-dynamic'

const schema = z.object({
  name: z.string().min(1).max(80).optional(),
  slug: z.string().min(1).max(80).regex(/^[a-z0-9-]+$/).optional(),
  icon: z.string().min(1).max(60).optional(),
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
    const data = schema.parse(body)

    if (data.slug) {
      const taken = await prisma.category.findFirst({
        where: { slug: data.slug, NOT: { id: params.id } },
      })
      if (taken) {
        return NextResponse.json({ error: 'slug_taken' }, { status: 409 })
      }
    }

    const updated = await prisma.category.update({
      where: { id: params.id },
      data,
    })
    return NextResponse.json(updated)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'invalid_input' }, { status: 400 })
    }
    console.error('[admin/categories PATCH]', err)
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
    const count = await prisma.product.count({ where: { categoryId: params.id } })
    if (count > 0) {
      return NextResponse.json(
        { error: 'has_products', count },
        { status: 409 },
      )
    }
    await prisma.category.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[admin/categories DELETE]', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
