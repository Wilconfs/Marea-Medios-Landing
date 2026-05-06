import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const flashSale = searchParams.get('flashSale')
    const search = searchParams.get('search')
    const limit = Number(searchParams.get('limit') ?? 50)

    const where: any = { isActive: true }
    if (category) {
      where.category = { slug: category }
    }
    if (flashSale === 'true') {
      where.isFlashSale = true
    }
    if (search) {
      where.name = { contains: search, mode: 'insensitive' }
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: Math.min(Math.max(limit, 1), 100),
      include: { category: true },
    })
    return NextResponse.json({ products })
  } catch (err) {
    console.error('GET /api/products', err)
    return NextResponse.json(
      { error: 'Error al cargar productos' },
      { status: 500 }
    )
  }
}
