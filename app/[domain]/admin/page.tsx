import { DashboardView } from "./_components/dashboard-view"
import { getDashboardStats } from "./actions/dashboard"
import { prisma } from "@/lib/db"

export default async function AdminDashboardPage({ params }: { params: { domain: string } }) {
  // 1. Buscamos el tenant (agencia) basado en la URL
  const tenant = await prisma.tenant.findUnique({
    where: { slug: params.domain },
    select: { id: true }
  })

  if (!tenant) {
    return <div className="p-6 text-red-600 font-bold">Error: Empresa no encontrada</div>
  }

  // 2. Traemos las estadísticas usando la Server Action
  const response = await getDashboardStats(tenant.id)
  
  // 3. Extraemos la data o usamos los ceros por defecto si algo falla
  const stats = response.success && response.data ? response.data : {
    contactsCount: 0, 
    dealsCount: 0, 
    tasksCount: 0, 
    pipelineValue: 0, 
    recentDeals: [],
    recentTasks: [], // <--- ¡AQUÍ ESTABA EL PROBLEMA!
    pipelineByStage: []
  }

  // 4. Le pasamos los stats reales a la vista
  return (
    <DashboardView stats={stats} />
  )
}