// Archivo: app/[domain]/admin/actions/deals.ts
'use server'

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { DealStage } from "@prisma/client"

// 1. LEER OPORTUNIDADES
export async function getDeals(tenantId: string) {
  try {
    const deals = await prisma.deal.findMany({
      where: {
        tenantId: tenantId,
      },
      include: {
        contact: true // Incluimos los datos del contacto asociado para mostrarlos en la tarjeta
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return { success: true, data: deals }
  } catch (error) {
    console.error("Error obteniendo oportunidades:", error)
    return { success: false, error: "No se pudieron cargar las oportunidades." }
  }
}

// 2. CREAR OPORTUNIDAD
export async function createDeal(formData: FormData, tenantId: string, domain: string) {
  try {
    const title = formData.get('title') as string
    const valueStr = formData.get('value') as string
    const stage = formData.get('stage') as DealStage || 'PROSPECTING'
    const contactId = formData.get('contactId') as string

    if (!title || !contactId) {
      return { success: false, error: "El título y el contacto son obligatorios." }
    }

    const value = valueStr ? parseFloat(valueStr) : 0

    const newDeal = await prisma.deal.create({
      data: {
        title,
        value,
        stage,
        contactId,
        tenantId,
      },
    })

    revalidatePath(`/${domain}/admin/oportunidades`)
    return { success: true, data: newDeal }
  } catch (error) {
    console.error("Error creando oportunidad:", error)
    return { success: false, error: "Ocurrió un error al guardar la oportunidad." }
  }
}

export async function updateDealStage(dealId: string, newStage: DealStage, domain: string) {
  try {
    await prisma.deal.update({
      where: { id: dealId },
      data: { stage: newStage }
    })

    revalidatePath(`/${domain}/admin/oportunidades`)
    return { success: true }
  } catch (error) {
    console.error("Error actualizando etapa del deal:", error)
    return { success: false, error: "No se pudo actualizar la oportunidad." }
  }
}