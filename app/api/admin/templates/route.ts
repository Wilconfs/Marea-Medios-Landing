import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth' // ⚠️ ASEGÚRATE DE QUE ESTA RUTA A TUS AUTHOPTIONS SEA LA CORRECTA
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    // Con este log veremos en la consola de tu terminal qué está leyendo NextAuth
    console.log("SESIÓN ACTUAL EN API TEMPLATES:", session)

    const tenantId = (session?.user as any)?.tenantId

    if (!tenantId) {
      return NextResponse.json({ error: 'No autorizado - Falta Tenant ID' }, { status: 401 })
    }

    const templates = await prisma.messageTemplate.findMany({
      where: { tenantId }
    })

    return NextResponse.json(templates)
  } catch (error: any) {
    // Esto evitará el 500 genérico y nos pintará el error real en la terminal
    console.error("ERROR CRÍTICO EN GET TEMPLATES:", error)
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const tenantId = (session?.user as any)?.tenantId

    if (!tenantId || session?.user?.role === 'AUXILIAR') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { type, message } = await req.json()

    const template = await prisma.messageTemplate.upsert({
      where: {
        tenantId_type: { tenantId, type }
      },
      update: { message },
      create: { tenantId, type, message }
    })

    return NextResponse.json(template)
  } catch (error: any) {
    console.error("ERROR CRÍTICO EN POST TEMPLATES:", error)
    return NextResponse.json({ error: error.message || 'Error al guardar' }, { status: 500 })
  }
}