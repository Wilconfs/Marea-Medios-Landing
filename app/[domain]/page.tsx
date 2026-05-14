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
    <div className="min-h-screen bg-[#f9fafb]"> {/* Fondo gris muy suave para dar contraste */}
      <div className="container-page space-y-16 py-10">
        
        {/* 1. SECCIÓN HERO: Banner Principal */}
        <section className="rounded-3xl overflow-hidden shadow-xl shadow-blue-900/5">
          <HeroBanner />
        </section>

        {/* 2. SECCIÓN CATEGORÍAS: Ahora con Título y Contexto */}
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

        {/* 3. SECCIÓN DE OFERTAS: (Si existe) */}
        {showFlashSection && flashProducts.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-3xl border border-blue-100">
            <FlashSaleSection products={flashProducts as any} />
          </div>
        )}

        {/* 4. SECCIÓN DE PRODUCTOS: Con jerarquía premium */}
        <section id="productos" className="space-y-8">
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
            
            {/* Badge de cantidad para llenar espacio visual */}
            <div className="hidden sm:block">
              <span className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-full text-sm font-semibold shadow-sm">
                {products.length} Artículos disponibles
              </span>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="p-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
               <p className="text-slate-400 font-medium">No se encontraron productos en esta categoría.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 lg:grid-cols-5 xl:gap-8">
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p as any} index={i} />
              ))}
            </div>
          )}
        </section>

        {/* 5. SECCIÓN EXTRA: Banner de confianza (FOOTER VISUAL) */}

{/* SECCIÓN DE BENEFICIOS AJUSTADA */}
<section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-slate-100">
  
  {/* Envíos Rápidos */}
  <div className="flex flex-col items-center p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all text-center">
    <div className="bg-blue-50 p-3 rounded-2xl mb-4">
      <ShieldCheck className="h-8 w-8 text-blue-600" />
    </div>
    <h4 className="font-bold text-slate-800 text-lg">Envíos Rápidos</h4>
    <p className="text-sm text-slate-500 mt-2">Recibe tus compras en tiempo récord.</p>
  </div>

  {/* Pago Seguro */}
  <div className="flex flex-col items-center p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all text-center">
    <div className="bg-purple-50 p-3 rounded-2xl mb-4">
      <RefreshCw className="h-8 w-8 text-purple-600" />
    </div>
    <h4 className="font-bold text-slate-800 text-lg">Pago Seguro</h4>
    <p className="text-sm text-slate-500 mt-2">Tus transacciones están protegidas.</p>
  </div>

  {/* Calidad Garantizada */}
  <div className="flex flex-col items-center p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all text-center">
    <div className="bg-green-50 p-3 rounded-2xl mb-4">
      <MessageCircle className="h-8 w-8 text-green-600" />
    </div>
    <h4 className="font-bold text-slate-800 text-lg">Calidad Garantizada</h4>
    <p className="text-sm text-slate-500 mt-2">Productos seleccionados cuidadosamente.</p>
  </div>
</section>
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
              <div className="container-page space-y-16 py-10">
            {/* ... tus otras secciones ... */}
            <WhatsappButton /> 
          </div>
            </div>
          )
}