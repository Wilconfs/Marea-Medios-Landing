// Archivo: app/[domain]/admin/contactos/page.tsx
import { ContactsView } from "../_components/contacts-view"
import { getContacts } from "../actions/contacts"
import { prisma } from "@/lib/db"

export default async function ContactosPage({ params }: { params: { domain: string } }) {
  // 1. Obtener el tenantId usando el domain (slug)
  const tenant = await prisma.tenant.findUnique({
    where: { slug: params.domain },
    select: { id: true }
  })

  // Si no existe el tenant, mostramos un mensaje de error
  if (!tenant) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-600">Error: Empresa no encontrada</h1>
        <p>No se pudo encontrar el entorno para el dominio: {params.domain}</p>
      </div>
    )
  }

  // 2. Ejecutar la Server Action para obtener los contactos
  const response = await getContacts(tenant.id)
  
  // 3. Extraer los datos (o un array vacío si falla)
  const initialContacts = response.data ?? []

  // 4. Pasar los datos reales como props a la Vista
  return (
    <ContactsView 
      initialContacts={initialContacts} 
      tenantId={tenant.id} 
      domain={params.domain} 
    />
  )
}