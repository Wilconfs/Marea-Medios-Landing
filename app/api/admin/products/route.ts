import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/auth-helpers'

export const dynamic = 'force-dynamic'

// 1. Función para detectar la tienda (Tenant)
async function getTenantContext() {
  const headerList = headers()
  const host = headerList.get('host')
  
  // Extraemos el subdominio (slug)
  const parts = host?.split('.') || []
  const slug = parts.length > 1 ? parts[0] : null
  
  if (!slug) return null

  return await prisma.tenant.findUnique({
    where: { slug }
  })
}

// 2. LISTAR productos (Filtrados por tienda)
export async function GET() {
  try {
    const auth = await requireRole(['SUPERADMIN', 'ADMIN', 'AUXILIAR'])
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: 403 })
    }

    const tenant = await getTenantContext()
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant no encontrado' }, { status: 404 })
    }

    const products = await prisma.product.findMany({
      where: {
        tenantId: tenant.id // FILTRO CRÍTICO
      },
      include: {
        category: true 
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('[ADMIN_PRODUCTS_GET]', error)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}

// 3. CREAR producto (Vinculado a la tienda)
export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(['SUPERADMIN', 'ADMIN'])
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: 403 })
    }

    const tenant = await getTenantContext()
    if (!tenant) {
      return NextResponse.json({ error: 'Tienda no identificada' }, { status: 400 })
    }

    const body = await req.json()
    
    // Ajustamos los nombres de los campos según lo que envía tu formulario
    const { 
      name, 
      description, 
      price, 
      imageUrl, // Asegúrate de usar imageUrl si así viene del form
      categoryId, 
      isActive,
      stock 
    } = body

    if (!name || !price || !categoryId) {
      return NextResponse.json({ error: 'Campos obligatorios faltantes' }, { status: 400 })
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price.toString()),
        imageUrl: imageUrl, 
        categoryId,
        isActive: isActive ?? true,
        stock: parseInt(stock?.toString()) || 0,
        tenantId: tenant.id // ASIGNACIÓN OBLIGATORIA
      }
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('[ADMIN_PRODUCTS_POST]', error)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}