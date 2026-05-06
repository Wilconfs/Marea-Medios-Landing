import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/auth-helpers'

export const dynamic = 'force-dynamic'

export async function GET() {
  const auth = await requireRole(['SUPERADMIN', 'ADMIN', 'AUXILIAR'])
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === 'unauthorized' ? 401 : 403 })
  }

  // Total customers (CLIENTE role)
  const totalCustomers = await prisma.user.count({ where: { role: 'CLIENTE' } })

  // Aggregate orders
  const orders = await prisma.order.findMany({
    select: { id: true, total: true, status: true, createdAt: true },
  })

  const totalOrders = orders.length
  const totalSales = orders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.total, 0)

  // Monthly revenue for current year
  const year = new Date().getFullYear()
  const monthly = Array.from({ length: 12 }, (_, i) => ({ month: i, total: 0 }))
  for (const o of orders) {
    if (o.status === 'CANCELLED') continue
    const d = new Date(o.createdAt)
    if (d.getFullYear() === year) {
      monthly[d.getMonth()].total += o.total
    }
  }

  // Top products by sold count
  const topProducts = await prisma.product.findMany({
    take: 5,
    orderBy: { soldCount: 'desc' },
    select: {
      id: true,
      name: true,
      imageUrl: true,
      rating: true,
      soldCount: true,
      price: true,
    },
  })

  // Recent orders
  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      total: true,
      status: true,
      createdAt: true,
      customerName: true,
      user: { select: { name: true } },
    },
  })

  // Active products
  const totalProducts = await prisma.product.count({ where: { isActive: true } })

  return NextResponse.json({
    totalCustomers,
    totalOrders,
    totalSales,
    totalProducts,
    monthly,
    topProducts,
    recentOrders,
  })
}
