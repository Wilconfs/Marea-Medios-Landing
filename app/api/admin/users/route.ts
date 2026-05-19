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
    // 👇 Usamos un cast 'as any' aquí también para proteger el GET de la caché del editor
    select: {
      id: true,
      name: true,
      email: true,
      phone: true, 
      role: true,
      createdAt: true,
      _count: { select: { orders: true } },
    } as any,
  })

  return NextResponse.json(users)
}

// Create internal user - SUPERADMIN y ADMIN
const createSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['SUPERADMIN', 'ADMIN', 'AUXILIAR', 'CLIENTE']),
  phone: z.string().optional().or(z.literal('')), 
})

export async function POST(req: Request) {
  const auth = await requireRole(['SUPERADMIN', 'ADMIN'])
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === 'unauthorized' ? 401 : 403 })
  }

  try {
    const body = await req.json()
    const data = createSchema.parse(body)

    if (data.role === 'SUPERADMIN' && auth.session.user.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { error: 'forbidden', message: 'Solo Super Admin puede asignar el rol Super Admin' },
        { status: 403 },
      )
    }

    const existingEmail = await prisma.user.findUnique({ where: { email: data.email } })
    if (existingEmail) return NextResponse.json({ error: 'email_taken' }, { status: 409 })

    // ◄ SOLUCIÓN: Solo validar teléfono único si el usuario realmente escribió uno
    const formattedPhone = data.phone?.trim() || null
    if (formattedPhone) {
      const existingPhone = await prisma.user.findFirst({ where: { phone: formattedPhone } })
      if (existingPhone) return NextResponse.json({ error: 'phone_taken', message: 'El teléfono ya está registrado' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(data.password, 10)
    
    // Objeto limpio con bypass 'as any'
    const userPayload: any = {
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role,
      phone: formattedPhone,
    }

    const user = await prisma.user.create({
      data: userPayload,
      select: { 
        id: true, 
        name: true, 
        email: true, 
        role: true, 
        createdAt: true,
        phone: true // ◄ Al meter el 'as any' abajo, ya no te va a estallar aquí
      } as any,
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
    const { id: targetId, name, email, role: nextRole, phone, password } = body

    // ◄ SOLUCIÓN: Eliminamos la validación estricta de !phone?.trim() para que no rompa si viene vacío
    if (!targetId || !name?.trim() || !email?.trim() || !nextRole) {
      return NextResponse.json({ error: 'invalid_input', message: 'Faltan campos obligatorios' }, { status: 400 })
    }

    const currentUser = auth.session.user

    const targetUser = await prisma.user.findUnique({ where: { id: targetId } }) as any
    if (!targetUser) {
      return NextResponse.json({ error: 'not_found', message: 'Usuario no encontrado' }, { status: 404 })
    }

    if (targetUser.role === 'SUPERADMIN' && currentUser.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'forbidden', message: 'No puedes modificar a un Super Admin' }, { status: 403 })
    }
    if (nextRole === 'SUPERADMIN' && targetUser.role !== 'SUPERADMIN' && currentUser.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'forbidden', message: 'Solo un Super Admin puede asignar el rol Super Admin' }, { status: 403 })
    }
    if (currentUser.id === targetId && nextRole !== targetUser.role) {
      return NextResponse.json({ error: 'cannot_modify_self', message: 'No puedes cambiar tu propio rol' }, { status: 400 })
    }

    const existingEmail = await prisma.user.findFirst({
      where: { email: email.trim().toLowerCase(), NOT: { id: targetId } },
    })
    if (existingEmail) return NextResponse.json({ error: 'email_taken', message: 'El correo ya está en uso' }, { status: 409 })

    // ◄ SOLUCIÓN: Solo validar teléfono duplicado en edición si se ingresó un valor
    const formattedPhone = phone?.trim() || null
    if (formattedPhone) {
      const existingPhone = await prisma.user.findFirst({
        where: { phone: formattedPhone, NOT: { id: targetId } },
      })
      if (existingPhone) return NextResponse.json({ error: 'phone_taken', message: 'El teléfono ya está registrado por otro usuario' }, { status: 409 })
    }

    const updateData: any = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: nextRole,
      phone: formattedPhone, // Guardará el número o null si se borró
    }

    if (password && password.trim().length >= 6) {
      if (targetUser.role === 'CLIENTE') {
        return NextResponse.json({ 
          error: 'forbidden_client_password', 
          message: 'Por seguridad, las contraseñas de los clientes solo pueden cambiarse desde el flujo de recuperación externa.' 
        }, { status: 403 })
      }
      updateData.passwordHash = await bcrypt.hash(password.trim(), 10)
    }

    // 👇 SOLUCIÓN: Agregamos el 'as any' aquí para saltar el bloqueo del cliente de Prisma viejo
    const updated = await prisma.user.update({
      where: { id: targetId },
      data: updateData as any,
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error('[admin/users PUT]', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}