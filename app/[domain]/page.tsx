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
    where.OR = [
      { name: { contains: searchFilter } },
      { description: { contains: searchFilter } }
    ]
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
    <div className="min-h-screen bg-[#f9fafb]"> {/* Fondo gris muy suave para dar contraste */}
      <div className="container-page">
        
        {/* 1. SECCIÓN HERO: Banner Principal */}
        <div className="w-full">
      <HeroBanner />
    </div>

{/* 2. SECCIÓN CATEGORÍAS: Fusión Minimalista con el fondo */}
        <section className="pt-12 md:pt-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div className="space-y-1">
              <span className="text-xs font-bold tracking-widest text-primary uppercase">Catálogo</span>
              <h2 className="text-3xl font-black tracking-tight text-slate-900">
                Filtra por Categorías
              </h2>
            </div>
            <p className="text-slate-500 max-w-xs text-sm md:text-right">
              Navega en nuestras categorías seleccionadas cuidadosamente.
            </p>
          </div>
          
          {/* Quitamos la tarjeta blanca de fondo y dejamos las categorías flotando limpias */}
          <div className="py-2 border-y border-slate-200/60 backdrop-blur-sm sticky top-[64px] z-30 bg-slate-50/80">
            <CategoryRow categories={categories} activeSlug={categoryFilter} />
          </div>
        </section>

        {/* 3. SECCIÓN DE OFERTAS: Diseño Asimétrico tipo Banner */}
        {showFlashSection && flashProducts.length > 0 && (
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 sm:p-12 rounded-3xl text-white shadow-lg my-6">
            <div className="absolute right-0 top-0 -mt-12 -mr-12 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
            <FlashSaleSection products={flashProducts as any} />
          </div>
        )}

        {/* 4. SECCIÓN DE PRODUCTOS: Grid Limpio y Contemporáneo */}
        <section id="productos" className="space-y-8 pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-black tracking-tight text-slate-900">Nuestros Productos</h2>
              <p className="text-xs text-slate-400">Modelos exclusivos de {tenant.name}</p>
            </div>
            
            <div>
              <span className="bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider">
                {products.length} Items
              </span>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="p-16 text-center bg-slate-100/50 rounded-2xl border border-dashed border-slate-200">
               <p className="text-slate-400 text-sm font-medium">No hay existencias en esta sección.</p>
            </div>
          ) : (
            /* Subimos el gap visual del Grid para darle aire premium al diseño */
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p as any} index={i} />
              ))}
            </div>
          )}
        </section>

        {/* 5. BENEFICIOS: Minimalista y Horizontal sin cajas individuales */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12 border-t border-slate-200/60 mt-12">
          <div className="flex gap-4 items-start">
            <div className="bg-slate-900 text-white p-3 rounded-2xl shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">Envíos Rápidos</h4>
              <p className="text-xs text-slate-500 mt-1">Recibe tus compras en tiempo récord en tu dirección.</p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="bg-slate-900 text-white p-3 rounded-2xl shrink-0">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">Pago Seguro</h4>
              <p className="text-xs text-slate-500 mt-1">Tus transacciones y datos están protegidos en todo momento.</p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="bg-slate-900 text-white p-3 rounded-2xl shrink-0">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">Calidad Garantizada</h4>
              <p className="text-xs text-slate-500 mt-1">Garantía total sobre defectos de fábrica y calidad.</p>
            </div>
          </div>
        </section>

        {/* 6. NEWSLETTER: Diseño Compacto Inline */}
        <section className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-center lg:text-left space-y-1">
            <h3 className="text-xl font-extrabold tracking-tight">¡Únete a Marea!</h3>
            <p className="text-sm text-slate-400">Recibe ofertas exclusivas y novedades en tu correo.</p>
          </div>
          <div className="flex flex-col sm:flex-row w-full lg:w-auto max-w-md gap-2 shrink-0">
            <input 
              type="email" 
              placeholder="Tu correo electrónico" 
              className="rounded-xl border-none bg-slate-800/80 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-primary w-full sm:w-64"
            />
            <button className="w-full sm:w-auto rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90">
              Suscribirme
            </button>
          </div>
        </section>
              </div>
              <div className="container-page space-y-16 py-10">
            {/* ... tus otras secciones ... */}
            <WhatsappButton /> 
          </div>
            </div>
          )
}