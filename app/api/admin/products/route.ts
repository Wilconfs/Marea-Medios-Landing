import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/auth-helpers'

export const dynamic = 'force-dynamic'

const createSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  price: z.number().positive(),
  originalPrice: z.number().positive().nullable().optional(),
  discount: z.number().int().min(0).max(100).nullable().optional(),
  rating: z.number().min(0).max(5).optional(),
  soldCount: z.number().int().min(0).optional(),
  stock: z.number().int().min(0),
  imageUrl: z.string().min(1),
  categoryId: z.string().min(1),
  isActive: z.boolean().optional(),
  isFlashSale: z.boolean().optional(),
})

// List all products (admin view: includes inactive)
// AUXILIAR puede ver (solo lectura)
export async function GET() {
  const auth = await requireRole(['SUPERADMIN', 'ADMIN', 'AUXILIAR'])
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === 'unauthorized' ? 401 : 403 })
  }

  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: true },
  })

  return NextResponse.json(products)
}

export async function POST(req: Request) {
  // AUXILIAR NO puede crear productos
  const auth = await requireRole(['SUPERADMIN', 'ADMIN'])
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === 'unauthorized' ? 401 : 403 })
  }

  try {
    const body = await req.json()
    const data = createSchema.parse(body)

    const created = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        originalPrice: data.originalPrice ?? null,
        discount: data.discount ?? null,
        rating: data.rating ?? 0,
        soldCount: data.soldCount ?? 0,
        stock: data.stock,
        imageUrl: data.imageUrl,
        categoryId: data.categoryId,
        isActive: data.isActive ?? true,
        isFlashSale: data.isFlashSale ?? false,
      },
    })

    return NextResponse.json(created, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'invalid_input', details: err.errors }, { status: 400 })
    }
    console.error('[admin/products POST]', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
