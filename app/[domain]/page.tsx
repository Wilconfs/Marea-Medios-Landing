import { prisma } from '@/lib/db'
import { HeroBanner } from '@/components/hero-banner'
import { CategoryRow } from '@/components/category-row'
import { FlashSaleSection } from '@/components/flash-sale-section'
import { ProductCard } from '@/components/product-card'
import { Sparkles } from 'lucide-react'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ domain: string }> // Ajustado para compatibilidad con Next.js 15
  searchParams: Promise<{ category?: string; search?: string; flashSale?: string }>
}

export default async function HomePage(props: PageProps) {
  // 1. Esperamos los parámetros
  const params = await props.params;
  const searchParams = await props.searchParams;

  // 2. Identificamos al Cliente (Tenant) por el subdominio
  const tenant = await prisma.tenant.findUnique({
    where: { slug: params.domain }
  })

  // Si no existe el tenant en la BD, lanzamos 404
  if (!tenant) {
    console.log(`❌ Tenant no encontrado para el slug: ${params.domain}`);
    notFound();
  }

  const tenantId = tenant.id
  const categoryFilter = searchParams?.category
  const searchFilter = searchParams?.search
  const flashFilter = searchParams?.flashSale === 'true'

  // 3. Filtramos las consultas por tenantId
  const where: any = { 
    isActive: true,
    tenantId: tenantId 
  }

  if (categoryFilter) where.category = { slug: categoryFilter }
  if (searchFilter)
    where.name = { contains: searchFilter, mode: 'insensitive' }
  if (flashFilter) where.isFlashSale = true

  const showFlashSection = !categoryFilter && !searchFilter && !flashFilter
  if (showFlashSection) where.isFlashSale = false

  // 4. Consultas a la base de datos
  const [categories, products, flashProducts] = await Promise.all([
    prisma.category.findMany({ 
      where: { tenantId: tenantId }, 
      orderBy: { name: 'asc' } 
    }),
    prisma.product.findMany({
      where,
      orderBy: { soldCount: 'desc' },
      include: { category: true },
    }),
    prisma.product.findMany({
      where: { 
        isActive: true, 
        isFlashSale: true, 
        tenantId: tenantId 
      },
      take: 8,
      orderBy: { discount: 'desc' },
    }),
  ])

  // >>> DEBUG: Revisa esto en la terminal de VS Code <<<
  console.log("=== DEBUG TIENDA ===");
  console.log("Subdominio detectado:", params.domain);
  console.log("Tenant ID encontrado:", tenantId);
  console.log("Productos encontrados:", products.length);
  console.log("Categorías encontradas:", categories.length);

  // 5. Renderizado (Asegúrate de incluir el return con tu HTML)
  return (
    <div className="container-page space-y-8 py-6">
      <HeroBanner />
      <CategoryRow categories={categories} activeSlug={categoryFilter} />

      {showFlashSection && flashProducts.length > 0 && (
        <FlashSaleSection products={flashProducts as any} />
      )}

      <section id="productos" className="space-y-5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">Productos</h2>
        </div>

        {products.length === 0 ? (
          <div className="p-10 text-center bg-gray-50 rounded-lg">
             <p>No hay productos vinculados a esta tienda.</p>
             {/* <p className="text-xs text-muted-foreground">ID buscado: {tenantId}</p> */}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p as any} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}