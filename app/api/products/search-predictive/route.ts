import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q') || ''

    // Si el usuario borra el input, devolvemos un arreglo vacío de inmediato
    if (!query.trim()) {
      return NextResponse.json([])
    }

    // 1. IDENTIFICACIÓN DEL TENANT (Clave para que no se crucen los clientes)
    const headerList = await headers()
    const host = headerList.get('host') || ''
    const domain = host.split(':')[0] // Remueve el puerto si estás en local (:3000)

    const tenant = await prisma.tenant.findUnique({
      where: { slug: domain }
    })

    if (!tenant) {
      return NextResponse.json([])
    }

    // 2. CONSULTA EN VIVO A MYSQL
    // Traemos solo los datos estrictamente necesarios (id, name, price, imageUrl)
    // para que la respuesta viaje volando por la red.
    const products = await prisma.product.findMany({
      where: {
        tenantId: tenant.id,
        isActive: true,
        name: {
          contains: query // MySQL busca ignorando mayúsculas y minúsculas por defecto
        }
      },
      select: {
        id: true,
        name: true,
        price: true,
        imageUrl: true
      },
      take: 5 // Mostramos un top 5 de coincidencias para cuidar la estética del diseño
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('[SEARCH_PREDICTIVE_ERROR]', error)
    return NextResponse.json([])
  }
}