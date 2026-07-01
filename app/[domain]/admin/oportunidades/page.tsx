// Archivo: app/[domain]/admin/oportunidades/page.tsx
import { OpportunitiesView } from "../_components/opportunities-view"
import { getDeals } from "../actions/deals"
import { getContacts } from "../actions/contacts"
import { prisma } from "@/lib/db"

export default async function OportunidadesPage({ params }: { params: { domain: string } }) {
  const tenant = await prisma.tenant.findUnique({
    where: { slug: params.domain },
    select: { id: true }
  })

  if (!tenant) {
    return <div className="p-6 text-red-600 font-bold">Error: Empresa no encontrada</div>
  }

  // Ejecutamos ambas consultas en paralelo para que cargue más rápido
  const [dealsResponse, contactsResponse] = await Promise.all([
    getDeals(tenant.id),
    getContacts(tenant.id)
  ])

  // Aseguramos arreglos vacíos si algo falla (para evitar errores de TypeScript)
  const initialDeals = dealsResponse.data || []
  const contacts = contactsResponse.data || []

  return (
    <OpportunitiesView 
      initialDeals={initialDeals} 
      contacts={contacts}
      tenantId={tenant.id} 
      domain={params.domain} 
    />
  )
}