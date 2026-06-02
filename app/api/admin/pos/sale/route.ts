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

    const { cartItems, total, discountAmount, paymentDetails } = await request.json()

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

    // Calcular los valores reales de la operación
    const baseTotal = parseFloat(total)
    const discount = parseFloat(discountAmount || 0)
    const netTotal = baseTotal - discount < 0 ? 0 : baseTotal - discount

    // 2. Transacción atómica para guardar venta, descontar stock y mover caja
    const result = await prisma.$transaction(async (tx) => {
      
      // Guardamos la orden con el desglose de productos y el neto cobrado
      const order = await (tx.order as any).create({
        data: {
          tenantId,
          userId,
          total: netTotal,
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

      // DETERMINAR CUÁNTO EFECTIVO FÍSICO INGRESÓ REALMENTE A LA CAJA
      let cashReceived = 0
      let movementDescription = ''

      if (paymentDetails.method === 'MIXTO') {
        cashReceived = parseFloat(paymentDetails.cashAmount || 0)
        movementDescription = `Venta POS Mixta (Efectivo: $${cashReceived.toLocaleString('es-CO')} - Transf: $${parseFloat(paymentDetails.transferAmount).toLocaleString('es-CO')})`
      } else if (paymentDetails.method === 'EFECTIVO') {
        cashReceived = netTotal
        movementDescription = `Venta POS Efectivo`
      } else {
        // TRANSFERENCIA PURA
        cashReceived = 0
        movementDescription = `Venta POS Transferencia Bancaria (No suma a efectivo)`
      }

      // Si hubo descuento, lo anexamos a la descripción para auditoría rápida
      if (discount > 0) {
        movementDescription += ` [Desc. aplicado: $${discount.toLocaleString('es-CO')}]`
      }

      movementDescription += ` - Orden #${order.id.slice(-6).toUpperCase()}`

      // Registrar el movimiento de caja únicamente si entró dinero en efectivo físico
      // o para dejar constancia de la venta electrónica sin afectar el balance esperado de billetes.
      const cashMovement = await tx.cashMovement.create({
        data: {
          cashSessionId: activeSession.id,
          type: 'INCOME',
          amount: cashReceived, // 👈 Aquí está la magia: si es transferencia guarda 0 para no dañar tu arqueo físico
          description: movementDescription
        }
      })

      return { order, cashMovement, netTotal }
    })

    return NextResponse.json({ 
      success: true, 
      orderId: result.order.id,
      netTotal: result.netTotal
    })

  } catch (error: any) {
    console.error('Error en POST /api/admin/pos/sale:', error)
    return NextResponse.json({ 
      error: 'Error interno al procesar la venta', 
      details: error.message || String(error) 
    }, { status: 500 })
  }
}