import { prisma } from '@/lib/db'
import { HeroBanner } from '@/components/hero-banner'
import { CategoryRow } from '@/components/category-row'
import { FlashSaleSection } from '@/components/flash-sale-section'
import { ProductCard } from '@/components/product-card'
import { Sparkles, ShieldCheck, RefreshCw, MessageCircle } from 'lucide-react'
import { notFound } from 'next/navigation'
import { WhatsappButton } from '@/components/whatsapp-button'

// Asegura que Next.js consulte siempre la base de datos en producción sin guardar caché obsoleto
export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ domain: string }>
  searchParams: Promise<{ category?: string; search?: string; flashSale?: string }>
}

export default async function HomePage(props: PageProps) {
  // 1. Esperamos los parámetros (Requisito obligatorio de Next.js 15)
  const params = await props.params;
  const searchParams = await props.searchParams;

  /**
   * 2. IDENTIFICACIÓN MULTI-TENANT
   * Buscamos que la tienda corresponda con el slug del subdominio de la URL
   */
  const tenant = await prisma.tenant.findUnique({
    where: { slug: params.domain }
  })

  // Si no existe la tienda en producción, mandamos un 404 limpio
  if (!tenant) {
    console.log(`❌ Error: No existe un tenant registrado con el dominio: ${params.domain}`);
    notFound();
  }

  const tenantId = tenant.id
  const categoryFilter = searchParams?.category
  const searchFilter = searchParams?.search
  const flashFilter = searchParams?.flashSale === 'true'

  /**
   * 3. CONSTRUCCIÓN DE FILTROS SEGUROS
   * Siempre filtramos por tenantId para evitar cruce de datos entre tiendas virtuales
   */
  const where: any = { 
    isActive: true,
    tenantId: tenantId 
  }

  if (categoryFilter) {
    where.category = { slug: categoryFilter }
  }
  
  if (flashFilter) {
    where.isFlashSale = true
  }

  // Lógica para que el buscador de texto en MySQL filtre de forma reactiva
  if (searchFilter) {
    where.OR = [
      { name: { contains: searchFilter } },
      { description: { contains: searchFilter } }
    ]
  }

  // Evitamos duplicar los productos si están viendo la página de inicio limpia
  const showFlashSection = !categoryFilter && !searchFilter && !flashFilter
  if (showFlashSection) {
    where.isFlashSale = false
  }

  // 4. CONSULTAS SIMULTÁNEAS EN MYSQL (Optimiza el tiempo de carga en producción)
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

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <div className="container-page space-y-16 py-10">
        
        {/* Banner Principal */}
        <div className="w-full">
          <HeroBanner />
        </div>

        {/* Listado de Categorías */}
        <section className="space-y-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Explora por Categorías
            </h2>
            <p className="text-slate-500 max-w-md">
              Encuentra exactamente lo que necesitas navegando en nuestras colecciones especializadas.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <CategoryRow categories={categories} activeSlug={categoryFilter} />
          </div>
        </section>

        {/* Sección de Ofertas Flash */}
        {showFlashSection && flashProducts.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-3xl border border-blue-100">
            <FlashSaleSection products={flashProducts as any} />
          </div>
        )}

        {/* Cuadrícula de Productos Principal */}
        <section id="productos" className="space-y-8 scroll-mt-20">
          <div className="flex items-center justify-between border-b border-slate-200 pb-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-xl">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Nuestros Productos</h2>
                <p className="text-sm text-slate-500">Selección exclusiva de {tenant.name}</p>
              </div>
            </div>
            
            <div className="hidden sm:block">
              <span className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-full text-sm font-semibold shadow-sm">
                {products.length} Artículos disponibles
              </span>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="p-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
               <p className="text-slate-400 font-medium">No se encontraron productos en este momento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 lg:grid-cols-5 xl:gap-8">
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p as any} index={i} />
              ))}
            </div>
          )}
        </section>

        {/* Bloque de Beneficios / Footer de Confianza */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-slate-100">
          <div className="flex flex-col items-center p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all text-center">
            <div className="bg-blue-50 p-3 rounded-2xl mb-4">
              <ShieldCheck className="h-8 w-8 text-blue-600" />
            </div>
            <h4 className="font-bold text-slate-800 text-lg">Envíos Rápidos</h4>
            <p className="text-sm text-slate-500 mt-2">Recibe tus compras en tiempo récord.</p>
          </div>

          <div className="flex flex-col items-center p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all text-center">
            <div className="bg-purple-50 p-3 rounded-2xl mb-4">
              <RefreshCw className="h-8 w-8 text-purple-600" />
            </div>
            <h4 className="font-bold text-slate-800 text-lg">Pago Seguro</h4>
            <p className="text-sm text-slate-500 mt-2">Tus transacciones están protegidas.</p>
          </div>

          <div className="flex flex-col items-center p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all text-center">
            <div className="bg-green-50 p-3 rounded-2xl mb-4">
              <MessageCircle className="h-8 w-8 text-green-600" />
            </div>
            <h4 className="font-bold text-slate-800 text-lg">Calidad Garantizada</h4>
            <p className="text-sm text-slate-500 mt-2">Productos seleccionados cuidadosamente.</p>
          </div>
        </section>

        {/* Newsletter */}
        <section className="rounded-3xl bg-primary p-10 text-center text-white shadow-xl">
          <h3 className="text-2xl font-bold">¡Únete a nuestra comunidad!</h3>
          <p className="mt-2 text-blue-100">Recibe ofertas exclusivas y novedades antes que nadie.</p>
          <div className="mx-auto mt-6 flex max-w-md gap-2">
            <input 
              type="email" 
              placeholder="Tu correo electrónico" 
              className="flex-1 rounded-xl border-none px-4 py-3 text-slate-900 focus:ring-2 focus:ring-accent"
            />
            <button className="rounded-xl bg-slate-900 px-6 py-3 font-bold transition-colors hover:bg-slate-800">
              Suscribirme
            </button>
          </div>
        </section>
        
      </div>
      
      {/* Botón Flotante Corporativo */}
      <WhatsappButton />
    </div>
  )
}