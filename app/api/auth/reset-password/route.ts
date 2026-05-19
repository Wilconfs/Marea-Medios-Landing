import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db' 
import bcrypt from 'bcryptjs'

// Base de datos temporal en memoria para validar los códigos (Expira en 10 min)
const codeStorage = new Map<string, { code: string; expires: number }>()

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action, identifier, code, newPassword } = body

    // ----------------------------------------------------
    // ACCIÓN 1: GENERAR Y ENVIAR CÓDIGO POR WHATSAPP
    // ----------------------------------------------------
    if (action === 'send-code') {
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { phone: identifier },
            { email: identifier }
          ]
        }
      })

      if (!user) {
        return NextResponse.json({ message: 'No se encontró ninguna cuenta con ese dato' }, { status: 404 })
      }

      const targetPhone = user.phone
      if (!targetPhone) {
        return NextResponse.json({ message: 'El usuario no tiene un teléfono registrado para recuperación' }, { status: 400 })
      }

      // Generar código aleatorio de 6 dígitos
      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString()

      codeStorage.set(identifier, {
        code: generatedCode,
        expires: Date.now() + 10 * 60 * 1000
      })

      console.log(`[WHATSAPP MOCK] Enviando código ${generatedCode} al número ${targetPhone}`)
      
      // Aquí integras luego tu cliente de WhatsApp real si lo necesitas
      // await enviarMensajeWhatsApp(targetPhone, `Tu código de verificación para Tienda Marea es: ${generatedCode}`)

      return NextResponse.json({ 
        success: true, 
        message: 'Código de verificación enviado con éxito a tu WhatsApp registrado.' 
      })
    }

    // ----------------------------------------------------
    // ACCIÓN 2: VERIFICAR SI EL CÓDIGO ES CORRECTO
    // ----------------------------------------------------
    if (action === 'verify-code') {
      const record = codeStorage.get(identifier)

      if (!record) {
        return NextResponse.json({ message: 'El código ha expirado o no ha sido solicitado' }, { status: 400 })
      }

      if (Date.now() > record.expires) {
        codeStorage.delete(identifier)
        return NextResponse.json({ message: 'El código ha expirado, solicita uno nuevo' }, { status: 400 })
      }

      if (record.code !== code) {
        return NextResponse.json({ message: 'El código de verificación es incorrecto' }, { status: 400 })
      }

      return NextResponse.json({ success: true, message: 'Código verificado con éxito.' })
    }

    // ----------------------------------------------------
    // ACCIÓN 3: ACTUALIZAR PASSWORDHASH EN LA BASE DE DATOS
    // ----------------------------------------------------
    if (action === 'reset-password') {
      const record = codeStorage.get(identifier)

      if (!record || record.code !== code) {
        return NextResponse.json({ message: 'Acción no autorizada o sesión inválida' }, { status: 401 })
      }

      if (!newPassword || newPassword.trim().length < 6) {
        return NextResponse.json({ message: 'La nueva contraseña debe tener mínimo 6 caracteres' }, { status: 400 })
      }

      // Generamos el Hash corregido
      const newHash = await bcrypt.hash(newPassword.trim(), 10)

      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { phone: identifier },
            { email: identifier }
          ]
        }
      })

      if (!user) {
        return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 })
      }

      // ◄ REPARADO: Aquí ya usa passwordHash de forma estricta para que no rompa TypeScript en Hostinger
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: newHash
        }
      })

      codeStorage.delete(identifier)

      return NextResponse.json({ success: true, message: 'Contraseña actualizada correctamente.' })
    }

    return NextResponse.json({ message: 'Acción no válida en la petición' }, { status: 400 })

  } catch (error) {
    console.error('[AUTH_RESET_PASSWORD_POST_ERROR]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}