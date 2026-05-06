import { prisma } from '@/lib/db'
import { HeroBanner } from '@/components/hero-banner'
import { CategoryRow } from '@/components/category-row'
import { FlashSaleSection } from '@/components/flash-sale-section'
import { ProductCard } from '@/components/product-card'
import { Sparkles } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams?: { category?: string; search?: string; flashSale?: string }
}

export default async function HomePage({ searchParams }: PageProps) {
  const categoryFilter = searchParams?.category
  const searchFilter = searchParams?.search
  const flashFilter = searchParams?.flashSale === 'true'

  const where: any = { isActive: true }
  if (categoryFilter) where.category = { slug: categoryFilter }
  if (searchFilter)
    where.name = { contains: searchFilter, mode: 'insensitive' }
  if (flashFilter) where.isFlashSale = true

  // On the default home view, we promote flash-sale items in their own section,
  // so exclude them from the "all products" grid to avoid duplicates.
  const showFlashSection = !categoryFilter && !searchFilter && !flashFilter
  if (showFlashSection) where.isFlashSale = false

  const [categories, products, flashProducts] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.product.findMany({
      where,
      orderBy: { soldCount: 'desc' },
      include: { category: true },
    }),
    prisma.product.findMany({
      where: { isActive: true, isFlashSale: true },
      take: 4,
      orderBy: { discount: 'desc' },
    }),
  ])

  let heading = 'Todos los productos'
  let subheading = 'Descubre nuestra selección curada'
  if (categoryFilter) {
    const cat = categories.find((c) => c.slug === categoryFilter)
    heading = cat?.name ?? 'Categoría'
    subheading = `Productos en ${cat?.name ?? ''}`
  } else if (searchFilter) {
    heading = `Resultados para "${searchFilter}"`
    subheading = `${products.length} producto${products.length === 1 ? '' : 's'} encontrado${products.length === 1 ? '' : 's'}`
  } else if (flashFilter) {
    heading = 'Ofertas Flash'
    subheading = 'Descuentos por tiempo limitado'
  }

  return (
    <div className="container-page space-y-8 py-6">
      <HeroBanner />
      <CategoryRow categories={categories} activeSlug={categoryFilter} />

      {showFlashSection && flashProducts.length > 0 && (
        <FlashSaleSection products={flashProducts as any} />
      )}

      <section id="productos" className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="h-5 w-5" />
              </span>
              <h2 className="font-display text-2xl font-bold tracking-tight">
                {heading}
              </h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{subheading}</p>
          </div>
          <span className="text-sm text-muted-foreground">
            {products.length} producto{products.length === 1 ? '' : 's'}
          </span>
        </div>

        {products.length === 0 ? (
          <div className="rounded-lg bg-card p-10 text-center" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <p className="text-muted-foreground">
              No se encontraron productos. Prueba con otra búsqueda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p as any} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
