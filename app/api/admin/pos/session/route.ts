import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

// GET: Saber si la caja está abierta o cerrada al cargar la página
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const userSession = session?.user as any
    const tenantId = userSession?.tenantId

    if (!session || !tenantId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const activeSession = await prisma.cashSession.findFirst({
      where: {
        tenantId,
        status: 'OPEN', // Busca solo la que esté abierta
      }
    })

    // Retorna un 200 con la sesión (si no hay, enviará session: null)
    return NextResponse.json({ session: activeSession })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// POST: Registrar la apertura de una nueva caja
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const userSession = session?.user as any
    const tenantId = userSession?.tenantId
    const userId = userSession?.id

    if (!session || !tenantId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { openingBalance, notes } = await request.json()

    const existingSession = await prisma.cashSession.findFirst({
      where: { tenantId, status: 'OPEN' }
    })

    if (existingSession) {
      return NextResponse.json({ error: 'Ya existe una sesión de caja abierta.' }, { status: 400 })
    }

    const newSession = await prisma.cashSession.create({
      data: {
        tenantId,
        userId,
        openingBalance: parseFloat(openingBalance),
        expectedBalance: parseFloat(openingBalance), // 👈 ESTO SOLUCIONA EL ERROR (Al abrir, el esperado es igual a la base)
        notes: notes || '',
        status: 'OPEN'
      } as any
    })

    return NextResponse.json({ success: true, session: newSession })
  } catch (error: any) {
    console.error('Error en POST /api/admin/pos/session:', error)
    return NextResponse.json({ error: 'Error al abrir caja', details: error.message }, { status: 500 })
  }
}

// PUT: Procesar el Arqueo y Cierre de Caja
// PUT: Procesar el Arqueo y Cierre de Caja
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const userSession = session?.user as any
    const tenantId = userSession?.tenantId

    if (!session || !tenantId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { actualBalance, closingNotes } = await request.json()

    if (actualBalance === undefined || actualBalance === null) {
      return NextResponse.json({ error: 'Debes ingresar el saldo real en caja' }, { status: 400 })
    }

    // 1. Buscar la caja que está abierta actualmente
    const activeSession = await prisma.cashSession.findFirst({
      where: {
        tenantId,
        status: 'OPEN'
      }
    })

    if (!activeSession) {
      return NextResponse.json({ error: 'No hay ninguna sesión de caja abierta para cerrar.' }, { status: 400 })
    }

    const expected = activeSession.expectedBalance
    const actual = parseFloat(actualBalance)
    
    // 2. Calcular descuadre (Diferencia)
    const difference = actual - expected

    // 3. Actualizar y cerrar la sesión usando las columnas nativas de tu esquema
    const closedSession = await prisma.cashSession.update({
      where: { id: activeSession.id },
      data: {
        actualBalance: actual,
        difference: difference,      // 👈 Ya disponible en DB
        closingNotes: closingNotes || '', // 👈 Ya disponible en DB
        status: 'CLOSED',
        closedAt: new Date()         // 👈 Ya disponible en DB
      } as any
    })

    return NextResponse.json({ 
      success: true, 
      session: closedSession,
      message: difference === 0 
        ? '¡Caja cerrada perfectamente! El dinero coincide.' 
        : difference < 0 
          ? `Caja cerrada con FALTANTE de $${Math.abs(difference).toLocaleString('es-CO')}`
          : `Caja cerrada con SOBRANTE de $${difference.toLocaleString('es-CO')}`
    })

  } catch (error: any) {
    console.error('Error en PUT /api/admin/pos/session:', error)
    return NextResponse.json({ error: 'Error interno al cerrar caja', details: error.message }, { status: 500 })
  }
}