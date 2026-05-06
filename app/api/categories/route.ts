import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    })
    return NextResponse.json({ categories })
  } catch (err) {
    console.error('GET /api/categories', err)
    return NextResponse.json(
      { error: 'Error al cargar categorías' },
      { status: 500 }
    )
  }
}
