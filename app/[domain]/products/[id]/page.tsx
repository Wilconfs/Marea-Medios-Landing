import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { prisma } from '@/lib/db'
import { ProductDetail } from './_components/product-detail'
import { ProductCard } from '@/components/product-card'

export const dynamic = 'force-dynamic'

export default async function ProductPage({
  params,
}: {
  params: { id: string }
}) {
  // Identificamos la tienda actual
  const headerList = await headers()
  const host = headerList.get('host') || ''
  const domain = host.split(':')[0]

  const tenant = await prisma.tenant.findUnique({
    where: { slug: domain }
  })

  // Buscamos el producto asegurándonos que pertenezca a esta tienda
  const product = await prisma.product.findFirst({
    where: { 
      id: params?.id,
      tenantId: tenant?.id // Seguridad Multi-tenant
    },
    include: { category: true },
  })

  if (!product) notFound()

  // Recomendados del mismo tenant y categoría
  const related = await prisma.product.findMany({
    where: {
      isActive: true,
      tenantId: tenant?.id,
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    take: 4,
    orderBy: { soldCount: 'desc' },
  })

  return (
    <div className="container-page space-y-8 py-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary">Inicio</Link>
        <ChevronRight className="h-4 w-4" />
        <Link
          href={`/category/${product.category?.slug ?? ''}`} // CAMBIA ESTO
          className="hover:text-primary"
        >
          {product.category?.name ?? ''}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="truncate text-foreground font-medium">{product.name}</span>
      </nav>

      {/* Componente de detalle con galería */}
      <ProductDetail product={product as any} />

      {/* Sección de relacionados */}
      {related.length > 0 && (
        <section className="space-y-6 pt-10 border-t">
          <h2 className="font-display text-2xl font-bold tracking-tight">
            También te puede gustar
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p as any} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}