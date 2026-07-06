'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { 
  ArrowRight, Play, Star, Quote, Smartphone, 
  TrendingUp, Video, ChartColumn, Palette, Megaphone, CheckCircle2,
  Menu, X, Check, User, Instagram, Facebook, Youtube
} from 'lucide-react'
import { WhatsAppWidget } from './_components/whatsapp-widget'

// ==========================================
// ⚡ COMPONENTE DE ANIMACIÓN (NUEVO)
// ==========================================
const Reveal = ({ children, delay = 0, direction = "up" }: { children: React.ReactNode, delay?: number, direction?: "up" | "left" | "right" }) => {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target) // Hace que la animación ocurra solo 1 vez
        }
      },
      { threshold: 0.15 } // Se activa cuando el 15% del elemento es visible
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  // Configuramos la dirección de inicio
  const getTransform = () => {
    if (direction === "up") return "translate-y-12"
    if (direction === "left") return "-translate-x-12"
    if (direction === "right") return "translate-x-12"
    return ""
  }

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${
        isVisible ? "opacity-100 translate-y-0 translate-x-0" : `opacity-0 ${getTransform()}`
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false)
    const element = document.querySelector(id)
    if (element) element.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    
    <div className="min-h-screen bg-black text-white selection:bg-[#ffde59] selection:text-black">
      
      {/* ─── NAVBAR ─── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-black/95 backdrop-blur-sm shadow-lg shadow-black/50" : "bg-black"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection('#inicio')}>
            <img src="/images/logo-marea-medios_25772d23.png" alt="Logo" className="w-8 h-8 md:w-10 md:h-10 object-contain invert" />
            <div className="flex flex-col leading-none">
              <span className="text-white text-lg md:text-xl tracking-wider font-anton">MAREA</span>
              <span className="text-[#ffde59] text-xs font-bold md:text-sm tracking-[0.25em] font-opensans">MEDIOS</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            {['#inicio', '#nosotros', '#servicios', '#proceso', '#planes', '#sistemas'].map((slug) => (
              <button key={slug} onClick={() => scrollToSection(slug)} className="nav-link uppercase bg-transparent border-none cursor-pointer">
                {slug.replace('#', '')}
              </button>
            ))}
            <Link href="/blog" className="nav-link uppercase">
              BLOG
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/login" className="text-white/60 hover:text-[#ffde59] transition-colors p-2" title="Iniciar Sesión">
              <User size={20} />
            </Link>
            <button onClick={() => scrollToSection('#contacto')} className="btn-primary text-sm py-2.5 px-5">
              Agenda una reunión
            </button>
          </div>

          <button className="md:hidden text-white hover:text-[#ffde59] p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section id="inicio" className="relative min-h-screen flex items-center overflow-hidden bg-black pt-20" style={{ backgroundImage: `url(/images/hero-bg_0a4a7115.png)`, backgroundSize: 'cover', backgroundPosition: 'center right', backgroundRepeat: 'no-repeat' }}>
        <div className="absolute inset-0 bg-black/75 z-0" />
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#ffde59] z-10 animate-in fade-in slide-in-from-top-full duration-1000" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-16 w-full flex flex-col justify-center min-h-[calc(100vh-6rem)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center flex-grow">
            
            <div className="lg:col-span-7 flex flex-col justify-center">
              <Reveal direction="left">
                <div className="inline-flex items-center gap-2 mb-6">
                  <div className="h-px w-10 bg-[#ffde59]" />
                  <span className="text-[#ffde59] text-xs font-semibold tracking-[0.3em] uppercase font-opensans">Agencia de Contenido Digital</span>
                </div>
                <h1 className="text-white uppercase mb-8 font-anton text-[clamp(3.5rem,9vw,8rem)] tracking-[0.02em] leading-[0.95]">
                  SOMOS LA <br />
                  <span className="text-[#ffde59]">MAREA QUE</span> <br />
                  MUEVE MARCAS
                </h1>
                <p className="text-white/75 max-w-xl leading-relaxed text-[1.1rem] font-opensans">
                  Convertimos marcas pequeñas en marcas con presencia sólida. Estrategia, producción audiovisual y contenido que genera movimiento real.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mt-10">
                  <button className="btn-primary">
                    Agenda una reunión <ArrowRight size={18} />
                  </button>
                  <button onClick={() => scrollToSection('#servicios')} className="btn-outline">
                    <Play size={16} fill="#ffde59" /> Ver servicios
                  </button>
                </div>
              </Reveal>
            </div>

            <div className="hidden lg:flex lg:col-span-5 items-end justify-end h-full relative">
              <Reveal delay={300} direction="right">
                <div className="relative w-full flex justify-end float-anim">
                  <div className="absolute bottom-0 right-0 w-3/4 h-3/4 bg-[#ffde59]/5 border border-[#ffde59]/20 z-0" />
                  <img src="/images/hero-person.png" alt="Creador" className="relative z-10 max-h-[80vh] w-auto object-contain object-bottom drop-shadow-[0_20px_60px_rgba(255,222,89,0.15)]" />
                  <div className="absolute top-16 left-4 bg-[#ffde59] text-black px-4 py-2 z-20 font-anton text-[0.8rem] tracking-[0.1em]">
                    ALIADOS DE CRECIMIENTO
                  </div>
                </div>
              </Reveal>
            </div>
          </div>

          <Reveal delay={500}>
            <div className="mt-14 flex flex-wrap gap-8 md:gap-16 border-t border-white/10 pt-8">
              <div className="flex flex-col">
                <span className="text-[#ffde59] font-anton text-4xl">+2M</span>
                <span className="text-white/50 text-xs uppercase tracking-wider mt-1 font-opensans">Visualizaciones</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[#ffde59] font-anton text-4xl">+100</span>
                <span className="text-white/50 text-xs uppercase tracking-wider mt-1 font-opensans">Contenidos al mes</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[#ffde59] font-anton text-4xl">En toda Colombia</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── TICKER ─── */}
      <div className="bg-[#ffde59] py-4 overflow-hidden border-y-2 border-black text-black font-anton text-base tracking-[0.12em]">
        <div className="marquee-track">
          {Array(4).fill(["ESTRATEGIA DE CONTENIDO", "PRODUCCIÓN AUDIOVISUAL", "MANEJO DE REDES SOCIALES", "BRANDING DIGITAL", "PAUTA DIGITAL", "COMMUNITY MANAGER"]).flat().map((text, idx) => (
            <span key={idx} className="inline-flex items-center gap-4 mx-6 text-black">
              {text} <span className="text-black/40 text-xl">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ─── NOSOTROS ─── */}
      <section id="nosotros" className="bg-white text-black py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <Reveal>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-px w-10 bg-black" />
                  <span className="text-black/50 text-xs font-semibold tracking-[0.3em] uppercase font-opensans">Quiénes somos</span>
                </div>
                <h2 className="text-black font-anton text-[clamp(2.5rem,5vw,4rem)] uppercase leading-[1.2] mb-6">
                  NO SOMOS SOLO <br />
                  <span className="bg-[#ffde59] px-3 py-1 inline-block my-2">CREADORES</span> <br /> DE CONTENIDO
                </h2>
                <p className="text-black/70 text-[1.05rem] mb-6 leading-relaxed font-opensans">
                  Marea Medios nace para resolver un problema real: marcas con potencial que se pierden en el ruido digital sin dirección, sin identidad y sin estructura.
                </p>
                <ul className="space-y-3 mb-10">
                  {["Estrategia antes que publicaciones", "Producción audiovisual profesional", "Comunicación comercial efectiva", "Diseño visual coherente con tu marca", "Análisis y objetivos medibles"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 size={18} className="text-[#ffde59] fill-black shrink-0" />
                      <span className="text-black/80 text-sm font-opensans">{item}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
            
            <div className="relative">
              <Reveal delay={200}>
                <img src="/images/about-visual.png" alt="Nosotros" className="w-full object-cover aspect-[4/3]" />
                <div className="absolute bottom-4 left-4 bg-[#ffde59] p-5 max-w-xs">
                  <p className="text-black font-anton text-base leading-tight uppercase tracking-[0.05em]">
                    SOMOS MOVIMIENTO.<br/>SOMOS ESTRATEGIA.<br/>SOMOS CRECIMIENTO.
                  </p>
                </div>
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-black border-2 border-[#ffde59] z-[-1]" />
              </Reveal>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-32">
            <Reveal>
              <div className="bg-black p-8 h-full">
                <h3 className="text-[#ffde59] font-anton text-[1.5rem] tracking-[0.08em] uppercase mb-4">NUESTRA MISIÓN</h3>
                <p className="text-white/75 leading-relaxed font-opensans">
                  Impulsar marcas y profesionales que aún están "escondidos" en el mercado, llevándolos al mundo digital con estrategia, creatividad y contenido de alta calidad.
                </p>
              </div>
            </Reveal>
            <Reveal delay={200}>
              <div className="bg-[#ffde59] p-8 h-full">
                <h3 className="text-black font-anton text-[1.5rem] tracking-[0.08em] uppercase mb-4">NUESTRA VISIÓN</h3>
                <p className="text-black/75 leading-relaxed font-opensans">
                  Ser una de las agencias de contenido y posicionamiento digital más influyentes de Colombia, reconocida por descubrir y visibilizar el talento empresarial de cada región.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── SERVICIOS ─── */}
      <section id="servicios" className="relative py-24 lg:py-32 bg-black border-t border-white/10" style={{ backgroundImage: `url(/images/services-bg.png)`, backgroundSize: 'cover', backgroundBlendMode: 'overlay' }}>
        <div className="absolute inset-0 bg-black/90 z-0" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          <Reveal>
            <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px w-10 bg-[#ffde59]" />
                  <span className="text-[#ffde59]/70 text-xs font-semibold tracking-[0.3em] uppercase font-opensans">Lo que hacemos</span>
                </div>
                <h2 className="font-anton text-[clamp(2.5rem,5vw,4.5rem)] uppercase leading-[0.95] text-white">
                  NUESTROS <span className="text-[#ffde59]">SERVICIOS</span>
                </h2>
              </div>
              <p className="text-white/50 max-w-sm leading-relaxed font-opensans">
                No solo creamos contenido. Construimos posicionamiento estratégico que convierte seguidores en clientes.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Video, title: "PRODUCCIÓN AUDIOVISUAL", desc: "Grabación y edición de contenido profesional para redes sociales.", tag: "Video & Foto" },
              { icon: ChartColumn, title: "ESTRATEGIA DE CONTENIDO", desc: "Planificación estructurada enfocada en objetivos comerciales y ventas.", tag: "Estrategia" },
              { icon: Palette, title: "BRANDING", desc: "Construcción o rediseño de identidad visual coherente y memorable.", tag: "Identidad Visual" },
              { icon: Smartphone, title: "MANEJO DE REDES", desc: "Gestión estratégica de perfiles digitales, métricas y crecimiento sostenido.", tag: "Social Media" },
              { icon: Megaphone, title: "PAUTA DIGITAL", desc: "Creación y optimización de campañas pagas en Meta, Instagram y TikTok.", tag: "Publicidad" },
              { icon: TrendingUp, title: "COMMUNITY MANAGER", desc: "Gestión activa de tu comunidad digital y relaciones con tu audiencia.", tag: "Comunidad" },
            ].map((srv, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="group bg-black/60 border border-white/10 p-8 hover:border-[#ffde59]/50 transition-all duration-300 hover:bg-[#ffde59]/5 h-full">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[#ffde59]/60 text-xs uppercase tracking-widest font-opensans">{srv.tag}</span>
                    <div className="w-10 h-10 bg-[#ffde59]/10 flex items-center justify-center group-hover:bg-[#ffde59] transition-colors duration-300">
                      <srv.icon size={20} className="text-[#ffde59] group-hover:text-black transition-colors duration-300" />
                    </div>
                  </div>
                  <h3 className="font-anton text-[1.2rem] tracking-[0.05em] mb-4 text-white uppercase group-hover:text-[#ffde59] transition-colors">{srv.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed font-opensans">{srv.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PROCESO ─── */}
      <section id="proceso" className="bg-white py-24 lg:py-32 text-black">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <Reveal>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-px w-10 bg-black" />
                  <span className="text-black/50 text-xs font-semibold tracking-[0.3em] uppercase font-opensans">Cómo trabajamos</span>
                </div>
                <h2 className="font-anton text-[clamp(2.5rem,5vw,4rem)] uppercase leading-[1.2] mb-12">
                  NUESTRO <br />
                  <span className="bg-[#ffde59] px-3 py-1 inline-block my-2">PROCESO</span> <br /> DE TRABAJO
                </h2>
              </Reveal>
              
              <div className="space-y-0">
                {[
                  { num: "01", title: "DIAGNÓSTICO", desc: "Analizamos tu marca, tu competencia y tu audiencia. Identificamos oportunidades y definimos objetivos." },
                  { num: "02", title: "ESTRATEGIA", desc: "Diseñamos un plan de contenido personalizado con pilares de comunicación y metas medibles." },
                  { num: "03", title: "PRODUCCIÓN", desc: "Creamos el contenido: videos, fotografía, diseño gráfico y copy estratégico con calidad." },
                  { num: "04", title: "PUBLICACIÓN", desc: "Gestionamos la publicación en los canales correctos, horarios óptimos y pauta." },
                  { num: "05", title: "ANÁLISIS Y CRECIMIENTO", desc: "Medimos resultados, ajustamos la estrategia y escalamos lo que funciona." },
                ].map((step, i) => (
                  <Reveal key={i} delay={i * 100} direction="left">
                    <div className="group flex gap-6 py-6 border-b border-black/10 hover:bg-[#ffde59]/5 px-2 transition-colors">
                      <div className="shrink-0">
                        <span className="font-anton text-[2.5rem] leading-[1] block" style={{ WebkitTextStroke: '2px #ffde59', color: 'transparent' }}>{step.num}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-anton text-[1.1rem] tracking-[0.08em] uppercase mb-2 group-hover:text-black">{step.title}</h3>
                        <p className="text-black/60 text-sm leading-relaxed font-opensans">{step.desc}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
            
            <div className="lg:sticky lg:top-24">
              <Reveal direction="right">
                <div className="relative">
                  <img src="/images/process-visual.png" alt="Proceso" className="w-full object-cover" />
                  <div className="absolute bottom-0 right-0 bg-black text-[#ffde59] px-6 py-4">
                    <p className="font-anton text-sm uppercase tracking-[0.1em]">PLAN → CREA → PUBLICA → CRECE</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-0 mt-0">
                  {[
                    { num: "+50", label: "Clientes" },
                    { num: "100%", label: "Compromiso" },
                    { num: "3", label: "Regiones" }
                  ].map((stat, i) => (
                    <div key={i} className="bg-black p-6 text-center border-r border-white/10 last:border-r-0">
                      <span className="text-[#ffde59] font-anton text-2xl md:text-3xl block mb-1">{stat.num}</span>
                      <span className="text-white/50 text-xs uppercase tracking-wider font-opensans">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PLANES Y PRECIOS ─── */}
      <section id="planes" className="bg-black py-24 lg:py-32 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="h-px w-10 bg-[#ffde59]" />
                <span className="text-[#ffde59]/70 text-xs font-semibold tracking-[0.3em] uppercase font-opensans">Inversión en tu marca</span>
                <div className="h-px w-10 bg-[#ffde59]" />
              </div>
              <h2 className="text-white font-anton text-[clamp(2.5rem,5vw,4.5rem)] uppercase leading-[0.95] mb-4">
                PLANES Y <span className="text-[#ffde59]">PRECIOS</span>
              </h2>
              <p className="text-white/50 max-w-lg mx-auto leading-relaxed font-opensans">
                Elige el plan que mejor se adapte a tus objetivos. Todos incluyen estrategia, producción y gestión profesional.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {[
              { name: "BÁSICO", price: "$650.000", desc: "Ideal para negocios que están comenzando su presencia digital.", features: ["5 contenidos para redes", "3 videos comerciales", "2 carruseles", "Manejo de comunidad"], cta: "EMPEZAR AHORA", featured: false },
              { name: "ESTÁNDAR", price: "$1.500.000", desc: "Para marcas que quieren crecer con estrategia y consistencia.", features: ["10 contenidos para redes", "6 videos comerciales", "4 carruseles", "Manejo total", "Community Manager"], cta: "EL MÁS POPULAR", featured: true },
              { name: "PREMIUM", price: "$2.700.000", desc: "Para marcas que buscan posicionamiento total y profesional.", features: ["15 contenidos al mes", "8 videos profesionales", "4 videos trend", "Página web incluida", "Estrategia Completa"], cta: "QUIERO EL PREMIUM", featured: false },
            ].map((plan, i) => (
              <Reveal key={i} delay={i * 150}>
                <div className={`h-full flex flex-col relative ${plan.featured ? "bg-[#ffde59] text-black scale-105 shadow-2xl z-10" : "bg-[#0a0a0a] text-white border border-white/10 mt-4 mb-4"}`}>
                  {plan.featured && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black text-[#ffde59] px-4 py-1.5 flex items-center gap-1.5">
                      <Star size={12} fill="#ffde59" />
                      <span className="font-anton text-xs uppercase tracking-wider">MÁS POPULAR</span>
                    </div>
                  )}
                  <div className={`p-8 border-b ${plan.featured ? "border-black/20" : "border-white/10"}`}>
                    <h3 className={`font-anton text-[1.4rem] tracking-[0.1em] uppercase mb-2 ${plan.featured ? "text-black" : "text-white"}`}>PLAN {plan.name}</h3>
                    <p className={`font-opensans text-sm mb-6 ${plan.featured ? "text-black/70" : "text-white/50"}`}>{plan.desc}</p>
                    <div className="flex items-end gap-2">
                      <span className={`font-anton text-[2.5rem] leading-none ${plan.featured ? "text-black" : "text-[#ffde59]"}`}>{plan.price}</span>
                    </div>
                    <span className={`font-opensans text-sm mt-1 block ${plan.featured ? "text-black/60" : "text-white/40"}`}>COP / mes</span>
                  </div>
                  <div className="p-8 flex-1">
                    <ul className="space-y-3">
                      {plan.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-3">
                          <Check size={16} className={`shrink-0 mt-0.5 ${plan.featured ? "text-black" : "text-[#ffde59]"}`} />
                          <span className={`font-opensans text-sm leading-snug ${plan.featured ? "text-black/80" : "text-white/60"}`}>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-8 pt-0 mt-auto">
                    <button className={`w-full flex items-center justify-center gap-2 py-3.5 font-anton uppercase tracking-[0.1em] transition-all duration-200 ${plan.featured ? "bg-black text-[#ffde59] hover:bg-[#111]" : "bg-[#ffde59] text-black hover:bg-white"}`}>
                      {plan.cta}
                    </button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIOS ─── */}
      <section className="bg-white py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <Reveal>
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-10 bg-black" />
                <span className="text-black/50 text-xs font-semibold tracking-[0.3em] uppercase font-opensans">Lo que dicen nuestros clientes</span>
              </div>
              <h2 className="font-anton text-[clamp(2rem,4vw,3.5rem)] text-black uppercase leading-[1.2] mb-12">
                ELLOS YA <br />
                <span className="bg-[#ffde59] px-3 py-1 inline-block my-2">CRECIERON</span>
              </h2>
            </div>
          </Reveal>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { quote: "Marea Medios transformó completamente la presencia digital de nuestro restaurante. Ahora tenemos una imagen profesional y nuestras ventas crecieron notablemente.", author: "Carlos M.", role: "Propietario, Restaurante El Sabor", loc: "Ibagué, Tolima" },
              { quote: "Antes publicaba sin dirección y sin resultados. Con Marea tengo una estrategia clara, contenido de calidad y clientes que llegan por redes sociales.", author: "Laura P.", role: "Emprendedora, Marca Personal", loc: "Bogotá, Cundinamarca" },
              { quote: "El equipo de Marea entiende el negocio, no solo las redes. Eso hace la diferencia. Son aliados reales de crecimiento.", author: "Andrés R.", role: "Gerente, Empresa de Servicios", loc: "Neiva, Huila" }
            ].map((t, i) => (
              <Reveal key={i} delay={i * 200}>
                <div className="bg-black p-8 flex flex-col gap-6 h-full">
                  <Quote size={32} className="text-[#ffde59]" />
                  <p className="text-white/80 leading-relaxed flex-1 font-opensans italic">"{t.quote}"</p>
                  <div className="border-t border-white/10 pt-4">
                    <p className="text-[#ffde59] font-bold text-sm uppercase font-opensans">{t.author}</p>
                    <p className="text-white/40 text-xs mt-0.5 font-opensans">{t.role}</p>
                    <p className="text-white/30 text-xs font-opensans">{t.loc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── INFRAESTRUCTURA SAAS ─── */}
      <section id="sistemas" className="bg-[#0a0a0a] py-24 border-y border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <Reveal direction="left">
              <span className="text-[#ffde59] text-xs font-bold uppercase tracking-widest block mb-3">Infraestructura SaaS Premium</span>
              <h2 className="font-anton text-[clamp(2rem,4vw,3.5rem)] uppercase text-white mb-6 leading-[0.95]">
                Tu propia tienda online bajo modelo de <span className="text-[#ffde59]">Suscripción</span>
              </h2>
              <p className="text-white/50 mb-8 leading-relaxed font-opensans text-[14.5px]">
                Le damos superpoderes digitales a tu marca. Accede a una plataforma robusta, ultra rápida y autoadministrable diseñada para multiplicar tus ventas sin costos ocultos de desarrollo ni configuraciones complejas.
              </p>
              <div className="space-y-4">
                <div className="bg-[#121212] border border-[#222] p-5 rounded-lg">
                  <h3 className="text-[#ffde59] text-lg font-bold mb-2">🛍️ Plataforma Todo en Uno</h3>
                  <p className="text-[#aaa] text-sm leading-relaxed">Una arquitectura inteligente que te permite controlar stock, categorías y catálogos en tiempo real de forma independiente y centralizada.</p>
                </div>
                <div className="bg-[#121212] border border-[#222] p-5 rounded-lg">
                  <h3 className="text-[#ffde59] text-lg font-bold mb-2">💳 Pasarela de Pagos & Checkout Eficiente</h3>
                  <p className="text-[#aaa] text-sm leading-relaxed">Procesamiento de compras optimizado y seguro, ideal para transacciones fluidas que evitan carritos abandonados.</p>
                </div>
              </div>
              <div className="mt-8">
                <button className="btn-primary">
                  CONTACTANOS
                </button>
              </div>
            </Reveal>
          </div>
          
          <Reveal direction="right" delay={200}>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 border border-[#2d2d2d] rounded-xl overflow-hidden shadow-2xl bg-[#161616]">
                <img src="/images/dashboard.png" alt="Dashboard" className="w-full opacity-85 hover:opacity-100 transition-opacity" />
              </div>
              <div className="border border-[#2d2d2d] rounded-xl overflow-hidden shadow-2xl bg-[#161616]">
                <img src="/images/tienda.png" alt="Tienda" className="w-full opacity-85 hover:opacity-100 transition-opacity" />
              </div>
              <div className="border border-[#2d2d2d] rounded-xl overflow-hidden shadow-2xl bg-[#161616]">
                <img src="/images/orders.png" alt="Ordenes" className="w-full opacity-85 hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-black pt-20 pb-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 mb-16">
            
            {/* Columna 1: Logo e Información */}
            <div className="md:col-span-12 lg:col-span-5">
              <Link href="/" className="flex items-center gap-3 mb-6 group w-fit">
                <img src="/images/logo-marea-medios_25772d23.png" alt="Marea Medios" className="w-8 h-8 object-contain invert transition-transform group-hover:scale-110" />
                <div className="flex flex-col leading-none">
                  <span className="text-white font-bold text-xl tracking-wider font-anton uppercase">MAREA</span>
                  <span className="text-[#ffde59] text-xs font-bold tracking-[0.25em] uppercase">MEDIOS</span>
                </div>
              </Link>
              <p className="text-white/50 text-sm leading-relaxed mb-8 max-w-sm font-opensans">
                Agencia de contenido digital estratégica. Convertimos marcas pequeñas en marcas con presencia sólida en Colombia.
              </p>
              
              <span className="text-[#ffde59] text-xs font-bold uppercase tracking-widest block mb-4 font-opensans">SÍGUENOS</span>
              <div className="flex items-center gap-3">
                <a href="https://instagram.com/mareamedios" className="w-10 h-10 border border-white/20 flex items-center justify-center text-white/50 hover:border-[#ffde59] hover:text-[#ffde59] transition-all">
                  <Instagram size={18} strokeWidth={1.5} />
                </a>
                <a href="https://www.facebook.com/profile.php?id=61577294263603" className="w-10 h-10 border border-white/20 flex items-center justify-center text-white/50 hover:border-[#ffde59] hover:text-[#ffde59] transition-all">
                  <Facebook size={18} strokeWidth={1.5} />
                </a>
                <a href="https://www.youtube.com/@Periodismo1024" className="w-10 h-10 border border-white/20 flex items-center justify-center text-white/50 hover:border-[#ffde59] hover:text-[#ffde59] transition-all">
                  <Youtube size={18} strokeWidth={1.5} />
                </a>
              </div>
            </div>

            {/* Columna 2: Navegación */}
            <div className="md:col-span-6 lg:col-span-3">
              <span className="text-[#ffde59] text-xs font-bold uppercase tracking-widest block mb-6 font-opensans">NAVEGACIÓN</span>
              <ul className="space-y-4">
                {['Inicio', 'Nosotros', 'Servicios', 'Proceso', 'Planes', 'Sistemas'].map((item) => (
                  <li key={item}>
                    <button 
                      onClick={() => scrollToSection(`#${item.toLowerCase()}`)} 
                      className="text-white/50 hover:text-white text-[13px] uppercase tracking-wider font-opensans transition-colors text-left"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Columna 3: Servicios */}
            <div className="md:col-span-6 lg:col-span-4">
              <span className="text-[#ffde59] text-xs font-bold uppercase tracking-widest block mb-6 font-opensans">SERVICIOS</span>
              <ul className="space-y-4">
                {[
                  'Producción Audiovisual', 
                  'Estrategia de Contenido', 
                  'Branding', 
                  'Manejo de Redes Sociales', 
                  'Pauta Digital', 
                  'Community Manager'
                ].map((item) => (
                  <li key={item}>
                    <button 
                      onClick={() => scrollToSection('#servicios')} 
                      className="text-white/50 hover:text-white text-[13px] uppercase tracking-wider font-opensans transition-colors text-left"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Fila Inferior: Copyright */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t border-white/10 pt-8">
            <p className="text-white/30 text-xs font-opensans">© 2026 Marea Medios. Todos los derechos reservados.</p>
            <p className="text-white/30 text-xs font-opensans">Bogotá · Cundinamarca · Tolima · Huila · Colombia</p>
          </div>

        </div>
      </footer>

      <WhatsAppWidget />

    </div>
  )
}