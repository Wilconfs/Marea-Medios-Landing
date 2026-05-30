import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Ajusta según tu ruta real de auth

// 🔍 1. CONSULTAR SI LA CAJA ESTÁ ABIERTA O CERRADA
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userSession = session.user as any;
    const tenantId = userSession.tenantId;

    // Buscamos la sesión activa en este comercio (estado OPEN)
    const activeSession = await prisma.cashSession.findFirst({
      where: {
        tenantId,
        status: "OPEN",
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    return NextResponse.json({ activeSession });
  } catch (error) {
    console.error("Error en GET /api/admin/pos/session:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// 🚀 2. APERTURA DE CAJA (Crear nueva sesión con Saldo Inicial)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userSession = session.user as any;
    const tenantId = userSession.tenantId;
    const userId = userSession.id || userSession.uid; // ID del usuario logueado que abre caja

    const { openingBalance, notes } = await request.json();

    if (openingBalance === undefined || openingBalance < 0) {
      return NextResponse.json(
        { error: "El saldo inicial debe ser un número mayor o igual a 0." },
        { status: 400 }
      );
    }

    // Validación de seguridad: Verificar que no tengan ya una caja abierta
    const alreadyOpen = await prisma.cashSession.findFirst({
      where: { tenantId, status: "OPEN" }
    });

    if (alreadyOpen) {
      return NextResponse.json(
        { error: "Ya existe una sesión de caja abierta para este comercio." },
        { status: 400 }
      );
    }

    // Crear la sesión física en MySQL
    const newSession = await prisma.cashSession.create({
      data: {
        tenantId,
        userId,
        openingBalance: parseFloat(openingBalance),
        expectedBalance: parseFloat(openingBalance), // Al iniciar, el esperado es igual al inicial
        status: "OPEN",
        notes: notes || "",
      },
    });

    return NextResponse.json({ success: true, session: newSession });
  } catch (error) {
    console.error("Error en POST /api/admin/pos/session:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}