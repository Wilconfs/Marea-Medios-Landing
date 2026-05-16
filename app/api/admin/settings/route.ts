import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/auth-helpers'

export const dynamic = 'force-dynamic'

/**
 * Detecta dinámicamente el Tenant real inspeccionando la URL (host)
 */
async function getTenantContext() {
  const headerList = await headers() // Next.js 15
  const host = headerList.get('host') || ''
  const domain = host.split(':')[0] // Remueve el puerto (:3000)
  
  if (!domain) return null

  return await prisma.tenant.findUnique({
    where: { slug: domain }
  })
}

// 1. OBTENER CONFIGURACIONES DE LA TIENDA ACTUAL
export async function GET() {
  const auth = await requireRole(['SUPERADMIN', 'ADMIN'])
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: 403 })
  }

  const tenant = await getTenantContext()
  if (!tenant) {
    return NextResponse.json({ error: 'Tienda no identificada' }, { status: 404 })
  }

  // Buscamos SOLO las configuraciones que correspondan al ID único de esta tienda
  const settings = await prisma.setting.findMany({
    where: { tenantId: tenant.id }
  })

  const map: Record<string, string> = {}
  for (const s of settings) {
    if (s.key) map[s.key] = s.value
  }
  return NextResponse.json(map)
}

const updateSchema = z.object({
  settings: z.record(z.string(), z.any()),
})

// 2. GUARDAR CONFIGURACIONES EXCLUSIVAS DE ESTA TIENDA
export async function PATCH(req: Request) {
  const auth = await requireRole(['SUPERADMIN', 'ADMIN'])
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: 403 })
  }

  const tenant = await getTenantContext()
  if (!tenant) {
    return NextResponse.json({ error: 'Tienda no identificada' }, { status: 400 })
  }

  try {
    const body = await req.json()
    const { settings } = updateSchema.parse(body)

    const ops = Object.entries(settings).map(async ([key, value]) => {
      const stringValue = value !== null && value !== undefined ? String(value) : ''

      // Buscamos si ya existe esta llave para ESTA tienda específica
      const existing = await prisma.setting.findFirst({
        where: {
          key: key,
          tenantId: tenant.id // Uso estricto del ID único del cliente
        }
      })

      if (existing) {
        return prisma.setting.update({
          where: { id: existing.id },
          data: { value: stringValue }
        })
      } else {
        return prisma.setting.create({
          data: {
            key: key,
            value: stringValue,
            tenantId: tenant.id // Se vincula de forma segura a su dueño
          }
        })
      }
    })

    await Promise.all(ops)
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'invalid_input' }, { status: 400 })
    }
    console.error('[admin/settings PATCH Error]:', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}