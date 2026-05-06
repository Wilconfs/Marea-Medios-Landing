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
  for (const s of settings) map[s.key] = s.value
  return NextResponse.json(map)
}

const updateSchema = z.object({
  settings: z.record(z.string(), z.string()),
})

export async function PATCH(req: Request) {
  const auth = await requireRole(['SUPERADMIN'])
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === 'unauthorized' ? 401 : 403 })
  }

  try {
    const body = await req.json()
    const { settings } = updateSchema.parse(body)

    const ops = Object.entries(settings).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      }),
    )
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
