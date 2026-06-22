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
      phone: true, 
      role: true,
      createdAt: true,
    },
  })

  return NextResponse.json(users)
}

// Validamos estrictamente que el teléfono sea obligatorio y tenga texto
const createSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['SUPERADMIN', 'ADMIN', 'AUXILIAR', 'CLIENTE']),
  phone: z.string().min(1, 'El teléfono celular es totalmente obligatorio'), 
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
    if (existingEmail) return NextResponse.json({ error: 'email_taken', message: 'El correo ya está registrado' }, { status: 409 })

    const formattedPhone = data.phone.trim()
    const existingPhone = await prisma.user.findFirst({ where: { phone: formattedPhone } })
    if (existingPhone) return NextResponse.json({ error: 'phone_taken', message: 'El teléfono ya está registrado' }, { status: 409 })

    const passwordHash = await bcrypt.hash(data.password, 10)
    
    const userPayload: any = {
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role,
      phone: formattedPhone,
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: auth.session.user.id },
      select: { tenantId: true }
    })

    let targetTenantId = adminUser?.tenantId

    if (!targetTenantId) {
      const fallbackTenant = await prisma.tenant.findFirst({ select: { id: true } })
      targetTenantId = fallbackTenant?.id || null
    }

    if (!targetTenantId) {
      return NextResponse.json(
        { error: 'no_tenant', message: 'No existe ningún Tenant registrado en la base de datos.' },
        { status: 400 }
      )
    }

    let derivedTenantId: string | null = null
    try {
      const referer = req.headers.get('referer') || '' 
      if (referer) {
        const urlObj = new URL(referer)
        const host = urlObj.host.split(':')[0] 
        const slug = host.split('.')[0] // Obtiene "tienda1"
        
        const tenantRecord = await prisma.tenant.findFirst({
          where: {
            OR: [
              { slug: slug },
              { id: slug }
            ]
          }
        })
        if (tenantRecord) derivedTenantId = tenantRecord.id
      }
    } catch (errTenant) {
      console.error('❌ Error derivando el tenant:', errTenant)
    }
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role,
        phone: formattedPhone,
        tenantId: targetTenantId
      },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        role: true, 
        createdAt: true,
        phone: true, // ◄ Corregido: Ahora usa true de forma nativa
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'invalid_input', message: err.errors[0].message }, { status: 400 })
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

    if (!targetId || !name?.trim() || !email?.trim() || !phone?.trim() || !nextRole) {
      return NextResponse.json({ error: 'invalid_input', message: 'Faltan campos obligatorios, incluyendo el teléfono' }, { status: 400 })
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

    // ◄ SOLUCIÓN ACÁ: Cambiado a prisma.user.findFirst
    const existingEmail = await prisma.user.findFirst({
      where: { email: email.trim().toLowerCase(), NOT: { id: targetId } },
    })
    if (existingEmail) return NextResponse.json({ error: 'email_taken', message: 'El correo ya está en uso' }, { status: 409 })

    const formattedPhone = phone.trim()
    const existingPhone = await prisma.user.findFirst({
      where: { phone: formattedPhone, NOT: { id: targetId } },
    })
    if (existingPhone) return NextResponse.json({ error: 'phone_taken', message: 'El teléfono ya está registrado por otro usuario' }, { status: 409 })

    const updateData: any = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: nextRole,
      phone: formattedPhone, 
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

    const updated = await prisma.user.update({
      where: { id: targetId },
      data: updateData,
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error('[admin/users PUT]', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}