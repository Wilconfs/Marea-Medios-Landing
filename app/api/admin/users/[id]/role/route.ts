import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/auth-helpers'

export const dynamic = 'force-dynamic'

const schema = z.object({
  role: z.enum(['SUPERADMIN', 'ADMIN', 'AUXILIAR', 'CLIENTE']),
})

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  // 1. Verificación de sesión y roles permitidos para entrar a la API
  const auth = await requireRole(['SUPERADMIN', 'ADMIN'])
  if (auth.error) {
    return NextResponse.json(
      { error: auth.error }, 
      { status: auth.error === 'unauthorized' ? 401 : 403 }
    )
  }

  const { id: targetId } = params;
  const currentUser = auth.session.user;

  // 2. Evitar que un usuario se modifique a sí mismo (para no perder acceso accidentalmente)
  if (currentUser.id === targetId) {
    return NextResponse.json(
      { error: 'cannot_modify_self', message: 'No puedes cambiar tu propio rol' },
      { status: 400 },
    )
  }

  try {
    const body = await req.json()
    const { role: nextRole } = schema.parse(body)

    // 3. Obtener el rol actual del usuario que queremos modificar
    const targetUser = await prisma.user.findUnique({ 
      where: { id: targetId }, 
      select: { role: true } 
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 })
    }

    // 4. REGLA DE ORO: Solo SUPERADMIN gestiona a otros SUPERADMIN
    // Si el objetivo es SUPERADMIN y quien edita es solo ADMIN, bloqueamos.
    if (targetUser.role === 'SUPERADMIN' && currentUser.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { error: 'forbidden', message: 'No tienes permisos para modificar a un Super Admin' },
        { status: 403 },
      )
    }

    // 5. REGLA DE ORO: Solo SUPERADMIN puede crear nuevos SUPERADMIN
    // Si un ADMIN intenta asignar el rango SUPERADMIN a alguien más, bloqueamos.
    if (nextRole === 'SUPERADMIN' && currentUser.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { error: 'forbidden', message: 'Solo un Super Admin puede asignar el rol Super Admin' },
        { status: 403 },
      )
    }

    // 6. Aplicar la actualización si pasó todas las validaciones
    const updated = await prisma.user.update({
      where: { id: targetId },
      data: { role: nextRole },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        role: true 
      },
    })

    return NextResponse.json(updated)

  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'invalid_input' }, { status: 400 })
    }
    console.error('[admin/users/role PATCH]', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}