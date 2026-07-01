'use server'

import { prisma } from "@/lib/db"

export async function getDashboardStats(tenantId: string) {
  try {
    const [contactsCount, dealsCount, tasksCount, pipelineAggr, recentDeals, pipelineGroup, recentTasks] = await Promise.all([
      prisma.contact.count({ where: { tenantId } }),
      prisma.deal.count({ where: { tenantId, stage: { not: 'LOST' } } }),
      prisma.task.count({ where: { tenantId, status: 'PENDING' } }),
      prisma.deal.aggregate({
        where: { tenantId, stage: { not: 'LOST' } },
        _sum: { value: true }
      }),
      prisma.deal.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { contact: true }
      }),
      prisma.deal.groupBy({
        by: ['stage'],
        where: { tenantId, stage: { not: 'LOST' } },
        _sum: { value: true }
      }),
      // NUEVO: Traemos las próximas 4 tareas pendientes
      prisma.task.findMany({
        where: { tenantId, status: 'PENDING' },
        orderBy: { createdAt: 'desc' }, // O si usas dueDate: { dueDate: 'asc' }
        take: 4
      })
    ])

    const pipelineByStage = pipelineGroup.map(item => ({
      stage: item.stage,
      value: item._sum.value || 0
    }))

    return {
      success: true,
      data: {
        contactsCount,
        dealsCount,
        tasksCount,
        pipelineValue: pipelineAggr._sum.value || 0,
        recentDeals,
        pipelineByStage,
        recentTasks // Pasamos las tareas a la vista
      }
    }
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error)
    return { success: false, error: "No se pudieron cargar las métricas." }
  }
}