import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/auth-helpers'

export const dynamic = 'force-dynamic'

/**
 * Función para detectar la tienda actual basándose en el dominio (ej: tienda1.local)
 */
async function getTenantContext() {
  const headerList = await headers()
  const host = headerList.get('host') || ''
  const domain = host.split(':')[0]
  
  return await prisma.tenant.findUnique({
    where: { slug: domain }
  })
}

export async function GET() {
  try {
    const auth = await requireRole(['SUPERADMIN', 'ADMIN', 'AUXILIAR'])
    if (auth.error) {
      return NextResponse.json(
        { error: auth.error }, 
        { status: auth.error === 'unauthorized' ? 401 : 403 }
      )
    }

    // 1. Identificamos la tienda actual
    const tenant = await getTenantContext()
    if (!tenant) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    const tenantId = tenant.id

    // 2. Total clientes de esta tienda (Asegúrate de que tus usuarios tengan tenantId si son por tienda)
    const totalCustomers = await prisma.user.count({ 
      where: { 
        role: 'CLIENTE',
        // tenantId: tenantId // Descomenta esta línea si los clientes pertenecen a un tenant
      } 
    })

    // 3. Órdenes filtradas por tenantId
    const orders = await prisma.order.findMany({
      where: { tenantId: tenantId }, // FILTRO CRÍTICO
      select: { id: true, total: true, status: true, createdAt: true },
    })

    const totalOrders = orders.length
    const totalSales = orders
      .filter((o: any) => o.status !== 'CANCELLED')
      .reduce((sum: number, o: any) => sum + o.total, 0)

    // 4. Ingresos mensuales (Año actual)
    const year = new Date().getFullYear()
    const monthly = Array.from({ length: 12 }, (_, i) => ({ month: i, total: 0 }))
    for (const o of orders) {
      if (o.status === 'CANCELLED') continue
      const d = new Date(o.createdAt)
      if (d.getFullYear() === year) {
        monthly[d.getMonth()].total += o.total
      }
    }

    // 5. Top productos (Solo de esta tienda)
    const topProducts = await prisma.product.findMany({
      where: { tenantId: tenantId }, // FILTRO CRÍTICO
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

    // 6. Órdenes recientes (Solo de esta tienda)
    const recentOrders = await prisma.order.findMany({
      where: { tenantId: tenantId }, // FILTRO CRÍTICO
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

    // 7. Productos activos (Solo de esta tienda)
    const totalProducts = await prisma.product.count({ 
      where: { 
        isActive: true,
        tenantId: tenantId // FILTRO CRÍTICO
      } 
    })

    return NextResponse.json({
      totalCustomers,
      totalOrders,
      totalSales,
      totalProducts,
      monthly,
      topProducts,
      recentOrders,
    })
  } catch (error) {
    console.error('[ADMIN_STATS_GET]', error)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}