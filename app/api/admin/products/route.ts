import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/auth-helpers'

export const dynamic = 'force-dynamic'

/**
 * 1. Función para detectar la tienda (Tenant)
 */
async function getTenantContext() {
  const headerList = await headers()
  const host = headerList.get('host') || ''
  const domain = host.split(':')[0]
  
  if (!domain) return null

  return await prisma.tenant.findUnique({
    where: { slug: domain }
  })
}

// 2. LISTAR productos
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
      where: { tenantId: tenant.id },
      include: { category: true },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('[ADMIN_PRODUCTS_GET]', error)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}

// 3. CREAR producto (Corregido para soportar los dos precios)
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
    
    const { 
      name, 
      description, 
      price, 
      originalPrice, // <-- CAPTURAMOS EL PRECIO ORIGINAL DE ANTES
      imageUrl, 
      categoryId, 
      isActive,
      stock,
      isFlashSale
    } = body

    if (!name || price === undefined || price === null || !categoryId) {
      return NextResponse.json({ error: 'Campos obligatorios faltantes' }, { status: 400 })
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price.toString()), // Precio final de venta (Rebajado o normal)
        originalPrice: originalPrice ? parseFloat(originalPrice.toString()) : null, // Precio viejo base
        imageUrl: imageUrl, 
        categoryId,
        isActive: isActive ?? true,
        isFlashSale: isFlashSale ?? false,
        stock: parseInt(stock?.toString() || '0') || 0,
        tenantId: tenant.id
      }
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('[ADMIN_PRODUCTS_POST]', error)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}