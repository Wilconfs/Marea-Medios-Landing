import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ShareButtons } from '../_components/share-buttons'

// ⚡ LA MAGIA DEL SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  
  const post = await prisma.blogPost.findUnique({ 
    where: { slug: resolvedParams.slug } 
  })
  
  if (!post) {
    return { title: 'Artículo no encontrado | Marea Medios' }
  }

  const defaultImage = 'https://images.unsplash.com/photo-1629732047847-50b7efd0a1a1?auto=format&fit=crop&q=80&w=1200';
  const postImage = post.coverImage || defaultImage;

  return {
    title: `${post.title} | Marea Medios`,
    description: post.excerpt || 'Estrategias, tendencias y contenido de valor para llevar tu marca al siguiente nivel.',
    openGraph: {
      title: post.title,
      description: post.excerpt || 'Estrategias, tendencias y contenido de valor para llevar tu marca al siguiente nivel.',
      type: 'article',
      url: `https://mareamedios.com/blog/${post.slug}`, 
      images: [{ url: postImage, width: 1200, height: 630, alt: post.title }],
      siteName: 'Marea Medios',
    },
    twitter: {
      card: 'summary_large_image', 
      title: post.title,
      description: post.excerpt || 'Estrategias de contenido digital.',
      images: [postImage],
    },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  
  // 👇 LE DECIMOS A PRISMA QUE TRAIGA LA CATEGORÍA
  const post = await prisma.blogPost.findUnique({
    where: { slug: resolvedParams.slug },
    include: { 
      category: true,
      tags: true
    }
  })

  if (!post || post.status !== 'PUBLISHED') {
    notFound()
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(date))
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-opensans selection:bg-[#ffde59] selection:text-black">
      
      {/* Header minimalista */}
      <header className="px-6 py-6 md:px-12 border-b border-white/10 flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#0a0a0a] sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-3 group">
          <img src="/images/logo-marea-medios_25772d23.png" alt="Marea Medios" className="w-8 h-8 object-contain invert transition-transform group-hover:scale-110" />
          <div className="flex flex-col leading-none">
            <span className="text-white font-bold text-xl tracking-wider font-anton uppercase">MAREA</span>
            <span className="text-[#ffde59] text-xs tracking-[0.25em] uppercase">MEDIOS</span>
          </div>
        </Link>
        <Link href="/blog" className="text-[#ffde59] hover:text-white transition-colors flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
          <ArrowLeft size={16} /> Volver al Blog
        </Link>
      </header>

      {/* Contenido del Artículo */}
      <main className="flex-grow w-full">
        {/* Portada */}
        <div className="w-full h-[40vh] md:h-[38vh] relative border-b border-[#ffde59]/20">
          <img 
            src={post.coverImage || 'https://images.unsplash.com/photo-1629732047847-50b7efd0a1a1?auto=format&fit=crop&q=80&w=1920'} 
            alt={post.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>

        {/* Texto */}
        <div className="max-w-4xl mx-auto px-6 py-12 md:py-20 -mt-32 relative z-10">
          
          {/* 👇 NUEVO DISEÑO: Categoría y Fecha */}
          <div className="flex items-center gap-4 mb-6">
            {post.category && (
              <span className="text-black bg-[#ffde59] px-3 py-1 text-xs font-bold uppercase tracking-widest inline-block font-opensans rounded-sm">
                {post.category.name}
              </span>
            )}
            <span className="text-white/50 text-xs font-bold uppercase tracking-widest inline-block font-opensans">
              {formatDate(post.createdAt)}
            </span>
          </div>

          <h1 className="font-anton text-4xl md:text-5xl lg:text-7xl uppercase leading-[1.05] text-white mb-12">
            {post.title}
          </h1>

          <ShareButtons title={post.title} />

          {/* ESTILOS DEL CONTENIDO QUILL */}
          <div className="max-w-none font-opensans marea-blog-content">
            <style>{`
              .marea-blog-content .ql-align-center { text-align: center; }
              .marea-blog-content .ql-align-right { text-align: right; }
              .marea-blog-content .ql-align-justify { text-align: justify; }
              .marea-blog-content img { max-width: 100%; height: auto; border-radius: 8px; margin-top: 20px; margin-bottom: 20px; }
              .marea-blog-content img.ql-align-center { display: block; margin-left: auto; margin-right: auto; }
              .marea-blog-content img.ql-align-right { display: block; margin-left: auto; margin-right: 0; }
              .marea-blog-content p { margin-bottom: 1.5em; line-height: 1.8; }
              .marea-blog-content ul { list-style-type: disc; padding-left: 2em; margin-bottom: 1.5em; }
              .marea-blog-content ol { list-style-type: decimal; padding-left: 2em; margin-bottom: 1.5em; }
            `}</style>
          
          <div dangerouslySetInnerHTML={{ __html: post.content }} />          
          </div>

          {/* 👇 NUEVO DISEÑO: Etiquetas (Tags) al final del artículo */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-16 pt-8 border-t border-white/10">
              <h4 className="text-white/40 text-xs font-bold uppercase tracking-widest mb-4 font-opensans">
                Etiquetas relacionadas
              </h4>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag: any) => (
                  <span 
                    key={tag.id} 
                    className="bg-white/5 border border-white/10 text-white/70 px-4 py-1.5 text-xs font-medium rounded-full hover:bg-white/10 hover:text-white transition-colors cursor-default"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
      
    </div>
  )
}