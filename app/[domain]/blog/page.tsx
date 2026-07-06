import { prisma } from '@/lib/db' 
import { BlogGrid } from './_components/blog-grid'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic' 
export const metadata = {
  title: 'Blog | Marea Medios',
  description: 'Estrategias, tendencias y contenido de valor para llevar tu marca al siguiente nivel.',
}

// ⚡ Agregamos searchParams para leer la URL (?categoria=slug)
export default async function PublicBlogPage({ searchParams }: { searchParams: Promise<{ categoria?: string }> }) {
  // Resolvemos los parámetros de la URL
  const resolvedParams = await searchParams;
  const currentCategory = resolvedParams.categoria;

  // 1. Buscamos todas las categorías que tengan al menos 1 artículo publicado (para los botones)
  const categories = await prisma.category.findMany({
    where: {
      blogPosts: { some: { status: 'PUBLISHED' } }
    },
    orderBy: { name: 'asc' }
  });

  // 2. Construimos el filtro: Si hay categoría en la URL, filtramos. Si no, traemos todos.
  const whereClause: any = { status: 'PUBLISHED' };
  if (currentCategory) {
    whereClause.category = { slug: currentCategory };
  }

  // 3. Consultamos la base de datos usando el filtro dinámico
  const posts = await prisma.blogPost.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      content: true,
      coverImage: true,
      createdAt: true,
      category: { 
        select: { name: true, slug: true } 
      }
    }
  })

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-opensans selection:bg-[#ffde59] selection:text-black">
      
      {/* Header minimalista (Intacto) */}
      <header className="px-6 py-6 md:px-12 border-b border-white/10 flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#0a0a0a] sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-3 group">
          <img src="/images/logo-marea-medios_25772d23.png" alt="Marea Medios" className="w-8 h-8 object-contain invert transition-transform group-hover:scale-110" />
          <div className="flex flex-col leading-none">
            <span className="text-white text-xl tracking-wider font-anton uppercase">MAREA</span>
            <span className="text-[#ffde59] text-xs font-bold tracking-[0.25em] uppercase">MEDIOS</span>
          </div>
        </Link>
        <Link href="/" className="text-[#ffde59] hover:text-white transition-colors flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
          <ArrowLeft size={16} /> Volver a la agencia
        </Link>
      </header>

      {/* Contenido Principal */}
      <main className="flex-grow max-w-7xl mx-auto px-6 lg:px-8 py-16 md:py-24 w-full">
        <div className="mb-12 text-center md:text-left">
          <span className="text-[#ffde59] text-xs font-bold uppercase tracking-[0.3em] block mb-4">
            Contenido de Valor
          </span>
          <h1 className="font-anton text-5xl sm:text-7xl uppercase text-white mb-6 leading-none">
            NUESTRO <span className="text-[#ffde59]">BLOG</span>
          </h1>
          <p className="text-white/50 max-w-2xl text-lg leading-relaxed mx-auto md:mx-0 font-opensans">
            Estrategias, tendencias y contenido de valor para llevar tu marca al siguiente nivel. Lee nuestros últimos artículos y mantente a la vanguardia digital.
          </p>
        </div>

        {/* 👇 NUEVA BOTONERA DE FILTROS DE CATEGORÍAS */}
        <div className="flex flex-wrap gap-3 mb-12 pb-6 border-b border-white/10">
          {/* Botón "Todos" */}
          <Link 
            href="/blog"
            className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
              !currentCategory 
                ? 'bg-[#ffde59] text-black' 
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            Todos
          </Link>

          {/* Botones Dinámicos generados desde la BD */}
          {categories.map(cat => (
            <Link 
              key={cat.id}
              href={`/blog?categoria=${cat.slug}`}
              className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                currentCategory === cat.slug 
                  ? 'bg-[#ffde59] text-black' 
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Le pasamos los datos filtrados extraídos de la BD al componente cliente */}
        <BlogGrid posts={posts as any} />
      </main>
      
    </div>
  )
}