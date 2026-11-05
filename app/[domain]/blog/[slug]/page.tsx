import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ShareButtons from '../_components/share-buttons'

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
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-[#ffde59] selection:text-black relative">
      
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
        <Link href="/blog" className="text-zinc-400 hover:text-[#ffde59] transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
          <ArrowLeft size={16} /> Volver al Blog
        </Link>
      </header>

      {/* Contenido del Artículo */}
      <main className="flex-grow w-full relative">
        {/* Glow de fondo */}
        <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-yellow-500/10 blur-[150px] rounded-full pointer-events-none z-0" />

        {/* Portada */}
        <div className="w-full h-[50vh] relative border-b border-[#ffde59]/20 z-10">
          <img 
            src={post.coverImage || 'https://images.unsplash.com/photo-1629732047847-50b7efd0a1a1?auto=format&fit=crop&q=80&w=1920'} 
            alt={post.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        </div>

        {/* Texto */}
        <div className="max-w-4xl mx-auto px-6 py-12 md:py-16 -mt-40 relative z-20">
          
          <div className="flex items-center gap-4 mb-8">
            {post.category && (
              <span className="text-black bg-[#ffde59] px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-widest inline-block font-sans rounded-sm shadow-[0_0_10px_rgba(250,204,21,0.3)]">
                {post.category.name}
              </span>
            )}
            <span className="text-zinc-400 text-xs font-mono font-bold uppercase tracking-widest inline-block">
              {formatDate(post.createdAt)}
            </span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[1.05] text-white mb-6">
            {post.title}
          </h1>

          <ShareButtons title={post.title} />

          {/* ESTILOS DEL CONTENIDO QUILL - Tipografía más legible */}
          <div className="max-w-none font-sans text-zinc-300 text-base md:text-lg marea-blog-content mt-8">
            <style>{`
              .marea-blog-content .ql-align-center { text-align: center; }
              .marea-blog-content .ql-align-right { text-align: right; }
              .marea-blog-content .ql-align-justify { text-align: justify; }
              .marea-blog-content img { max-width: 100%; height: auto; border-radius: 12px; margin-top: 32px; margin-bottom: 32px; border: 1px solid rgba(255,255,255,0.1); }
              .marea-blog-content img.ql-align-center { display: block; margin-left: auto; margin-right: auto; }
              .marea-blog-content img.ql-align-right { display: block; margin-left: auto; margin-right: 0; }
              .marea-blog-content p { margin-bottom: 1.8em; line-height: 1.9; font-weight: 400; }
              .marea-blog-content h1, .marea-blog-content h2, .marea-blog-content h3 { font-family: 'Space Grotesk', sans-serif; font-weight: 800; text-transform: uppercase; color: white; margin-top: 2em; margin-bottom: 1em; letter-spacing: -0.02em; }
              .marea-blog-content h2 { font-size: 2rem; }
              .marea-blog-content h3 { font-size: 1.5rem; color: #ffde59; }
              .marea-blog-content strong { color: white; font-weight: 700; }
              .marea-blog-content a { color: #ffde59; text-decoration: underline; text-underline-offset: 4px; }
              .marea-blog-content blockquote { border-left: 4px solid #ffde59; padding-left: 24px; margin-left: 0; font-style: italic; color: #a1a1aa; font-size: 1.1rem; }
              .marea-blog-content ul { list-style-type: none; padding-left: 0; margin-bottom: 1.8em; }
              .marea-blog-content ul li { position: relative; padding-left: 1.5em; margin-bottom: 0.5em; }
              .marea-blog-content ul li::before { content: '✦'; position: absolute; left: 0; color: #ffde59; font-size: 0.8em; top: 0.2em; }
              .marea-blog-content ol { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 1.8em; color: white; font-weight: bold; }
              .marea-blog-content ol li span { color: #d4d4d8; font-weight: normal; }
            `}</style>
          
            <div dangerouslySetInnerHTML={{ __html: post.content }} />          
          </div>

          {/* Etiquetas (Tags) */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-20 pt-10 border-t border-white/10">
              <h4 className="text-zinc-500 text-[10px] font-mono font-bold uppercase tracking-widest mb-6">
                ETIQUETAS RELACIONADAS
              </h4>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag: any) => (
                  <span 
                    key={tag.id} 
                    className="bg-zinc-900 border border-white/10 text-zinc-400 px-4 py-2 text-xs font-bold rounded-full hover:border-[#ffde59]/50 hover:text-white transition-colors cursor-default"
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