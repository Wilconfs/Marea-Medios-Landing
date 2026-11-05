import { prisma } from '@/lib/db' 
import { BlogGrid } from './_components/blog-grid'
import Link from 'next/link'
import { ArrowLeft, Instagram, Facebook, Twitter, Linkedin, ChevronRight } from 'lucide-react'

export const dynamic = 'force-dynamic' 
export const metadata = {
  title: 'Blog | Marea Medios',
  description: 'Estrategias, tendencias y contenido de valor para llevar tu marca al siguiente nivel.',
}

export default async function PublicBlogPage({ searchParams }: { searchParams: Promise<{ categoria?: string }> }) {
  const resolvedParams = await searchParams;
  const currentCategory = resolvedParams.categoria;

  const categories = await prisma.category.findMany({
    where: {
      blogPosts: { some: { status: 'PUBLISHED' } }
    },
    orderBy: { name: 'asc' }
  });

  const whereClause: any = { status: 'PUBLISHED' };
  if (currentCategory) {
    whereClause.category = { slug: currentCategory };
  }

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
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-[#ffde59] selection:text-black">
      
      {/* ─── NAVBAR ALINEADO CON LA LANDING ─── */}
      <header className="px-6 py-6 md:px-12 border-b border-white/5 flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#08080a]/95 backdrop-blur-md sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-3 group">
          <img 
            src="/images/logo-marea-medios_25772d23.png" 
            alt="Marea Medios" 
            className="w-8 h-8 object-contain invert transition-transform group-hover:scale-110" 
          />
          <div className="flex flex-col leading-none">
            <span className="text-white text-xl tracking-wider font-black font-sans uppercase">MAREA</span>
            <span className="text-[#ffde59] text-xs font-bold tracking-[0.25em] uppercase">MEDIOS</span>
          </div>
        </Link>
        <Link href="/" className="text-zinc-400 hover:text-[#ffde59] transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
          <ArrowLeft size={16} /> Volver a la agencia
        </Link>
      </header>

      {/* ─── CONTENIDO PRINCIPAL ─── */}
      <main className="flex-grow w-full relative">
        {/* Glow de fondo */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-16 pb-20 relative z-10">
          
          {/* Título Principal */}
          <div className="mb-12 border-b border-white/10 pb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-[2px] bg-[#ffde59]" />
              <span className="text-xs font-mono font-bold tracking-widest text-[#ffde59] uppercase">CONTENIDO DE VALOR</span>
            </div>
            <h1 className="font-display text-4xl sm:text-6xl font-black uppercase tracking-tight leading-[0.92] text-white">
              NUESTRO <span className="text-[#ffde59]">BLOG</span>
            </h1>
          </div>

          {/* ─── LAYOUT DE REVISTA (2 COLUMNAS) ─── */}
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            
            {/* COLUMNA IZQUIERDA: Grid de Artículos (75%) */}
            <div className="w-full lg:w-2/3 xl:w-3/4">
              <BlogGrid posts={posts as any} />
            </div>

            {/* COLUMNA DERECHA: Sidebar (25%) */}
            <aside className="w-full lg:w-1/3 xl:w-1/4 sticky top-32 flex flex-col gap-12">
              
              {/* 1. Redes Sociales */}
              <div>
                <h3 className="font-display text-lg font-black uppercase mb-4 text-white border-b border-white/10 pb-3">
                  Síguenos
                </h3>
                <div className="flex gap-3">
                  <a href="#" className="w-10 h-10 border border-white/10 bg-zinc-900/50 flex items-center justify-center text-zinc-400 hover:text-black hover:bg-[#ffde59] hover:border-[#ffde59] transition-all rounded-md">
                    <Twitter size={18} />
                  </a>
                  <a href="#" className="w-10 h-10 border border-white/10 bg-zinc-900/50 flex items-center justify-center text-zinc-400 hover:text-black hover:bg-[#ffde59] hover:border-[#ffde59] transition-all rounded-md">
                    <Instagram size={18} />
                  </a>
                  <a href="#" className="w-10 h-10 border border-white/10 bg-zinc-900/50 flex items-center justify-center text-zinc-400 hover:text-black hover:bg-[#ffde59] hover:border-[#ffde59] transition-all rounded-md">
                    <Facebook size={18} />
                  </a>
                  <a href="#" className="w-10 h-10 border border-white/10 bg-zinc-900/50 flex items-center justify-center text-zinc-400 hover:text-black hover:bg-[#ffde59] hover:border-[#ffde59] transition-all rounded-md">
                    <Linkedin size={18} />
                  </a>
                </div>
              </div>

              {/* 2. Banner Promocional */}
              <div className="bg-gradient-to-br from-zinc-900 to-black border border-white/10 p-6 rounded-xl relative overflow-hidden group">
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-yellow-500/10 blur-[30px] rounded-full pointer-events-none group-hover:bg-yellow-500/20 transition-all" />
                <div className="relative z-10">
                  <h4 className="font-display text-2xl font-black uppercase text-white mb-2 leading-tight">
                    Haz crecer <br/> tu <span className="text-[#ffde59]">Marca</span>
                  </h4>
                  <p className="text-zinc-400 text-xs mb-6 leading-relaxed">
                    Agenda una asesoría estratégica con nosotros y lleva tu contenido al siguiente nivel.
                  </p>
                  <Link href="/#planes" className="inline-block px-6 py-3 bg-transparent border border-[#ffde59] text-[#ffde59] hover:bg-[#ffde59] hover:text-black text-[10px] font-extrabold uppercase tracking-widest transition-all rounded-md">
                    Ver Planes
                  </Link>
                </div>
              </div>

              {/* 3. Categorías (Menú Vertical) */}
              <div>
                <h3 className="font-display text-lg font-black uppercase mb-4 text-white border-b border-white/10 pb-3">
                  Categorías
                </h3>
                <ul className="flex flex-col">
                  <li>
                    <Link 
                      href="/blog" 
                      className={`flex items-center justify-between py-3 border-b border-white/5 text-[11px] uppercase tracking-widest font-extrabold transition-colors ${!currentCategory ? 'text-[#ffde59]' : 'text-zinc-400 hover:text-white'}`}
                    >
                      <span className="flex items-center gap-2">
                        <ChevronRight size={14} className={!currentCategory ? 'text-[#ffde59]' : 'text-zinc-600'} /> 
                        Todas
                      </span>
                    </Link>
                  </li>
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <Link 
                        href={`/blog?categoria=${cat.slug}`} 
                        className={`flex items-center justify-between py-3 border-b border-white/5 text-[11px] uppercase tracking-widest font-extrabold transition-colors ${currentCategory === cat.slug ? 'text-[#ffde59]' : 'text-zinc-400 hover:text-white'}`}
                      >
                        <span className="flex items-center gap-2">
                          <ChevronRight size={14} className={currentCategory === cat.slug ? 'text-[#ffde59]' : 'text-zinc-600'} /> 
                          {cat.name}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

            </aside>
          </div>

        </div>
      </main>
      
    </div>
  )
}