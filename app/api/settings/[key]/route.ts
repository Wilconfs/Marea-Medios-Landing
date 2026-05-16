import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/auth-helpers'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const auth = await requireRole(['SUPERADMIN'])
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === 'unauthorized' ? 401 : 403 })
  }

  // Capturamos el tenantId si viene en la URL (?tenantId=xxx)
  const { searchParams } = new URL(req.url)
  const tenantId = searchParams.get('tenantId')

  // Si pasas un tenantId filtramos por tienda, de lo contrario traemos todo
  const settings = await prisma.setting.findMany({
    where: tenantId ? { tenantId } : undefined
  })

  const map: Record<string, string> = {}
  for (const s of settings) {
    if (s.key) map[s.key] = s.value
  }
  return NextResponse.json(map)
}

const updateSchema = z.object({
  settings: z.record(z.string(), z.string()),
  tenantId: z.string(), // Lo hacemos obligatorio para garantizar que pertenezca a una tienda real
})

export async function PATCH(req: Request) {
  const auth = await requireRole(['SUPERADMIN'])
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === 'unauthorized' ? 401 : 403 })
  }

  try {
    const body = await req.json()
    const { settings, tenantId } = updateSchema.parse(body)

    const ops = Object.entries(settings).map(async ([key, value]) => {
      // 1. Buscamos de forma plana asegurando que coincida la llave Y la tienda real
      const existing = await prisma.setting.findFirst({
        where: {
          key: key,
          tenantId: tenantId
        }
      })

      if (existing) {
        // 2. Si ya existe, actualizamos su valor por ID único de fila
        return prisma.setting.update({
          where: { id: existing.id },
          data: { value: String(value) }
        })
      } else {
        // 3. Si no existe, creamos el registro amarrado al tenantId real existente
        return prisma.setting.create({
          data: {
            key: key,
            value: String(value),
            tenantId: tenantId
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
    console.error('[admin/settings PATCH]', err)
    return NextResponse.json({ error: 'server_error', details: String(err) }, { status: 500 })
  }
}