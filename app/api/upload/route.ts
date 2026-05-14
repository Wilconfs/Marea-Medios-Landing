import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { v2 as cloudinary } from 'cloudinary'

// Configuración de Cloudinary usando tus variables de entorno
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req: NextRequest) {
  try {
    // 1. Verificar que la petición sea del tipo correcto
    const contentType = req.headers.get('content-type') || ''
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'El formato debe ser multipart/form-data' }, 
        { status: 400 }
      )
    }

    // 2. Obtener el dominio para organizar las carpetas en Cloudinary
    const headerList = await headers()
    const host = headerList.get('host') || ''
    const domain = host.split(':')[0]

    // 3. Procesar los archivos del FormData
    const formData = await req.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No se encontraron archivos en la petición' }, 
        { status: 400 }
      )
    }

    // 4. Subir cada archivo a Cloudinary
    const uploadPromises = files.map(async (file) => {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      return new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { 
            folder: `ecomdash/${domain}`, // Organiza por dominio del cliente
            resource_type: 'auto'
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error)
              reject(error)
            } else {
              resolve(result?.secure_url || '')
            }
          }
        )
        uploadStream.end(buffer)
      })
    })

    // 5. Esperar a que todas las subidas terminen
    const urls = await Promise.all(uploadPromises)

    return NextResponse.json({ urls })

  } catch (error: any) {
    console.error('[UPLOAD_ERROR]', error)
    return NextResponse.json(
      { error: 'Error interno al procesar la subida', details: error.message }, 
      { status: 500 }
    )
  }
}