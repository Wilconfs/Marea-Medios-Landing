'use server'

import { prisma } from '@/lib/db' 
import { z } from 'zod'
import cloudinary from '@/lib/cloudinary'
import { publishVideoToFacebookPage } from '@/lib/meta' // <--- Importamos el nuevo servicio

const CreatePostSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().optional(),
  videoUrl: z.string().url("La URL del video no es válida"),
  publicId: z.string(), // Necesitamos esto para borrar en Cloudinary luego
  platform: z.string(), 
  tenantId: z.string()
})

// Función auxiliar para limpiar la nube
async function deleteFromCloudinary(publicId: string) {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
    console.log(`🗑️ Archivo ${publicId} eliminado de Cloudinary`);
  } catch (error) {
    console.error('Error limpiando Cloudinary:', error);
  }
}

export async function createContentPost(formData: any) {
  try {
    const validatedData = CreatePostSchema.parse(formData)

    // 1. Guardamos el post inicial en la base de datos como "PROCESANDO"
    const newPost = await prisma.contentPost.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        videoUrl: validatedData.videoUrl,
        platform: validatedData.platform,
        tenantId: validatedData.tenantId,
        status: 'PROCESSING', // Estado temporal
      },
    })

    // 2. Intentamos publicar en Meta
    // Nota: Aquí usarás las credenciales de prueba que guardaste en tu página de Settings.
    // Por ahora, para probar, puedes quemar los valores o sacarlos de la BD.
    const metaResponse = await publishVideoToFacebookPage({
      pageId: 'TU_PAGE_ID_DE_PRUEBA', 
      accessToken: 'TU_ACCESS_TOKEN_DE_PRUEBA',
      videoUrl: validatedData.videoUrl,
      description: validatedData.title // Usamos el título como texto del post
    });

    if (metaResponse.success) {
      // 3. Si Meta lo publicó, actualizamos la base de datos con el ID remoto y el estado final
      await prisma.contentPost.update({
        where: { id: newPost.id },
        data: { 
          status: 'PUBLISHED',
          remoteId: metaResponse.remoteId,
          publishedAt: new Date()
        }
      });

      // 4. ¡Limpieza! Ya no necesitamos el video en Cloudinary
      await deleteFromCloudinary(validatedData.publicId);

      return { success: true, post: newPost, message: "Publicado en Meta y optimizado" }
    } else {
      // Si Meta falla, lo marcamos con error
      await prisma.contentPost.update({
        where: { id: newPost.id },
        data: { status: 'ERROR' }
      });
      return { success: false, error: "Guardado en CRM, pero falló en Meta: " + metaResponse.error }
    }

  } catch (error) {
    console.error("Error en createContentPost:", error)
    return { success: false, error: "No se pudo procesar la solicitud completa" }
  }
}