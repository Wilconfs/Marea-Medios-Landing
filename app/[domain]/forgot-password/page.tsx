import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db' // ◄ CAMBIADO: Ahora usa 'prisma' en lugar de 'db'
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
      // Buscamos al usuario ya sea por su teléfono o por su email usando 'prisma'
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

      // El destino principal será el teléfono del usuario
      const targetPhone = user.phone

      // Generar código aleatorio de 6 dígitos
      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString()
      const expires = Date.now() + 10 * 60 * 1000 // Validez de 10 minutos

      // Guardamos el código usando el identificador con el que se solicitó
      codeStorage.set(identifier, { code: generatedCode, expires })

      // 📢 PRUEBA LOCAL EN CONSOLA
      console.log(`\n==========================================`)
      console.log(`📱 ENVIANDO CÓDIGO WHATSAPP AL: ${targetPhone}`)
      console.log(`🔑 CÓDIGO GENERADO: ${generatedCode}`)
      console.log(`==========================================\n`)

      return NextResponse.json({ success: true, message: 'Código enviado con éxito' })
    }

    // ----------------------------------------------------
    // ACCIÓN 2: VERIFICAR CÓDIGO DE WHATSAPP
    // ----------------------------------------------------
    if (action === 'verify-code') {
      const record = codeStorage.get(identifier)

      if (!record) {
        return NextResponse.json({ message: 'No has solicitado un código válido' }, { status: 400 })
      }

      if (Date.now() > record.expires) {
        codeStorage.delete(identifier)
        return NextResponse.json({ message: 'El código ha expirado (Límite 10 min)' }, { status: 400 })
      }

      if (record.code !== code) {
        return NextResponse.json({ message: 'El código es incorrecto' }, { status: 400 })
      }

      return NextResponse.json({ success: true, message: 'Código verificado correctamente' })
    }

    // ----------------------------------------------------
    // ACCIÓN 3: ACTUALIZAR PASSWORDHASH EN PRISMA
    // ----------------------------------------------------
    if (action === 'reset-password') {
      const record = codeStorage.get(identifier)

      if (!record || record.code !== code) {
        return NextResponse.json({ message: 'Acción no autorizada' }, { status: 401 })
      }

      // Generamos el Hash de la nueva contraseña con bcrypt
      const newHash = await bcrypt.hash(newPassword, 10)

      // Buscamos el usuario para obtener su ID real
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

      // Actualización directa usando el ID único del usuario encontrado
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: newHash
        }
      })

      // Borramos el token para evitar reutilización
      codeStorage.delete(identifier)

      return NextResponse.json({ success: true, message: 'Contraseña actualizada' })
    }

    return NextResponse.json({ message: 'Acción no válida' }, { status: 400 })

  } catch (error) {
    console.error('Error crítico en servidor:', error)
    return NextResponse.json({ message: 'Error interno en el servidor' }, { status: 500 })
  }
}