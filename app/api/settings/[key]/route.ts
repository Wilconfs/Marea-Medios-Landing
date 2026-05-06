import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: { key: string } }
) {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: params?.key },
    })
    return NextResponse.json({ setting })
  } catch (err) {
    console.error('GET /api/settings/[key]', err)
    return NextResponse.json({ setting: null })
  }
}
