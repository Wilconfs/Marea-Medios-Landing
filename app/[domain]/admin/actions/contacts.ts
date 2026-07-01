'use server'

import { prisma } from "@/lib/db" // <-- Así es la forma correcta según tu proyecto
import { revalidatePath } from "next/cache"
import { ContactStatus } from "@prisma/client" 

// ... resto de tu código de getContacts y createContact ...

// 1. LEER CONTACTOS
export async function getContacts(tenantId: string) {
  try {
    const contacts = await prisma.contact.findMany({
      where: {
        tenantId: tenantId,
      },
      orderBy: {
        createdAt: 'desc', // Los más recientes primero
      },
    })
    return { success: true, data: contacts }
  } catch (error) {
    console.error("Error obteniendo contactos:", error)
    return { success: false, error: "No se pudieron cargar los contactos." }
  }
}

// 2. CREAR CONTACTO
export async function createContact(formData: FormData, tenantId: string, domain: string) {
  try {
    // Extraemos los datos del formulario
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const company = formData.get('company') as string
    const status = formData.get('status') as ContactStatus || ContactStatus.LEAD

    // Validación básica
    if (!firstName) {
      return { success: false, error: "El nombre es obligatorio." }
    }

    // Insertar en la Base de Datos
    const newContact = await prisma.contact.create({
      data: {
        firstName,
        lastName: lastName || null,
        email: email || null,
        phone: phone || null,
        company: company || null,
        status,
        tenantId,
      },
    })

    // Recargamos la caché de la página para que la tabla se actualice automáticamente
    revalidatePath(`/${domain}/admin/contactos`)

    return { success: true, data: newContact }
  } catch (error) {
    console.error("Error creando contacto:", error)
    return { success: false, error: "Ocurrió un error al guardar el contacto." }
  }
}