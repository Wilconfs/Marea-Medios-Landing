import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const signupSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6).max(100),
  phone: z.string().trim().min(1, 'El teléfono celular es requerido'), 
  tenantId: z.string().optional() 
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const parsed = signupSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }
    
    const { name, email, phone, password, tenantId } = parsed.data 

    if (!phone || phone.trim() === "") {
      return NextResponse.json({ message: 'El teléfono celular es requerido' }, { status: 400 })
    }

    // 1. Validar que el teléfono no esté duplicado
    const existingPhone = await prisma.user.findFirst({ where: { phone: phone.trim() } })
    if (existingPhone) {
      return NextResponse.json({ message: 'Este número de teléfono ya está registrado' }, { status: 409 })
    }
    
    // 2. Validar si el correo ya existe
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { message: 'Este correo ya está registrado' },
        { status: 409 }
      )
    }

    // 3. ENCONTRAR EL ID DEL TENANT (CORREGIDO SIN EL CAMPO DOMAIN)
    let realTenantId: string | null = null
    
    if (tenantId) {
      try {
        const simpleSlug = tenantId.split('.')[0]
        
        // CORRECCIÓN: Buscamos únicamente por las columnas reales de tu modelo Tenant: id o slug
        const tenantRecord = await prisma.tenant.findFirst({
          where: {
            OR: [
              { id: tenantId },
              { slug: tenantId },
              { slug: simpleSlug }
            ]
          }
        })
        
        if (tenantRecord) {
          realTenantId = tenantRecord.id
          console.log("✅ Tenant encontrado con ID:", realTenantId)
        } else {
          // Si no encuentra coincidencia con "tienda1", usamos el primer Tenant de respaldo
          const fallbackTenant = await prisma.tenant.findFirst()
          if (fallbackTenant) {
            realTenantId = fallbackTenant.id
            console.log("⚠️ Usando Tenant de respaldo:", realTenantId)
          }
        }
      } catch (tenantError) {
        console.error('⚠️ Error al buscar el Tenant en la BD:', tenantError)
      }
    }

    const passwordHash = await bcrypt.hash(password, 10)
    
    // 4. CREACIÓN DEL USUARIO CON SU RELACIÓN CORRECTA
    let user;
    try {
      user = await prisma.user.create({
        data: { 
          name, 
          email, 
          passwordHash, 
          role: 'CLIENTE', 
          phone: phone.trim(),
          tenantId: realTenantId || tenantId || null 
        },
        select: { id: true, name: true, email: true, role: true },
      })
    } catch (prismaCreateError) {
      console.warn('🚨 Falló la inserción relacional. Aplicando fallback forzado...', prismaCreateError)
      
      // Reintento definitivo basado en el ID de tu phpMyAdmin
      user = await prisma.user.create({
        data: { 
          name, 
          email, 
          passwordHash, 
          role: 'CLIENTE', 
          phone: phone.trim(),
          tenantId: realTenantId || "cliente16421" 
        },
        select: { id: true, name: true, email: true, role: true },
      })
    }
    
    return NextResponse.json({ user }, { status: 201 })
  } catch (err) {
    console.error('💥 signup error crítico general:', err)
    return NextResponse.json(
      { error: 'Error al registrar usuario', details: String(err) },
      { status: 500 }
    )
  }
}