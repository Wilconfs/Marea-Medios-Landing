import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth-helpers'
import path from 'path'
import { writeFile, mkdir, unlink } from 'fs/promises'

export const dynamic = 'force-dynamic'

/**
 * POST: Subida de archivos al servidor local (XAMPP o Hostinger)
 */
export async function POST(req: Request) {
  // Validación de seguridad por roles
  const auth = await requireRole(['SUPERADMIN', 'ADMIN'])
  if (auth.error) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.error === 'unauthorized' ? 401 : 403 },
    )
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'missing_file' }, { status: 400 })
    }

    // Convertimos el archivo a Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Definimos la ruta de la carpeta: public/uploads
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    
    // Nos aseguramos de que la carpeta exista
    await mkdir(uploadDir, { recursive: true })

    // Creamos un nombre único para evitar colisiones
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`
    const filePath = path.join(uploadDir, fileName)

    // Guardar el archivo en el disco (Usando el buffer directamente)
    await writeFile(filePath, buffer)

    // La URL pública que guardaremos en la DB
    const publicUrl = `/uploads/${fileName}`

    return NextResponse.json({ 
      publicUrl, 
      cloud_storage_path: publicUrl // Mantenemos el nombre para compatibilidad con el Frontend
    })
  } catch (err) {
    console.error('[upload POST local]', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}

/**
 * DELETE: Eliminar archivos físicamente del servidor
 */
export async function DELETE(req: Request) {
  const auth = await requireRole(['SUPERADMIN', 'ADMIN'])
  if (auth.error) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.error === 'unauthorized' ? 401 : 403 },
    )
  }

  try {
    const { cloud_storage_path } = await req.json()
    if (!cloud_storage_path) {
      return NextResponse.json({ error: 'missing_path' }, { status: 400 })
    }

    // Normalizamos la ruta para evitar errores con el "/" inicial
    const cleanPath = cloud_storage_path.startsWith('/') 
      ? cloud_storage_path.substring(1) 
      : cloud_storage_path;

    // Construimos la ruta absoluta al archivo
    const filePath = path.join(process.cwd(), 'public', cleanPath)
    
    // Intentamos borrar el archivo
    await unlink(filePath)
    
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[upload DELETE local]', err)
    // Devolvemos ok: true para no romper el flujo del frontend si el archivo ya no existía
    return NextResponse.json({ ok: true, warning: 'file_not_found' })
  }
}