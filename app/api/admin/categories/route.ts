import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/auth-helpers'

export const dynamic = 'force-dynamic'

const schema = z.object({
  name: z.string().min(1).max(80),
  slug: z.string().min(1).max(80).regex(/^[a-z0-9-]+$/, 'slug inválido'),
  icon: z.string().min(1).max(60),
})

export async function POST(req: Request) {
  const auth = await requireRole(['SUPERADMIN', 'ADMIN'])
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === 'unauthorized' ? 401 : 403 })
  }

  try {
    const body = await req.json()
    const data = schema.parse(body)

    const exists = await prisma.category.findUnique({ where: { slug: data.slug } })
    if (exists) {
      return NextResponse.json({ error: 'slug_taken' }, { status: 409 })
    }

    const created = await prisma.category.create({ data })
    return NextResponse.json(created, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'invalid_input', details: err.errors }, { status: 400 })
    }
    console.error('[admin/categories POST]', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
