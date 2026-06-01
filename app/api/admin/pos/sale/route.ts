import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const userSession = session?.user as any
    const tenantId = userSession?.tenantId
    const userId = userSession?.id

    if (!session || !tenantId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { cartItems, total } = await request.json()

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'El carrito está vacío' }, { status: 400 })
    }

    // 1. Validar que la caja del turno actual esté abierta
    const activeSession = await prisma.cashSession.findFirst({
      where: {
        tenantId,
        status: 'OPEN'
      }
    })

    if (!activeSession) {
      return NextResponse.json({ error: 'No hay ningún turno de caja abierto para registrar la venta.' }, { status: 400 })
    }

    // 2. Transacción atómica para guardar venta y descontar stock
    const result = await prisma.$transaction(async (tx) => {
      
      // Creamos la orden usando una query directa para evitar bloqueos del linter de TS
      const order = await (tx.order as any).create({
        data: {
          tenantId,
          userId,
          total: parseFloat(total),
          status: 'DELIVERED', 
          items: JSON.stringify(
            cartItems.map((item: any) => ({
              id: item.product.id,
              name: item.product.name,
              quantity: item.quantity,
              price: item.product.price
            }))
          )
        }
      })

      // Descontar inventario en caliente
      for (const item of cartItems) {
        const product = await tx.product.findUnique({
          where: { id: item.product.id }
        })

        if (!product) {
          throw new Error(`El producto "${item.product.name}" ya no existe.`)
        }

        if (product.stock < item.quantity) {
          throw new Error(`Stock insuficiente para "${product.name}".`)
        }

        await tx.product.update({
          where: { id: item.product.id },
          data: {
            stock: product.stock - item.quantity
          }
        })
      }

      // Registrar el ingreso de efectivo en el turno de caja
      const cashMovement = await tx.cashMovement.create({
        data: {
          cashSessionId: activeSession.id,
          type: 'INCOME',
          amount: parseFloat(total),
          description: `Venta POS - Orden #${order.id.slice(-6).toUpperCase()}`
        }
      })

      return { order, cashMovement }
    })

    return NextResponse.json({ success: true, orderId: result.order.id })

  } catch (error: any) {
    console.error('Error en POST /api/admin/pos/sale:', error)
    return NextResponse.json({ 
      error: 'Error interno al procesar la venta', 
      details: error.message || String(error) 
    }, { status: 500 })
  }
}