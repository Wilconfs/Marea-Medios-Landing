import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/auth-helpers'

export const dynamic = 'force-dynamic'

// Función auxiliar para obtener el ID del Tenant basado en el subdominio
async function getTenantContext() {
  const headerList = headers()
  const host = headerList.get('host')
  
  // Extraemos el subdominio (ej: 'tienda-uno' de 'tienda-uno.localhost:3000')
  const slug = host?.split('.')[0]
  
  if (!slug) return null

  return await prisma.tenant.findUnique({
    where: { slug }
  })
}

// Función para LISTAR categorías del tenant actual
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
        tenantId: tenant.id // Solo listamos las de esta tienda
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

// Función para CREAR categorías vinculadas al tenant
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

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        icon: icon || 'package',
        tenantId: tenant.id // <--- ASIGNACIÓN AUTOMÁTICA DEL ID
      }
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('[CATEGORIES_POST]', error)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}