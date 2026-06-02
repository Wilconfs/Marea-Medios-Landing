import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

// 1. GET: Listar las ventas de la sesión de caja que esté abierta actualmente
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const userSession = session?.user as any
    const tenantId = userSession?.tenantId

    if (!session || !tenantId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Buscar el turno de caja actual que esté ABIERTO
    const activeSession = await prisma.cashSession.findFirst({
      where: { tenantId, status: 'OPEN' }
    })

    if (!activeSession) {
      return NextResponse.json({ sales: [] })
    }

    // Traer las órdenes facturadas desde el momento en que se abrió esta caja
    const sales = await prisma.order.findMany({
      where: {
        tenantId,
        createdAt: { gte: activeSession.openedAt }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Mapear y parsear los productos stringificados de cada orden
    const formattedSales = sales.map((sale: any) => {
      let parsedItems = []
      try {
        parsedItems = typeof sale.items === 'string' ? JSON.parse(sale.items) : sale.items
      } catch (e) {
        parsedItems = []
      }
      return { ...sale, items: parsedItems }
    })

    return NextResponse.json({ sales: formattedSales })
  } catch (error: any) {
    console.error('Error en GET /api/admin/pos/history:', error)
    return NextResponse.json({ error: 'Error al cargar historial de ventas' }, { status: 500 })
  }
}

// 2. POST: Anulación de factura (Reversión de stock y ajuste proporcional de caja física)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const userSession = session?.user as any
    const tenantId = userSession?.tenantId

    if (!session || !tenantId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { orderId } = await request.json()
    if (!orderId) {
      return NextResponse.json({ error: 'Falta el ID de la orden' }, { status: 400 })
    }

    // Validar que haya un turno abierto para registrar el egreso por devolución
    const activeSession = await prisma.cashSession.findFirst({
      where: { tenantId, status: 'OPEN' }
    })

    if (!activeSession) {
      return NextResponse.json({ error: 'No hay ninguna caja abierta para procesar la anulación.' }, { status: 400 })
    }

    // Obtener la orden original
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!order || order.tenantId !== tenantId) {
      return NextResponse.json({ error: 'La orden no existe' }, { status: 404 })
    }

    if (order.status === 'CANCELLED') {
      return NextResponse.json({ error: 'Esta factura ya se encuentra anulada.' }, { status: 400 })
    }

    // Buscar el movimiento de caja original usando el patrón de texto que guardas en sale/route.ts
    const originalMovement = await prisma.cashMovement.findFirst({
      where: {
        cashSessionId: activeSession.id,
        description: {
          contains: `Orden #${order.id.slice(-6).toUpperCase()}`
        }
      }
    })

    // Si la venta fue por transferencia pura, amount fue 0, así que restamos 0 para no descuadrar el efectivo real
    const cashToRefund = originalMovement ? originalMovement.amount : 0

    // Transacción atómica en la base de datos
    await prisma.$transaction(async (tx) => {
      // A. Cambiar estado de la orden a CANCELLED
      await tx.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' }
      })

      // B. Retornar los productos al inventario
      let items: any[] = []
      try {
        items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items
      } catch (e) {
        items = []
      }

      if (Array.isArray(items)) {
        for (const item of items) {
          // CAPTURA DE ID CORRECTO: Validamos si viene como productId o id primario del modelo
          const targetProductId = item.productId || item.id;
          
          if (!targetProductId) continue;

          await tx.product.update({
            where: { id: targetProductId },
            data: {
              stock: { increment: Number(item.quantity) }
            }
          })
        }
      }

      // C. Registrar el egreso en caja únicamente por el valor de efectivo real que se devuelve
      await tx.cashMovement.create({
        data: {
          cashSessionId: activeSession.id,
          type: 'EXPENSE',
          amount: cashToRefund, 
          description: `ANULACIÓN Factura #POS-${order.id.slice(-6).toUpperCase()} - Reversión de Inventario`
        }
      })
    })

    return NextResponse.json({ success: true, message: 'Factura anulada con éxito e inventario restaurado.' })
  } catch (error: any) {
    console.error('Error en POST /api/admin/pos/history:', error)
    return NextResponse.json({ error: 'Error interno al anular la venta', details: error.message }, { status: 500 })
  }
}