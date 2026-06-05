import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userSession = session?.user as any;
    const tenantId = userSession?.tenantId;

    if (!session || !tenantId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    // Definir el rango del día actual (desde las 00:00:00)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Total Ventas del día (Excluyendo CANCELLED)
    const orders = await prisma.order.findMany({
      where: { tenantId, createdAt: { gte: today }, status: { not: 'CANCELLED' } }
    });
    const totalSales = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);

    // 2. Total Gastos del día (Excluyendo ANULACIONES)
    const expenses = await prisma.cashMovement.findMany({
      where: { 
        tenantId, 
        createdAt: { gte: today }, 
        type: 'EXPENSE' 
      }
    });
    const totalExpenses = expenses
      .filter(e => !e.description?.toUpperCase().includes('ANULACIÓN'))
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    // 3. Conteo de sesiones cerradas (histórico del día o total)
    const closedSessionsCount = await prisma.cashSession.count({
      where: { tenantId, status: 'CLOSED' }
    });

    return NextResponse.json({
      totalSales,
      totalExpenses,
      closedSessionsCount
    });

  } catch (error) {
    console.error("Error en estadísticas:", error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}