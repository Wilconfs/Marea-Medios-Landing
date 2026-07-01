'use server'

import { prisma } from '@/lib/db' 
import { revalidatePath } from 'next/cache'
import { TaskPriority, TaskStatus } from "@prisma/client"

// 1. Obtener todas las tareas de un Tenant específico
export async function getTasks(tenantId: string) {
try {
    const tasks = await prisma.task.findMany({
      where: { tenantId },
      include: {
        assignedTo: { // Incluimos el nombre del usuario asignado
          select: { id: true, name: true} 
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return { success: true, tasks }
  } catch (error) {
    console.error("Error obteniendo tareas:", error)
    return { success: false, error: "No se pudieron cargar las tareas." }
  }
}

// 2. Crear una nueva tarea
export async function createTask(data: {
  title: string;
  description?: string;
  priority: string;
  dueDate: string;
  assignedToId?: string; // Nuevo campo
  tenantId: string;
}) {
  try {
    const { title, description, priority, dueDate, assignedToId, tenantId } = data
    
    if (!title || !dueDate) {
      return { success: false, error: "El título y la fecha son obligatorios." }
    }

    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority as TaskPriority,
        dueDate: new Date(dueDate), // Guardamos como DateTime
        assignedToId: assignedToId || null,
        tenantId
      }
    })
    
    return { success: true, task: newTask }
  } catch (error) {
    console.error("Error creando tarea:", error)
    return { success: false, error: "No se pudo guardar la tarea." }
  }
}

// 3. Cambiar el estado de la tarea (Pendiente -> Completada, etc)
export async function updateTaskStatus(id: string, newStatus: string) {
  try {
    const updatedTask = await prisma.task.update({
      where: { id },
      data: { status: newStatus as TaskStatus } // <--- EL CAMBIO ESTÁ AQUÍ (agregamos "as TaskStatus")
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