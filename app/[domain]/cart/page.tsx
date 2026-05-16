import { prisma } from '@/lib/db'
import { CartView } from './_components/cart-view'

export const dynamic = 'force-dynamic'

interface CartPageProps {
  params: Promise<{ domain: string }>
}

export default async function CartPage({ params }: CartPageProps) {
  // 1. Capturamos el subdominio/slug de la URL de manera asíncrona
  const resolvedParams = await params
  const domain = resolvedParams.domain

  // 2. Buscamos el Tenant en la base de datos usando ese slug
  const tenant = await prisma.tenant.findFirst({
    where: {
      slug: domain,
    },
  })

  // ID de respaldo por si estás probando localmente en la raíz o base limpia
  const currentTenantId = tenant?.id || 'cmouehzwk0000eo81fuyf0s37'

  // 3. Buscamos el número usando el índice compuesto único que te pide Prisma
  const setting = await prisma.setting.findUnique({
    where: {
      tenantId_key: {
        tenantId: currentTenantId,
        key: 'whatsappNumber',
      },
    },
  })

  // Si existe toma el valor de la BD, si no, usa el número quemado por defecto
  const whatsappNumber = setting?.value ?? '573001234567'

  return (
    <div className="container-page py-6">
      <CartView whatsappNumber={whatsappNumber} />
    </div>
  )
}