import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/auth-helpers'

export const dynamic = 'force-dynamic'

export async function GET() {
  const auth = await requireRole(['SUPERADMIN'])
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === 'unauthorized' ? 401 : 403 })
  }

  const settings = await prisma.setting.findMany()
  const map: Record<string, string> = {}
  for (const s of settings) {
    if (s.key) map[s.key] = s.value
  }
  return NextResponse.json(map)
}

const updateSchema = z.object({
  settings: z.record(z.string(), z.string()),
  tenantId: z.string().optional(), // Lo hacemos opcional para evitar que rompa si no viene
})

export async function PATCH(req: Request) {
  const auth = await requireRole(['SUPERADMIN'])
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === 'unauthorized' ? 401 : 403 })
  }

  try {
    const body = await req.json()
    const { settings, tenantId } = updateSchema.parse(body)

    // Si no manejas múltiples tenants en esta sección, puedes usar un string por defecto o el id que venga
    const activeTenantId = tenantId || "global"

    const ops = Object.entries(settings).map(async ([key, value]) => {
      // 1. Buscamos de forma plana sin exigir índices @unique fijos
      const existing = await prisma.setting.findFirst({
        where: {
          key: key,
          tenantId: activeTenantId
        }
      })

      if (existing) {
        // 2. Si existe, actualizamos usando su ID único principal
        return prisma.setting.update({
          where: { id: existing.id },
          data: { value: String(value) }
        })
      } else {
        // 3. Si no existe, creamos el registro
        return prisma.setting.create({
          data: {
            key: key,
            value: String(value),
            tenantId: activeTenantId
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
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}