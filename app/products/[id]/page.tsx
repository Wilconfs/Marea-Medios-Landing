import { notFound } from 'next/navigation'
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
  const product = await prisma.product.findUnique({
    where: { id: params?.id },
    include: { category: true },
  })
  if (!product) notFound()

  const related = await prisma.product.findMany({
    where: {
      isActive: true,
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    take: 4,
    orderBy: { soldCount: 'desc' },
  })

  return (
    <div className="container-page space-y-8 py-6">
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary">
          Inicio
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link
          href={`/?category=${product.category?.slug ?? ''}`}
          className="hover:text-primary"
        >
          {product.category?.name ?? ''}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="truncate text-foreground">{product.name}</span>
      </nav>

      <ProductDetail product={product as any} />

      {related.length > 0 && (
        <section className="space-y-4">
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
