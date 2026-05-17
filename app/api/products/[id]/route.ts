import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    // 1. Obtener parámetros de paginación de la URL (Por defecto: página 1, 10 productos)
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const search = searchParams.get('search') || '' // Por si tienes buscador operativo

    const skip = (page - 1) * limit

    // 2. Detectar el tenant/tienda actual (Tu lógica tradicional)
    const headerList = await headers()
    const host = headerList.get('host') || ''
    const domain = host.split(':')[0]
    const tenant = await prisma.tenant.findUnique({ where: { slug: domain } })
    
    if (!tenant) return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })

    // 3. Filtro base de búsqueda
    const whereClause: any = {
      tenantId: tenant.id,
      ...(search && {
        name: { contains: search, mode: 'insensitive' }
      })
    }

    // 4. Consulta en paralelo: Contar el total de items y traer solo el bloque paginado
    const [totalItems, products] = await prisma.$transaction([
      prisma.product.count({ where: whereClause }),
      prisma.product.findMany({
        where: whereClause,
        skip: skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { category: { select: { name: true } } } // Si lo requieres
      })
    ])

    const totalPages = Math.ceil(totalItems / limit)

    // Retornamos los productos y la metadata de control para el frontend
    return NextResponse.json({
      products,
      meta: {
        totalItems,
        totalPages,
        currentPage: page,
        limit
      }
    })
  } catch (error) {
    console.error('[PRODUCTS_GET_PAGINATED]', error)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}