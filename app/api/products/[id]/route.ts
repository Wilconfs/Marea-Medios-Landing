import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params?.id },
      include: { category: true },
    })
    if (!product) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    }
    return NextResponse.json({ product })
  } catch (err) {
    console.error('GET /api/products/[id]', err)
    return NextResponse.json(
      { error: 'Error al cargar producto' },
      { status: 500 }
    )
  }
}
