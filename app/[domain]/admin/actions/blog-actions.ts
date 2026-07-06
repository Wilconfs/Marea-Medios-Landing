'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentSession } from '@/lib/auth-helpers'
import { prisma } from "@/lib/db"

// ==========================================
// 🏷️ TAXONOMÍA: CATEGORÍAS Y ETIQUETAS
// ==========================================

export async function getBlogCategories() {
  try {
    const session = await getCurrentSession()
    if (!session?.user?.id) return { success: false, error: 'No autorizado' }

    // Buscamos a qué empresa pertenece el usuario actual
    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user?.tenantId) return { success: true, data: [] } // Si no tiene empresa, devolvemos vacío

    const categories = await prisma.category.findMany({
      where: { tenantId: user.tenantId },
      orderBy: { name: 'asc' }
    });
    return { success: true, data: categories };
  } catch (error) {
    return { success: false, error: "Error al cargar categorías" };
  }
}

export async function createBlogCategory(name: string) {
  try {
    const session = await getCurrentSession()
    if (!session?.user?.id) throw new Error('No autorizado: Debes iniciar sesión.')

    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    
    // ⚠️ Esta es probablemente la línea que está fallando actualmente:
    if (!user?.tenantId) throw new Error('Tu usuario no tiene un Tenant (Empresa) asignado en la base de datos. Pídele al Super Admin que te asigne uno.')

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

    await prisma.category.create({
      data: { name, slug, tenantId: user.tenantId }
    })
    
    // Le decimos a Next.js que recargue los datos en la vista
    revalidatePath('/admin/blog')
    return { success: true }
    
  } catch (error: any) {
    console.error("Debug - Error real al crear categoría:", error); // Esto lo verás en tu terminal (CMD/VSCode)
    
    // Si Prisma nos dice que se violó una restricción de unicidad (ya existe)
    if (error.code === 'P2002') {
      return { success: false, error: 'Ya existe una categoría con este mismo nombre.' }
    }
    
    // Para cualquier otro error, devolvemos el mensaje real que originó la falla
    return { success: false, error: error.message || 'Error desconocido al procesar la solicitud.' }
  }
}

export async function deleteBlogCategory(id: string) {
  try {
    await prisma.category.delete({ where: { id } })
    revalidatePath('/admin/blog')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: 'Error al eliminar la categoría' }
  }
}

export async function getBlogTags() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' }
    });
    return { success: true, data: tags };
  } catch (error) {
    return { success: false, error: "Error al cargar etiquetas" };
  }
}

// ==========================================
// 📝 GESTIÓN DE ARTÍCULOS
// ==========================================

// 1. OBTENER TODOS LOS ARTÍCULOS
export async function getBlogPosts() {
  try {
    const session = await getCurrentSession()
    if (!session?.user?.id) throw new Error('No autorizado')

    const posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { name: true } },
        category: { select: { name: true } }, // Traemos el nombre de la categoría
        tags: { select: { name: true } }      // Traemos las etiquetas
      }
    })
    return { success: true, data: posts }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// 2. CREAR UN NUEVO ARTÍCULO
export async function createBlogPost(formData: {
  title: string
  slug: string
  excerpt?: string
  content: string
  coverImage?: string
  status: string
  categoryId?: string | null
  tags?: string[]
}) {
  try {
    const session = await getCurrentSession()
    if (!session?.user?.id) throw new Error('No autorizado')

    const newPost = await prisma.blogPost.create({
      data: {
        title: formData.title,
        slug: formData.slug.toLowerCase().replace(/ /g, '-'),
        excerpt: formData.excerpt,
        content: formData.content,
        coverImage: formData.coverImage,
        status: formData.status,
        authorId: session.user.id,
        
        // Relación con Categoría
        categoryId: formData.categoryId || null,
        
        // Relación con Etiquetas (Conecta las existentes o crea nuevas)
        tags: formData.tags && formData.tags.length > 0 ? {
          connectOrCreate: formData.tags.map((tag) => ({
            where: { name: tag },
            create: { 
              name: tag, 
              slug: tag.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') 
            }
          }))
        } : undefined
      },
    })

    revalidatePath('/admin/blog')
    return { success: true, data: newPost }
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: 'Ya existe un artículo con ese mismo Slug/URL' }
    }
    return { success: false, error: error.message }
  }
}

// 3. EDITAR UN ARTÍCULO EXISTENTE
export async function updateBlogPost(
  id: string,
  formData: {
    title: string
    slug: string
    excerpt?: string
    content: string
    coverImage?: string
    status: string
    categoryId?: string | null
    tags?: string[]
  }
) {
  try {
    const session = await getCurrentSession()
    if (!session?.user?.id) throw new Error('No autorizado')

    const updatedPost = await prisma.blogPost.update({
      where: { id },
      data: {
        title: formData.title,
        slug: formData.slug.toLowerCase().replace(/ /g, '-'),
        excerpt: formData.excerpt,
        content: formData.content,
        coverImage: formData.coverImage,
        status: formData.status,
        
        // Relación con Categoría
        categoryId: formData.categoryId || null,
        
        // Primero desconectamos todas las etiquetas anteriores (set: []) 
        // y luego conectamos/creamos las nuevas que vengan en el formulario
        tags: formData.tags ? {
          set: [],
          connectOrCreate: formData.tags.map((tag) => ({
            where: { name: tag },
            create: { 
              name: tag, 
              slug: tag.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') 
            }
          }))
        } : { set: [] } // Si envían un array vacío, borramos todas las etiquetas
      },
    })

    revalidatePath('/admin/blog')
    return { success: true, data: updatedPost }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// 4. ELIMINAR UN ARTÍCULO
export async function deleteBlogPost(id: string) {
  try {
    const session = await getCurrentSession()
    if (!session?.user?.id) throw new Error('No autorizado')

    await prisma.blogPost.delete({
      where: { id },
    })

    revalidatePath('/admin/blog')
    return { success: true, message: 'Artículo eliminado correctamente' }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// 5. OBTENER UN ARTÍCULO POR SU ID (Para editar)
export async function getBlogPostById(id: string) {
  try {
    const session = await getCurrentSession()
    if (!session?.user?.id) throw new Error('No autorizado')

    const post = await prisma.blogPost.findUnique({
      where: { id },
      // Es crucial incluir la categoría y las etiquetas para que el formulario se llene al editar
      include: {
        category: true,
        tags: true
      }
    })
    return { success: true, data: post }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}