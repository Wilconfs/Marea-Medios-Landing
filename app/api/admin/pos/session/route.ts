import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

// GET: Se mantiene igual, ya calcula correctamente el resumen
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const userSession = session?.user as any
    const tenantId = userSession?.tenantId

    if (!session || !tenantId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const activeSession = await prisma.cashSession.findFirst({
      where: { tenantId, status: 'OPEN' }
    })

    if (!activeSession) return NextResponse.json({ session: null })

    // 1. Traer datos necesarios
    const orders = await prisma.order.findMany({
      where: { tenantId, createdAt: { gte: activeSession.openedAt } }
    })
    
    // En tu GET:
    const movements = await prisma.cashMovement.findMany({
      where: { cashSessionId: activeSession.id }
    });

    // 2. Ventas: Solo sumamos órdenes que NO están anuladas
    const completedOrders = orders.filter(o => (o.status as string)?.toUpperCase() !== 'CANCELLED');
    const totalSales = completedOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);

    // 3. Gastos: Excluimos las anulaciones de ventas para evitar restar el dinero dos veces
    // Asumimos que tus anulaciones tienen un tipo 'EXPENSE' pero queremos diferenciar gastos reales
    // En tu ruta de API (GET o PUT)
const totalExpenses = movements
  .filter(m => {
    const isExpense = m.type === 'EXPENSE';
    // Imprimir para depurar en consola
    console.log("Evaluando movimiento:", m.type, m.description, "Es EXPENSE:", isExpense);
    
    // CAMBIO AQUÍ: Probemos si solo excluyendo la palabra "ANULACIÓN" funciona.
    // Si la descripción es "ANULACIÓN Factura...", esto debería ser true.
    const isAnulacion = m.description && m.description.toUpperCase().includes('ANULACIÓN');
    
    // Queremos sumar gastos, pero NO anulaciones
    return isExpense && !isAnulacion;
  })
  .reduce((sum, m) => sum + Number(m.amount || 0), 0);

    // 4. Base inicial (convertida a número seguro)
    const openingBalance = Number(activeSession.openingBalance || 0)

    // 5. La cuenta final: Base + Ventas Vivas - Gastos Operativos
    const expectedCashInHand = Number(activeSession.openingBalance || 0) + totalSales - totalExpenses;

    console.log("DEBUG CALCULO FINAL:", { 
      openingBalance, 
      totalSales, 
      totalExpenses, 
      expectedCashInHand 
    });

    return NextResponse.json({ 
      session: activeSession,
      movements: movements, // <--- Envía la lista completa aquí
  summary: { totalSales, totalExpenses, expectedCashInHand, openingBalance }
    })
  } catch (error) {
    console.error("Error en GET:", error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// POST: Apertura de caja (sin cambios)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const userSession = session?.user as any
    const body = await request.json()
    
    // --- DEPURACIÓN: ¿Qué está llegando realmente? ---
    console.log("DEBUG POST - Recibido:", body); 
    
    const openingBalance = parseFloat(body.openingBalance);
    
    // Validación de seguridad: no dejar abrir con 0 si es obligatorio
    if (isNaN(openingBalance)) {
      return NextResponse.json({ error: 'El monto base es inválido' }, { status: 400 });
    }

    const newSession = await prisma.cashSession.create({
      data: {
        tenantId: userSession?.tenantId,
        userId: userSession?.id,
        openingBalance: openingBalance,
        expectedBalance: openingBalance, 
        status: 'OPEN',
        notes: body.notes || ''
      } as any
    })
    return NextResponse.json({ success: true, session: newSession })
  } catch (error: any) {
    console.error("Error en POST:", error);
    return NextResponse.json({ error: 'Error al abrir: ' + error.message }, { status: 500 })
  }
}

// PUT: Cierre de caja CORREGIDO (Calcula el esperado dinámicamente)
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const tenantId = (session?.user as any)?.tenantId

    if (!session || !tenantId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { actualBalance, closingNotes } = await request.json()
    const activeSession = await prisma.cashSession.findFirst({
      where: { tenantId, status: 'OPEN' }
    })

    if (!activeSession) return NextResponse.json({ error: 'No hay sesión abierta' }, { status: 400 })

    // --- CORRECCIÓN AQUÍ: RECALCULAR DINÁMICAMENTE ---
    const orders = await prisma.order.findMany({
      where: { tenantId, createdAt: { gte: activeSession.openedAt } }
    })
    const movements = await prisma.cashMovement.findMany({
      where: { cashSessionId: activeSession.id }
    })

    const totalSales = orders.filter(o => (o.status as string).toUpperCase() !== 'CANCELLED')
      .reduce((sum, o) => sum + Number(o.total || 0), 0)
    // Filtramos para que SOLO sume gastos reales (egresos), NO anulaciones
   // En tu ruta de API (GET o PUT)
const totalExpenses = movements
  .filter(m => {
    const isExpense = m.type === 'EXPENSE';
    // Imprimir para depurar en consola
    console.log("Evaluando movimiento:", m.type, m.description, "Es EXPENSE:", isExpense);
    
    // CAMBIO AQUÍ: Probemos si solo excluyendo la palabra "ANULACIÓN" funciona.
    // Si la descripción es "ANULACIÓN Factura...", esto debería ser true.
    const isAnulacion = m.description && m.description.toUpperCase().includes('ANULACIÓN');
    
    // Queremos sumar gastos, pero NO anulaciones
    return isExpense && !isAnulacion;
  })
  .reduce((sum, m) => sum + Number(m.amount || 0), 0);

    const realExpected = Number(activeSession.openingBalance || 0) + totalSales - totalExpenses
    const actual = parseFloat(actualBalance)
    const difference = actual - realExpected
    // --------------------------------------------------

    const closedSession = await prisma.cashSession.update({
      where: { id: activeSession.id },
      data: {
        actualBalance: actual,
        expectedBalance: realExpected, // Guardamos el valor calculado real
        difference: difference,
        closingNotes: closingNotes || '',
        status: 'CLOSED',
        closedAt: new Date()
      } as any
    })

    return NextResponse.json({ 
      success: true, 
      message: `Caja cerrada. ${difference === 0 ? 'Sin diferencias.' : `Diferencia: $${difference.toLocaleString('es-CO')}`}`
    })
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al cerrar' }, { status: 500 })
  }
}

