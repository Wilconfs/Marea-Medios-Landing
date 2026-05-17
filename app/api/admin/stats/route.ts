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

    // 2. Total clientes de esta tienda
    const totalCustomers = await prisma.user.count({ 
      where: { 
        role: 'CLIENTE',
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

    // 🔽 ESTRATEGIA NUEVA INDEPENDIENTE DE COMPILACIÓN (MÁXIMA COMPATIBILIDAD) 🔽

    // 8. Agrupación segura de ventas por Categoría usando únicamente el modelo Product
    const productsWithCategory = await prisma.product.findMany({
      where: { tenantId: tenantId },
      select: {
        price: true,
        soldCount: true,
        category: {
          select: { name: true }
        }
      }
    })

    const categoryMap: Record<string, number> = {}
    for (const prod of productsWithCategory) {
      if (prod.category && prod.soldCount > 0) {
        const totalProductSales = prod.soldCount * prod.price
        categoryMap[prod.category.name] = (categoryMap[prod.category.name] || 0) + totalProductSales
      }
    }
    const salesByCategory = Object.entries(categoryMap).map(([name, value]) => ({ name, value }))

    // 9. Conteo de órdenes por su Estado operativo basándonos en el array de órdenes cargado previamente
    const statusMap: Record<string, number> = {}
    for (const o of orders) {
      statusMap[o.status] = (statusMap[o.status] || 0) + 1
    }
    const ordersByStatus = Object.entries(statusMap).map(([status, count]) => ({
      status,
      count
    }))

    // 10. Alertas críticas de stock para productos de la tienda (unidades <= 5)
    const lowStockAlerts = await prisma.product.findMany({
      where: {
        tenantId: tenantId,
        isActive: true,
        stock: { lte: 5 }
      },
      select: {
        id: true,
        name: true,
        stock: true
      },
      orderBy: { stock: 'asc' },
      take: 5
    })

    return NextResponse.json({
      totalCustomers,
      totalOrders,
      totalSales,
      totalProducts,
      monthly,
      topProducts,
      recentOrders,
      // Retorno de los nuevos datos limpios para el frontend
      salesByCategory,
      ordersByStatus,
      lowStockAlerts
    })
  } catch (error) {
    console.error('[ADMIN_STATS_GET]', error)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}