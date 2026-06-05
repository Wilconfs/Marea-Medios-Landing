import { prisma } from '@/lib/db'
import { ProductCard } from '@/components/product-card'
import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { SortSelect } from '@/components/sort-select'
import { FilterSidebar } from '@/components/filter-sidebar'
import { Pagination } from '@/components/pagination'

export default async function CategoryPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ domain: string; slug: string }>
  searchParams: Promise<{ page?: string; minPrice?: string; maxPrice?: string; sort?: string}>
}) {
  const { slug } = await params;
  const { page = "1", minPrice, maxPrice } = await searchParams;
  const { sort } = await searchParams;

  // Definimos el orden basado en el parámetro
  const orderBy: any = {
    'price-asc': { price: 'asc' },
    'price-desc': { price: 'desc' },
    'name-asc': { name: 'asc' },
  }[sort || ''] || { createdAt: 'desc' };

  const currentPage = parseInt(page);
  const pageSize = 12; // Productos por página

  

  const category = await prisma.category.findUnique({
    where: { slug: slug },
    include: {
      products: {
        where: {
          isActive: true,
          price: {
            gte: minPrice ? parseFloat(minPrice) : 0,
            lte: maxPrice ? parseFloat(maxPrice) : 100000000,
          }
        },
        skip: (currentPage - 1) * pageSize,
        take: pageSize,
        orderBy: orderBy
      }
    }
  });


  if (!category) notFound();

    const totalProducts = await prisma.product.count({
    where: { categoryId: category.id, isActive: true /* + tus otros filtros */ }
        });

    const totalPages = Math.ceil(totalProducts / pageSize);

  return (
  <div className="container mx-auto px-4 py-8">
    {/* Breadcrumbs: Navegación jerárquica */}
    <Breadcrumbs items={[{ label: category.name, href: `/category/${category.slug}` }]} />

    {/* HEADER: Título y Ordenador perfectamente alineados */}
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-slate-100 pb-6">
      <div>
        <h1 className="text-4xl font-black text-slate-950">{category.name}</h1>
        <p className="text-slate-500 mt-1 text-sm">
          {category.products.length} productos encontrados en esta categoría
        </p>
      </div>
      
      {/* Selector de ordenamiento alineado a la derecha */}
      <div className="flex items-center">
        <SortSelect />
      </div>
    </div>

    {/* CUERPO: Sidebar y Grid */}
    <div className="flex flex-col md:flex-row gap-8">
      
      {/* SIDEBAR DE FILTROS */}
      <aside className="w-full md:w-64 shrink-0 space-y-6">
        <FilterSidebar />
      </aside>

      {/* GRID DE PRODUCTOS */}
      <div className="flex-1">
        {category.products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {category.products.map((p, i) => (
              <ProductCard key={p.id} product={p as any} index={i} />
            ))}
          </div>
        ) : (
          /* ESTADO VACÍO PROFESIONAL */
          <div className="flex flex-col items-center justify-center h-80 text-center border border-slate-100 bg-slate-50/50 rounded-3xl p-8">
            <div className="bg-white p-4 rounded-full shadow-sm mb-4 border border-slate-100">
              <span className="text-4xl">🔍</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">No hay productos disponibles</h3>
            <p className="text-slate-500 text-sm mt-2 max-w-sm">
              No encontramos artículos con los filtros seleccionados. Intenta ajustar el rango de precios o explora otras categorías.
            </p>
            <a 
              href={`/category/${category.slug}`} 
              className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-indigo-600 transition-colors"
            >
              Limpiar filtros
            </a>
          </div>
        )}
      </div>
    </div>

    {/* PAGINACIÓN: Centrada */}
        {category.products.length > 0 && (
    <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
    />
    )}
  </div>
)
}

import { Metadata } from 'next'

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params;
  
  // Aquí obtenemos el nombre de la categoría para el título
  const category = await prisma.category.findUnique({
    where: { slug: slug },
    select: { name: true }
  });

  return {
    title: category ? `${category.name} | Tienda Marea` : "Categoría no encontrada",
    description: `Explora nuestra colección de ${category?.name}. Compra productos de alta calidad al mejor precio.`,
  }
}