import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const orderSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        price: z.number().nonnegative(),
        quantity: z.number().int().positive(),
        imageUrl: z.string().optional(),
      })
    )
    .min(1),
  total: z.number().nonnegative(),
  customerName: z.string().trim().min(1).optional(),
  customerPhone: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  whatsappSent: z.boolean().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await req.json().catch(() => ({}))
    const parsed = orderSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }
    const data = parsed.data
    const order = await prisma.order.create({
      data: {
        userId: session?.user?.id ?? null,
        items: data.items as any,
        total: data.total,
        customerName: data.customerName ?? session?.user?.name ?? null,
        customerPhone: data.customerPhone ?? null,
        notes: data.notes ?? null,
        whatsappSent: data.whatsappSent ?? true,
        status: 'PENDING',
      },
      select: { id: true, createdAt: true, status: true },
    })
    return NextResponse.json({ order }, { status: 201 })
  } catch (err) {
    console.error('POST /api/orders', err)
    return NextResponse.json(
      { error: 'Error al crear el pedido' },
      { status: 500 }
    )
  }
}
