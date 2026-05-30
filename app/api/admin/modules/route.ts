import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Ajusta la ruta a tu archivo auth si es necesario

// --- MÉTODO GET: Cargar módulos detectando el Tenant por Sesión ---
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Validamos la sesión tal cual lo haces en tus otras rutas protegidas
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Usamos 'as any' para que TS no te tire línea roja si no encuentra la propiedad extendida en User
    const userSession = session.user as any;
    const tenantId = userSession.tenantId;

    if (!tenantId) {
      return NextResponse.json({ error: "El usuario no tiene un comercio asignado." }, { status: 400 });
    }

    // 👇 OJO AQUÍ: Asegúrate de usar el nombre del modelo en minúscula (tenantModule)
    const globalModules = await prisma.module.findMany();
    const tenantModules = await prisma.tenantModule.findMany({
      where: { tenantId },
    });

    const mappedModules = globalModules.map((mod) => {
      const relation = tenantModules.find((tm) => tm.moduleId === mod.id);
      return {
        id: mod.id,
        code: mod.code,
        name: mod.name,
        description: mod.description,
        isActive: relation ? relation.isActive : false,
      };
    });

    return NextResponse.json({ modules: mappedModules });
  } catch (error) {
    console.error("Error en GET /modules:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// --- MÉTODO POST: Guardar el estado del switch usando la Sesión ---
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userSession = session.user as any;
    const tenantId = userSession.tenantId;
    const { moduleId, isActive } = await request.json();

    if (!moduleId) {
      return NextResponse.json({ error: "Falta el parámetro moduleId." }, { status: 400 });
    }

    // 👇 Ajustado también aquí a 'tenantModule' en minúscula
    const updatedModule = await prisma.tenantModule.upsert({
      where: {
        tenantId_moduleId: {
          tenantId,
          moduleId,
        },
      },
      update: { isActive: Boolean(isActive) },
      create: {
        tenantId,
        moduleId,
        isActive: Boolean(isActive),
      },
    });

    return NextResponse.json({ success: true, data: updatedModule });
  } catch (error) {
    console.error("Error en POST /modules:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}