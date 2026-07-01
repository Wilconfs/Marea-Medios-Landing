// app/[domain]/admin/tareas/page.tsx
import { TasksView } from "../_components/tasks-view"
import { getTasks } from "../actions/tareas"
import { prisma } from "@/lib/db"

export default async function TareasPage({ params }: { params: { domain: string } }) {
  const tenant = await prisma.tenant.findUnique({
    where: { slug: params.domain },
    select: { id: true }
  })

  if (!tenant) return <div className="p-6 text-red-600 font-bold">Error: Empresa no encontrada</div>

  const response = await getTasks(tenant.id)
  const initialTasks = response.success && response.tasks ? response.tasks : []

  // NUEVO: Buscamos a los usuarios del equipo
  const teamMembers = await prisma.user.findMany({
    select: { id: true, name: true }
  })

  return (
    <TasksView 
      initialTasks={initialTasks} 
      teamMembers={teamMembers} // <--- Pasamos el equipo
      tenantId={tenant.id} 
      domain={params.domain} 
    />
  )
}