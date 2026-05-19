import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db' // Ajusta esta importación según dónde tengas tu instancia de Prisma
import bcrypt from 'bcryptjs'

// Base de datos temporal en memoria para validar los códigos (Expira en 10 min)
// En producción puedes crear una tabla 'VerificationToken' en Prisma si lo prefieres
const codeStorage = new Map<string, { code: string; expires: number }>()

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action, identifier, code, newPassword } = body

    // ----------------------------------------------------
    // ACCIÓN 1: GENERAR Y ENVIAR CÓDIGO POR WHATSAPP
    // ----------------------------------------------------
    if (action === 'send-code') {
      // Buscar usuario por email o por teléfono
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: identifier },
            { phone: identifier } // Asegúrate de tener el campo phone en tu esquema de Prisma
          ]
        }
      })

      if (!user) {
        return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 })
      }

      // Generar código aleatorio de 6 dígitos
      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString()
      const expires = Date.now() + 10 * 60 * 1000 // Validez de 10 minutos

      // Guardar en el mapa temporal indexado por el identificador
      codeStorage.set(identifier, { code: generatedCode, expires })

      // 📢 AQUÍ VA TU CENTRALIZACIÓN DE WHATSAPP (Twilio, Evolution API, Green API, etc.)
      // Por ahora, te lo pinto en la terminal para que copies el código al probar
      console.log(`\n==========================================`)
      console.log(`📱 CÓDIGO WHATSAPP PARA: ${identifier}`)
      console.log(`🔑 CÓDIGO GENERADO: ${generatedCode}`)
      console.log(`==========================================\n`)

      return NextResponse.json({ success: true, message: 'Código generado con éxito' })
    }

    // ----------------------------------------------------
    // ACCIÓN 2: VERIFICAR SI EL CÓDIGO ES VÁLIDO
    // ----------------------------------------------------
    if (action === 'verify-code') {
      const record = codeStorage.get(identifier)

      if (!record) {
        return NextResponse.json({ message: 'No se ha solicitado código para este usuario' }, { status: 400 })
      }

      if (Date.now() > record.expires) {
        codeStorage.delete(identifier)
        return NextResponse.json({ message: 'El código ha expirado' }, { status: 400 })
      }

      if (record.code !== code) {
        return NextResponse.json({ message: 'El código introducido es incorrecto' }, { status: 400 })
      }

      return NextResponse.json({ success: true, message: 'Código verificado correctamente' })
    }

    // ----------------------------------------------------
    // ACCIÓN 3: CAMBIAR LA CONTRASEÑA EN LA BASE DE DATOS
    // ----------------------------------------------------
    if (action === 'reset-password') {
      const record = codeStorage.get(identifier)

      // Doble validación de seguridad
      if (!record || record.code !== code) {
        return NextResponse.json({ message: 'Acción no autorizada o código inválido' }, { status: 401 })
      }

      // Encriptar la nueva contraseña con bcrypt
      const hashedPassword = await bcrypt.hash(newPassword, 10)

      // Actualizar en PostgreSQL usando Prisma
      await prisma.user.updateMany({
        where: {
          OR: [
            { email: identifier },
            { phone: identifier }
          ]
        },
        data: {
          password: hashedPassword
        }
      })

      // Limpiar el código usado para que no se pueda reutilizar
      codeStorage.delete(identifier)

      return NextResponse.json({ success: true, message: 'Contraseña actualizada correctamente' })
    }

    return NextResponse.json({ message: 'Acción inválida' }, { status: 400 })

  } catch (error) {
    console.error('Error en API de recuperación:', error)
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}