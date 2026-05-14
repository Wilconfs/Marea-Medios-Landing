import { prisma } from '@/lib/db'
import { HeroBanner } from '@/components/hero-banner'
import { CategoryRow } from '@/components/category-row'
import { FlashSaleSection } from '@/components/flash-sale-section'
import { ProductCard } from '@/components/product-card'
import { Sparkles } from 'lucide-react'
import { notFound } from 'next/navigation'

// Esto asegura que Next.js no guarde en caché la página y siempre consulte la BD
export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ domain: string }>
  searchParams: Promise<{ category?: string; search?: string; flashSale?: string }>
}

export default async function HomePage(props: PageProps) {
  // 1. Esperamos los parámetros (Obligatorio en Next.js 15)
  const params = await props.params;
  const searchParams = await props.searchParams;

  /**
   * 2. IDENTIFICACIÓN DEL TENANT
   * Aquí buscamos en la tabla 'Tenant' (o 'User' según tu schema)
   * que el campo 'slug' o 'domain' coincida con lo que viene en la URL.
   */
  const tenant = await prisma.tenant.findUnique({
    where: { slug: params.domain } // Asegúrate de que en tu BD 'tienda1.local' esté en la columna slug
  })

  // Si el dominio no existe en la BD de XAMPP, mostramos 404
  if (!tenant) {
    console.log(`❌ Error: No existe un tenant registrado con el dominio: ${params.domain}`);
    notFound();
  }

  const tenantId = tenant.id
  const categoryFilter = searchParams?.category
  const searchFilter = searchParams?.search
  const flashFilter = searchParams?.flashSale === 'true'

  /**
   * 3. CONSTRUCCIÓN DEL FILTRO (Seguridad Multi-tenant)
   * Es CRÍTICO que siempre incluyas 'tenantId' en el 'where' para que
   * una tienda nunca vea los productos de otra.
   */
  const where: any = { 
    isActive: true,
    tenantId: tenantId 
  }

  if (categoryFilter) {
    where.category = { slug: categoryFilter }
  }
  
  if (searchFilter) {
    where.name = { contains: searchFilter, mode: 'insensitive' }
  }
  
  if (flashFilter) {
    where.isFlashSale = true
  }

  // Lógica para no duplicar productos si estamos en la home principal
  const showFlashSection = !categoryFilter && !searchFilter && !flashFilter
  if (showFlashSection) {
    where.isFlashSale = false
  }

  // 4. CONSULTAS EN PARALELO (Más rápido)
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

  // >>> DEBUG: Revisa esto en la terminal de VS Code para confirmar la conexión <<<
  console.log("=== SISTEMA SAAS ACTIVO ===");
  console.log("Dominio en URL:", params.domain);
  console.log("Tienda encontrada:", tenant.name);
  console.log("Total Productos:", products.length);

  return (
    // CAMBIO: Fondo gris azulado muy suave para resaltar las cards blancas
    <div className="min-h-screen bg-[#f1f5f9]/50"> 
      <div className="container-page space-y-12 py-10">
        
        {/* Banner con sombra suave y bordes más redondeados */}
        <div className="rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/10 transition-all duration-500">
          <HeroBanner />
        </div>

        {/* Categorías con un contenedor más limpio */}
        <section className="relative z-10 -mt-6">
          <div className="rounded-2xl bg-white/80 backdrop-blur-md p-2 shadow-sm border border-white">
            <CategoryRow categories={categories} activeSlug={categoryFilter} />
          </div>
        </section>

        {/* Sección de Ofertas - Diseño tipo "Bento Box" */}
        {showFlashSection && flashProducts.length > 0 && (
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200/60 transition-hover hover:shadow-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">Ofertas Imperdibles</h3>
              <div className="h-1 flex-1 mx-4 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary w-1/3 animate-pulse" />
              </div>
            </div>
            <FlashSaleSection products={flashProducts as any} />
          </div>
        )}

        {/* Listado de Productos con cabecera premium */}
        <section id="productos" className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest">
                <Sparkles className="h-4 w-4" />
                <span>Novedades</span>
              </div>
              <h2 className="text-3xl font-black text-slate-900">
                Explora la Colección
              </h2>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
              <span>{products.length} productos encontrados</span>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-inner">
               <div className="bg-slate-50 p-4 rounded-full mb-4">
                 <Sparkles className="h-10 w-10 text-slate-300" />
               </div>
               <p className="text-slate-500 font-bold text-xl text-center">No encontramos lo que buscas</p>
               <p className="text-sm text-slate-400 mt-2">Intenta con otra categoría o término de búsqueda.</p>
            </div>
          ) : (
            // Aumento de gap para que las imágenes respiren
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 lg:grid-cols-5 xl:gap-8">
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p as any} index={i} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}