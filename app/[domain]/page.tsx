import { prisma } from '@/lib/db'
import { HeroBanner } from '@/components/hero-banner'
import { CategoryRow } from '@/components/category-row'
import { FlashSaleSection } from '@/components/flash-sale-section'
import { ProductCard } from '@/components/product-card'
import { Sparkles } from 'lucide-react'
import { notFound } from 'next/navigation'
import { WhatsappButton } from '@/components/whatsapp-button'
import { ShieldCheck, RefreshCw, MessageCircle } from 'lucide-react'

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
   */
  const tenant = await prisma.tenant.findUnique({
    where: { slug: params.domain }
  })

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
   */
  const where: any = { 
    isActive: true,
    tenantId: tenantId 
  }

  if (categoryFilter) {
    where.category = { slug: categoryFilter }
  }
  
  if (searchFilter) {
    where.OR = [
      { name: { contains: searchFilter } },
      { description: { contains: searchFilter } }
    ]
  }
  
  if (flashFilter) {
    where.isFlashSale = true
  }

  const showFlashSection = !categoryFilter && !searchFilter && !flashFilter
  if (showFlashSection) {
    where.isFlashSale = false
  }

  // 4. CONSULTAS EN PARALELO
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
    <div className="min-h-screen bg-[#f9fafb] text-slate-900 antialiased selection:bg-slate-900 selection:text-white"> 
      
      {/* 1. SECCIÓN HERO: Banner Principal */}
      <div className="w-full bg-white border-b border-slate-200/80">
        <HeroBanner />
      </div>

      <div className="container-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 py-12">
        
        {/* 2. SECCIÓN CATEGORÍAS */}
        <section className="pt-4 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold tracking-widest text-indigo-600 uppercase">Catálogo</span>
              <h2 className="text-3xl font-black tracking-tight text-slate-900">
                Filtra por Categorías
              </h2>
            </div>
            <p className="text-slate-500 max-w-xs text-sm md:text-right">
              Navega en nuestras categorías seleccionadas cuidadosamente.
            </p>
          </div>
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm sticky top-[64px] z-30">
            <CategoryRow categories={categories} activeSlug={categoryFilter} />
          </div>
        </section>

        {/* 3. SECCIÓN DE OFERTAS: Diseño Asimétrico Premium */}
        {showFlashSection && flashProducts.length > 0 && (
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 sm:p-12 rounded-3xl text-white shadow-xl">
            <div className="absolute right-0 top-0 -mt-12 -mr-12 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
            <FlashSaleSection products={flashProducts as any} />
          </div>
        )}

        {/* 4. SECCIÓN DE PRODUCTOS */}
        <section id="productos" className="space-y-8">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                <h2 className="text-2xl font-black tracking-tight text-slate-900">Nuestros Productos</h2>
              </div>
              <p className="text-xs text-slate-400">Modelos exclusivos de {tenant.name}</p>
            </div>
            
            <div>
              <span className="bg-slate-900 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm">
                {products.length} Items
              </span>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="p-20 text-center bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
               <p className="text-slate-400 text-sm font-medium">No hay existencias en esta sección.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:gap-x-6">
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p as any} index={i} />
              ))}
            </div>
          )}
        </section>

        {/* 5. SECCIÓN BENEFICIOS: ¡Ahora con acentos de color en los iconos! */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Envíos Rápidos - Toques Azules */}
          <div className="flex flex-col items-center text-center p-8 bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:border-blue-200 transition-all group">
            <div className="bg-blue-50 p-4 rounded-full mb-4 group-hover:bg-blue-100 transition-colors">
              <ShieldCheck className="h-6 w-6 text-blue-600" />
            </div>
            <h4 className="font-bold text-slate-900 text-lg">Envíos Rápidos</h4>
            <p className="text-sm text-slate-500 mt-2 max-w-xs">Recibe tus compras en tiempo récord en tu dirección.</p>
          </div>

          {/* Pago Seguro - Toques Morados */}
          <div className="flex flex-col items-center text-center p-8 bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:border-purple-200 transition-all group">
            <div className="bg-purple-50 p-4 rounded-full mb-4 group-hover:bg-purple-100 transition-colors">
              <RefreshCw className="h-6 w-6 text-purple-600" />
            </div>
            <h4 className="font-bold text-slate-900 text-lg">Pago Seguro</h4>
            <p className="text-sm text-slate-500 mt-2 max-w-xs">Tus transacciones y datos están protegidos en todo momento.</p>
          </div>

          {/* Calidad Garantizada - Toques Esmeralda */}
          <div className="flex flex-col items-center text-center p-8 bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:border-emerald-200 transition-all group">
            <div className="bg-emerald-50 p-4 rounded-full mb-4 group-hover:bg-emerald-100 transition-colors">
              <MessageCircle className="h-6 w-6 text-emerald-600" />
            </div>
            <h4 className="font-bold text-slate-900 text-lg">Calidad Garantizada</h4>
            <p className="text-sm text-slate-500 mt-2 max-w-xs">Garantía total sobre defectos de fábrica y calidad.</p>
          </div>
        </section>

        {/* 6. NEWSLETTER: Nuevo degradado tecnológico e inmersivo */}
        <section className="rounded-2xl bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 p-8 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6 relative overflow-hidden">
          {/* Círculo decorativo de fondo */}
          <div className="absolute right-0 top-0 -mt-6 -mr-6 h-32 w-32 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          
          <div className="text-center lg:text-left space-y-1 relative z-10">
            <h3 className="text-xl font-extrabold tracking-tight">¡Únete a Marea!</h3>
            <p className="text-sm text-indigo-100/80">Recibe ofertas exclusivas y novedades en tu correo.</p>
          </div>
          <div className="flex flex-col sm:flex-row w-full lg:w-auto max-w-md gap-2 shrink-0 relative z-10">
            <input 
              type="email" 
              placeholder="Tu correo electrónico" 
              className="rounded-xl border-none bg-white/10 backdrop-blur-sm px-4 py-2.5 text-sm text-white placeholder-indigo-200 focus:ring-2 focus:ring-amber-400 w-full sm:w-64 focus:outline-none"
            />
            <button className="w-full sm:w-auto rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-bold text-slate-950 transition-colors hover:bg-amber-300 shadow-md">
              Suscribirme
            </button>
          </div>
        </section>

      </div>

      {/* Contenedor extra final para utilidades globales de página */}
      <div className="container-page space-y-16 py-10">
        <WhatsappButton /> 
      </div>

    </div>
  )
}