'use client'

import Link from 'next/link'

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  createdAt: Date;
  // 👇 Le decimos al componente que espere una categoría
  category?: { name: string } | null; 
}

export function BlogGrid({ posts }: { posts: BlogPost[] }) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(date))
  }

  if (posts.length === 0) {
    return (
      <div className="text-white/50 py-20 text-center text-lg font-opensans">
        Aún no hay artículos publicados. ¡Vuelve pronto!
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {posts.map((post) => (
        <Link 
          href={`/blog/${post.slug}`}
          key={post.id} 
          className="bg-[#121212] border border-white/10 rounded-xl overflow-hidden cursor-pointer hover:border-[#ffde59] hover:-translate-y-2 transition-all duration-300 flex flex-col group"
        >
          <img 
            src={post.coverImage || 'https://images.unsplash.com/photo-1629732047847-50b7efd0a1a1?auto=format&fit=crop&q=80&w=800'} 
            alt={post.title} 
            className="w-full h-56 object-cover border-b border-white/10 group-hover:scale-105 transition-transform duration-500"
          />
          <div className="p-6 flex flex-col flex-grow bg-[#121212] relative z-10">
            
            {/* 👇 NUEVO DISEÑO: Categoría y Fecha */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              {post.category && (
                <span className="bg-[#ffde59] text-black text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm font-opensans">
                  {post.category.name}
                </span>
              )}
              <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest font-opensans">
                {formatDate(post.createdAt)}
              </span>
            </div>

            <h3 className="font-anton text-2xl uppercase leading-tight mb-3 text-white group-hover:text-[#ffde59] transition-colors">
              {post.title}
            </h3>
            <p className="text-white/50 text-sm line-clamp-3 leading-relaxed font-opensans">
              {post.excerpt || 'Haz clic para leer el artículo completo...'}
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}