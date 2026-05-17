import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/auth-helpers'

export const dynamic = 'force-dynamic'

// Esquema Zod para validar la edición completa del usuario
const updateSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  role: z.enum(['SUPERADMIN', 'ADMIN', 'AUXILIAR', 'CLIENTE']),
})

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  // 1. Verificación de sesión usando tu propio Helper (Solo entran SUPERADMIN y ADMIN)
  const auth = await requireRole(['SUPERADMIN', 'ADMIN'])
  if (auth.error) {
    return NextResponse.json(
      { error: auth.error }, 
      { status: auth.error === 'unauthorized' ? 401 : 403 }
    )
  }

  const { id: targetId } = params
  const currentUser = auth.session.user

  try {
    const body = await req.json()
    const { name, email, role: nextRole } = updateSchema.parse(body)

    // 2. Traer el usuario que se intenta modificar desde tu base de datos
    const targetUser = await prisma.user.findUnique({ 
      where: { id: targetId }, 
      select: { id: true, role: true } 
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'not_found', message: 'El usuario no existe' }, { status: 404 })
    }

    // 3. CANDADO DE SEGURIDAD 1: Un ADMIN jamás puede modificar datos de un SUPERADMIN
    if (targetUser.role === 'SUPERADMIN' && currentUser.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { error: 'forbidden', message: 'No tienes permisos para modificar a un Super Admin' },
        { status: 403 },
      )
    }

    // 4. CANDADO DE SEGURIDAD 2: Solo un SUPERADMIN puede otorgar el rango SUPERADMIN a otros
    if (nextRole === 'SUPERADMIN' && targetUser.role !== 'SUPERADMIN' && currentUser.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { error: 'forbidden', message: 'Solo un Super Admin puede asignar el rol Super Admin' },
        { status: 403 },
      )
    }

    // 5. CANDADO DE SEGURIDAD 3: Evitar que te quites permisos administrativos a ti mismo por error
    if (currentUser.id === targetId && nextRole !== targetUser.role) {
      return NextResponse.json(
        { error: 'cannot_modify_self', message: 'No puedes alterar tu propio rol' },
        { status: 400 },
      )
    }

    // 6. Validar que el nuevo correo electrónico no le pertenezca ya a OTRO usuario
    const emailExists = await prisma.user.findFirst({
      where: {
        email: email.trim().toLowerCase(),
        NOT: { id: targetId },
      },
    })

    if (emailExists) {
      return NextResponse.json(
        { error: 'email_taken', message: 'Este correo ya está registrado por otro usuario' }, 
        { status: 409 }
      )
    }

    // 7. Si supera todos los filtros, actualizamos en la base de datos
    const updated = await prisma.user.update({
      where: { id: targetId },
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: nextRole as any,
      },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        role: true,
        createdAt: true
      },
    })

    return NextResponse.json(updated)

  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'invalid_input', details: err.errors }, { status: 400 })
    }
    console.error('[admin/users PATCH]', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}