import { NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/auth-helpers'

export const dynamic = 'force-dynamic'

// List users - SUPERADMIN y ADMIN pueden ver
export async function GET() {
  const auth = await requireRole(['SUPERADMIN', 'ADMIN'])
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === 'unauthorized' ? 401 : 403 })
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
  })

  return NextResponse.json(users)
}

// Create internal user - SUPERADMIN y ADMIN
const createSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['SUPERADMIN', 'ADMIN', 'AUXILIAR', 'CLIENTE']),
})

export async function POST(req: Request) {
  const auth = await requireRole(['SUPERADMIN', 'ADMIN'])
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === 'unauthorized' ? 401 : 403 })
  }

  try {
    const body = await req.json()
    const data = createSchema.parse(body)

    // Solo SUPERADMIN puede crear SUPERADMIN
    if (data.role === 'SUPERADMIN' && auth.session.user.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { error: 'forbidden', message: 'Solo Super Admin puede asignar el rol Super Admin' },
        { status: 403 },
      )
    }

    // Verificar email duplicado
    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing) {
      return NextResponse.json({ error: 'email_taken' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(data.password, 10)
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role as any,
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'invalid_input', details: err.errors }, { status: 400 })
    }
    console.error('[admin/users POST]', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  const auth = await requireRole(['SUPERADMIN', 'ADMIN'])
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === 'unauthorized' ? 401 : 403 })
  }

  try {
    const body = await req.json()
    const { id: targetId, name, email, role: nextRole } = body

    if (!targetId || !name?.trim() || !email?.trim() || !nextRole) {
      return NextResponse.json({ error: 'invalid_input', message: 'Faltan campos obligatorios' }, { status: 400 })
    }

    const currentUser = auth.session.user

    // 1. Buscar usuario actual
    const targetUser = await prisma.user.findUnique({ where: { id: targetId } })
    if (!targetUser) {
      return NextResponse.json({ error: 'not_found', message: 'Usuario no encontrado' }, { status: 404 })
    }

    // 2. Regla de oro: Un ADMIN no modifica a un SUPERADMIN
    if (targetUser.role === 'SUPERADMIN' && currentUser.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'forbidden', message: 'No puedes modificar a un Super Admin' }, { status: 403 })
    }

    // 3. Regla de oro: Solo SUPERADMIN crea o promueve a SUPERADMIN
    if (nextRole === 'SUPERADMIN' && targetUser.role !== 'SUPERADMIN' && currentUser.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'forbidden', message: 'Solo un Super Admin puede asignar el rol Super Admin' }, { status: 403 })
    }

    // 4. Evitar quitarse permisos administrativos a uno mismo
    if (currentUser.id === targetId && nextRole !== targetUser.role) {
      return NextResponse.json({ error: 'cannot_modify_self', message: 'No puedes cambiar tu propio rol' }, { status: 400 })
    }

    // 5. Verificar email duplicado
    const existingEmail = await prisma.user.findFirst({
      where: {
        email: email.trim().toLowerCase(),
        NOT: { id: targetId },
      },
    })
    if (existingEmail) {
      return NextResponse.json({ error: 'email_taken', message: 'El correo ya está registrado por otro usuario' }, { status: 409 })
    }

    // 6. Actualizar en la Base de Datos
    const updated = await prisma.user.update({
      where: { id: targetId },
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: nextRole,
      },
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error('[admin/users PUT]', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}