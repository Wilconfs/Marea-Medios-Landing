'use server'

import { prisma } from '@/lib/db' 
import { revalidatePath } from 'next/cache'

// 1. Obtener todas las tareas de un Tenant específico
export async function getTasks(domainString: string) {
  try {
    // Sacamos "tienda1" de "tienda1.localhost"
    const slugPrefix = domainString.split('.')[0]

    // Buscamos el ID real de la tabla tenant
    const tenant = await prisma.tenant.findFirst({
      where: { slug: { contains: slugPrefix } }
    })

    if (!tenant) return { success: true, tasks: [] }

    const tasks = await prisma.task.findMany({
      where: { tenantId: tenant.id }, // Usamos el ID real que acabamos de capturar
      orderBy: { createdAt: 'desc' } 
    })
    return { success: true, tasks }
  } catch (error) {
    console.error("Error obteniendo tareas:", error)
    return { success: false, error: "Error al cargar las tareas" }
  }
}

// 2. Crear una nueva tarea
export async function createTask(data: {
  title: string
  description?: string
  priority: string
  dueDate?: string | null
  tenantId: string // Aquí llega "tienda1.localhost"
}) {
  try {
    // Sacamos "tienda1" de "tienda1.localhost"
    const slugPrefix = data.tenantId.split('.')[0]

    // Capturamos el ID real de la tabla tenant
    const tenant = await prisma.tenant.findFirst({
      where: { slug: { contains: slugPrefix } }
    })

    if (!tenant) {
      return { success: false, error: "No se encontró el tenant en la base de datos" }
    }

    const taskData: any = {
      title: data.title,
      description: data.description,
      priority: data.priority,
      tenantId: tenant.id, // ¡AQUÍ GUARDAMOS EL ID REAL!
      status: 'PENDING' 
    }

    // Solo añadimos dueDate si existe y no está vacío
    if (data.dueDate && data.dueDate.trim() !== "") {
      taskData.dueDate = new Date(data.dueDate)
    }

    const newTask = await prisma.task.create({
      data: taskData
    })
    
    revalidatePath('/[domain]/admin/tareas', 'page')
    return { success: true, task: newTask }
  } catch (error: any) {
    console.error("Error detallado al crear tarea:", error)
    // Mostramos el error real por si acaso falla otra cosa
    return { success: false, error: error.message || "No se pudo guardar la tarea en la base de datos" }
  }
}

// 3. Cambiar el estado de la tarea (Pendiente -> Completada, etc)
export async function updateTaskStatus(id: string, newStatus: string) {
  try {
    const updatedTask = await prisma.task.update({
      where: { id },
      data: { status: newStatus }
    })
    revalidatePath('/[domain]/admin/tareas', 'page')
    return { success: true, task: updatedTask }
  } catch (error) {
    console.error("Error actualizando estado:", error)
    return { success: false, error: "Error al actualizar la tarea" }
  }
}

// 4. Eliminar una tarea
export async function deleteTask(id: string) {
  try {
    await prisma.task.delete({
      where: { id }
    })
    revalidatePath('/[domain]/admin/tareas', 'page')
    return { success: true }
  } catch (error) {
    console.error("Error eliminando tarea:", error)
    return { success: false, error: "Error al eliminar la tarea" }
  }
}