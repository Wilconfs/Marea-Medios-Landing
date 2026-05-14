import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/auth-helpers'

export const dynamic = 'force-dynamic'

/**
 * Función auxiliar corregida para extraer el Tenant
 * Basada en el host completo (ej: tienda1.local)
 */
async function getTenantContext() {
  const headerList = await headers() // Next.js 15 requiere await para headers
  const host = headerList.get('host') || ''
  
  // Extraemos el dominio eliminando el puerto (ej: "tienda1.local:3000" -> "tienda1.local")
  const domain = host.split(':')[0]
  
  if (!domain) return null

  // Buscamos el Tenant cuyo slug coincida exactamente con el dominio de la URL
  return await prisma.tenant.findUnique({
    where: { slug: domain }
  })
}

// GET: Listar categorías filtradas por la tienda actual
export async function GET() {
  try {
    const auth = await requireRole(['SUPERADMIN', 'ADMIN'])
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: 403 })
    }

    const tenant = await getTenantContext()
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    const categories = await prisma.category.findMany({
      where: {
        tenantId: tenant.id 
      },
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('[CATEGORIES_GET]', error)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}

// POST: Crear categorías vinculadas automáticamente al tenant actual
export async function POST(req: Request) {
  try {
    const auth = await requireRole(['SUPERADMIN', 'ADMIN'])
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: 403 })
    }

    const tenant = await getTenantContext()
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant context missing' }, { status: 400 })
    }

    const body = await req.json()
    const { name, slug, icon } = body

    if (!name || !slug) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        icon: icon || 'package',
        tenantId: tenant.id // Se vincula a la tienda detectada en la URL
      }
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('[CATEGORIES_POST]', error)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}