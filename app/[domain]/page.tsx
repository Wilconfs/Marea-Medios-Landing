'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { 
  ArrowRight, Play, Star, Quote, Smartphone, 
  TrendingUp, Video, Palette, Megaphone, CheckCircle2,
  Menu, X, Check, User, Instagram, Facebook, Youtube, Heart, MessageCircle, BarChart2
} from 'lucide-react'

// Importaciones para Animaciones Avanzadas
import gsap from 'gsap'
import ScrollTrigger from 'gsap/dist/ScrollTrigger'
import Lenis from '@studio-freight/lenis'

// Mantengo tu componente original
import { WhatsAppWidget } from './_components/whatsapp-widget'

// Registrar ScrollTrigger en Next.js (lado del cliente)
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// ─── COMPONENTE REELCARD ACTUALIZADO (CON AUDIO) ───
const ReelCard = ({ reel, index }: { reel: any, index: number }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = (e: React.MouseEvent) => {
    e.preventDefault(); // Evita abrir Instagram al tocar el botón de Play
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <a
      href={reel.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`reel-card group block relative aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl bg-zinc-900 border border-zinc-800 hover:border-[#ffde59]/50 transition-all duration-500 transform-gpu ${reel.offset ? 'mt-0 md:mt-12' : ''}`}
    >
      {/* Etiqueta superior izquierda (01, 02...) */}
      <div className="absolute top-4 left-4 z-20 w-7 h-7 rounded-full border border-white/20 bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/80 font-mono text-[9px] font-bold">
        0{index + 1}
      </div>

      <video
        ref={videoRef}
        src={reel.mp4}
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />

      {/* Sombra para oscurecer cuando no se está reproduciendo */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40 pointer-events-none transition-opacity duration-500 ${isPlaying ? 'opacity-0' : 'opacity-100'}`} />

      {/* Botón Central de Play */}
      <div className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20 transition-opacity duration-300 ${isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}>
        <button
          onClick={togglePlay}
          className="pointer-events-auto flex items-center justify-center transition-transform hover:scale-110 cursor-hover"
        >
          {/* Icono de Play / Pausa */}
          <svg className="w-16 h-16 text-white drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]" fill="currentColor" viewBox="0 0 24 24">
            {isPlaying ? (
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            ) : (
              <path d="M8 5v14l11-7z" />
            )}
          </svg>
        </button>
      </div>

      {/* Texto Inferior */}
      <div className="absolute bottom-5 left-0 right-0 flex justify-center pointer-events-none z-10">
        <span className="text-[9px] font-black text-white/60 uppercase tracking-[0.2em] group-hover:text-white transition-colors">
          Ver en Instagram ↗
        </span>
      </div>
    </a>
  );
};

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isTrimestral, setIsTrimestral] = useState(false)
  const [saasTab, setSaasTab] = useState('dashboard')
  const [isSaasChanging, setIsSaasChanging] = useState(false)

  // Referencias para animaciones y cursores
  const mainRef = useRef<HTMLDivElement>(null)
  const cursorDot = useRef<HTMLDivElement>(null)
  const cursorFollower = useRef<HTMLDivElement>(null)
  const cursorText = useRef<HTMLSpanElement>(null)

  // 1. CONFIGURACIÓN DEL SCROLL FLUIDO Y CURSOR
  useEffect(() => {
    // Lenis Smooth Scroll
    const lenis = new Lenis({
      duration: 0.9,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 1.5
    })

    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })
    gsap.ticker.lagSmoothing(0)

    // Cursor Fluido (Solo en Desktop)
    if (window.matchMedia('(pointer: fine)').matches && cursorDot.current && cursorFollower.current) {
      let mX = -100, mY = -100, fX = -100, fY = -100;

      const moveCursor = (e: MouseEvent) => {
        mX = e.clientX; mY = e.clientY;
        if (cursorDot.current) cursorDot.current.style.transform = `translate3d(${mX}px, ${mY}px, 0)`;
      }

      window.addEventListener('pointermove', moveCursor, { passive: true });

      const loopCursor = () => {
        fX += (mX - fX) * 0.2; fY += (mY - fY) * 0.2;
        if (cursorFollower.current) cursorFollower.current.style.transform = `translate3d(${fX}px, ${fY}px, 0)`;
        requestAnimationFrame(loopCursor);
      }
      requestAnimationFrame(loopCursor);

      // Limpieza
      return () => {
        window.removeEventListener('pointermove', moveCursor);
        lenis.destroy();
      }
    }
    return () => lenis.destroy();
  }, [])

  // 2. ANIMACIONES GSAP "WOW"
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll)

    // Usamos gsap.context para que React 18 no duplique las animaciones en Strict Mode
    let ctx = gsap.context(() => {
      
      const tl = gsap.timeline();
      tl.to('.shutter-tile', { scaleY: 0, transformOrigin: "top", duration: 0.8, stagger: { grid: [2, 4], from: "center", amount: 0.4 }, ease: "power4.inOut" })
        .to('.reveal-item', { y: '0%', duration: 1.2, stagger: 0.15, ease: 'power4.out' }, "-=0.4")
        .to('.hero-desc, .hero-btns', { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: 'power3.out' }, "-=0.8")
        .fromTo('.floating-pill, .floating-pill-alt, .hero-badge', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.5, stagger: 0.2, ease: 'elastic.out(1, 0.4)' }, "-=1")
        .fromTo('#founder-card', { y: 100, rotationY: -15, rotationX: 10, scale: 0.9, opacity: 0 }, { y: 0, rotationY: 0, rotationX: 0, scale: 1, opacity: 1, duration: 1.5, ease: 'power4.out' }, "-=1.2");

      gsap.to('#founder-card', { scrollTrigger: { trigger: '#inicio', start: 'top top', end: 'bottom top', scrub: 1 }, yPercent: 20, rotationZ: 2, ease: 'none' });

      let proxy = { skew: 0 };
      let skewSetter = gsap.quickSetter(".skew-on-scroll", "skewX", "deg");
      ScrollTrigger.create({
        onUpdate: (self) => {
          let skew = gsap.utils.clamp(-15, 15, self.getVelocity() / -100);
          if (Math.abs(skew) > Math.abs(proxy.skew)) {
            proxy.skew = skew;
            gsap.to(proxy, { skew: 0, duration: 0.8, ease: "power3", overwrite: true, onUpdate: () => skewSetter(proxy.skew) });
          }
        }
      });

      gsap.fromTo('.reels-header', { y: 40, opacity: 0 }, { scrollTrigger: { trigger: '#reels-showcase', start: 'top 80%' }, y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' });
      gsap.fromTo('.reel-card', { y: 120, rotationX: -25, opacity: 0 }, { scrollTrigger: { trigger: '#reels-showcase', start: 'top 60%' }, y: 0, rotationX: 0, opacity: 1, duration: 1.2, stagger: 0.15, ease: 'back.out(1.4)' });

      // NOSOTROS (Corrección del espacio)
      gsap.fromTo('.nosotros-content h2, .nosotros-content p', { y: 40, opacity: 0 }, { scrollTrigger: { trigger: '#nosotros', start: 'top 75%' }, y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: 'back.out(1.2)' });
      gsap.fromTo('.check-item', { x: -40, opacity: 0 }, { scrollTrigger: { trigger: '#nosotros', start: 'top 60%' }, x: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.5)' });
      gsap.fromTo('.nosotros-image', { rotationY: 25, rotationX: 15, scale: 0.8, opacity: 0 }, { scrollTrigger: { trigger: '#nosotros', start: 'top 80%' }, rotationY: 0, rotationX: 0, scale: 1, opacity: 1, duration: 1.5, ease: 'power4.out' });
      gsap.to('.inner-img', { scrollTrigger: { trigger: '.nosotros-image', start: 'top bottom', scrub: 1 }, yPercent: 20, scale: 1.15, ease: 'none' });
      gsap.fromTo('.mv-card', { y: 60, scale: 0.9, opacity: 0 }, { scrollTrigger: { trigger: '.mission-vision', start: 'top 85%' }, y: 0, scale: 1, opacity: 1, duration: 1, stagger: 0.2, ease: 'elastic.out(1, 0.6)' });

      gsap.fromTo('.services-header', { y: 30, opacity: 0 }, { scrollTrigger: { trigger: '#servicios', start: 'top 80%' }, y: 0, opacity: 1, duration: 0.8 });
      gsap.fromTo('.service-box', { y: 80, scale: 0.9, opacity: 0 }, { scrollTrigger: { trigger: '.services-grid', start: 'top 75%' }, y: 0, scale: 1, opacity: 1, duration: 0.8, stagger: 0.12, ease: 'back.out(1.4)' });

      ScrollTrigger.create({ trigger: '#proceso', start: 'top 65%', end: 'bottom 80%', scrub: true, onUpdate: (self) => { const bar = document.getElementById('timeline-progress'); if (bar) bar.style.height = (self.progress * 100) + '%'; } });
      gsap.fromTo('.timeline-step', { x: -60, opacity: 0 }, { scrollTrigger: { trigger: '.timeline-step', start: 'top 75%' }, x: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: 'elastic.out(1, 0.5)' });
      gsap.fromTo('.diagram-marea', { rotationY: -15, scale: 0.8, opacity: 0 }, { scrollTrigger: { trigger: '.diagram-marea', start: 'top 75%' }, rotationY: 0, scale: 1, opacity: 1, duration: 1.2, ease: 'power4.out' });

      // PLANES (Corrección de visibilidad)
      gsap.fromTo('.planes-header', { y: 30, opacity: 0 }, { scrollTrigger: { trigger: '#planes', start: 'top 80%' }, y: 0, opacity: 1, duration: 0.8 });
      gsap.fromTo('.pricing-card', { y: 100, rotationX: -10, opacity: 0 }, { scrollTrigger: { trigger: '#planes', start: 'top 40%' }, y: 0, rotationX: 0, opacity: 1, duration: 1, stagger: 0.15, ease: 'back.out(1.2)' });

      gsap.fromTo('.saas-text-content', { x: -60, opacity: 0 }, { scrollTrigger: { trigger: '#sistemas', start: 'top 75%' }, x: 0, opacity: 1, duration: 1, ease: 'power3.out' });
      gsap.fromTo('.saas-image-content', { x: 60, opacity: 0, filter: 'blur(20px)' }, { scrollTrigger: { trigger: '#sistemas', start: 'top 75%' }, x: 0, opacity: 1, filter: 'blur(0px)', duration: 1.2, ease: 'power3.out' });

      // TESTIMONIOS (Corrección de visibilidad)
      gsap.fromTo('.testimonios-header', { y: 30, opacity: 0 }, { scrollTrigger: { trigger: '#testimonios', start: 'top 85%' }, y: 0, opacity: 1, duration: 0.8 });
      gsap.fromTo('.testimonial-card', { y: 80, opacity: 0 }, { scrollTrigger: { trigger: '#testimonios', start: 'top 60%' }, y: 0, rotationZ: () => gsap.utils.random(-4, 4), opacity: 1, duration: 1, stagger: 0.2, ease: 'back.out(1.2)' });

      gsap.fromTo('.footer-logo', { scale: 1.5, opacity: 0 }, { scrollTrigger: { trigger: 'footer', start: 'top 95%' }, scale: 1, opacity: 1, duration: 1, ease: 'power4.out' });
      gsap.fromTo('.footer-content > div:not(:first-child), .footer-bottom', { y: 40, opacity: 0 }, { scrollTrigger: { trigger: 'footer', start: 'top 90%' }, y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: 'power3.out' });

    }, mainRef);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      ctx.revert(); // Limpieza vital para Next.js
    };
  }, [])

  // 3. FUNCIONES DE INTERACCIÓN
  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false)
    const element = document.querySelector(id)
    if (element) element.scrollIntoView({ behavior: 'smooth' })
  }

  const handleMouseMoveGlow = (e: React.MouseEvent<HTMLDivElement>, currentTarget: HTMLDivElement) => {
    const rect = currentTarget.getBoundingClientRect();
    currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  }

  const handleSaasTab = (tab: string) => {
    setIsSaasChanging(true);
    setTimeout(() => {
      setSaasTab(tab);
      setIsSaasChanging(false);
    }, 200);
  }

  // Clases Globales Agregadas vía Style Inject para los tipos de letras
  return (
    <>
      {/* Cursores - ¡MOVIDOS AFUERA DEL DIV RELATIVE! para evitar el bloqueo del Z-Index */}
      <div ref={cursorDot} style={{ zIndex: 99999999 }} className="pointer-events-none fixed top-0 left-0 w-1.5 h-1.5 bg-[#ffde59] rounded-full -translate-x-1/2 -translate-y-1/2 hidden md:flex" />
      <div ref={cursorFollower} style={{ zIndex: 99999998 }} className="pointer-events-none fixed top-0 left-0 w-9 h-9 border-[1.5px] border-[#ffde59]/70 rounded-full -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center justify-center text-[8px] font-black tracking-widest text-black transition-all duration-200 ease-out"><span ref={cursorText}></span></div>

      <div ref={mainRef} className="min-h-screen bg-black text-white selection:bg-[#ffde59] selection:text-black font-sans relative">
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@600;700;800;900&display=swap');
          .font-display { font-family: 'Space Grotesk', sans-serif; }
          .font-sans { font-family: 'Plus Jakarta Sans', sans-serif; }
          @media (pointer: fine) { * { cursor: none !important; } }
          .reveal-mask { overflow: hidden; display: inline-block; }
          .reveal-item { display: inline-block; transform: translateY(115%); will-change: transform; }
          .shutter-matrix { position: fixed; inset: 0; z-index: 99999; display: grid; grid-template-columns: repeat(4, 1fr); grid-template-rows: repeat(2, 1fr); pointer-events: none; }
          .shutter-tile { background: #08080a; width: 100%; height: 100%; }
          .glow-card { position: relative; background: radial-gradient(500px circle at var(--mouse-x, 0) var(--mouse-y, 0), rgba(250, 204, 21, 0.12), transparent 40%); }
          .marquee-track { display: flex; width: max-content; animation: marqueeScroll 22s linear infinite; will-change: transform; }
          @keyframes marqueeScroll { 0% { transform: translateX(0%); } 100% { transform: translateX(-50%); } }
        `}</style>

      {/* Shutter de Entrada */}
      <div className="shutter-matrix">
        {[...Array(8)].map((_, i) => <div key={i} className="shutter-tile"></div>)}
      </div>

      {/* Botón WhatsApp Fijo Estilo HTML (Mantenemos tu Widget también abajo si lo prefieres) */}
      <a href="https://wa.me/573000000000" target="_blank" rel="noreferrer" aria-label="WhatsApp" className="cursor-hover fixed bottom-6 right-6 z-50 w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-transform">
        <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-35"></span>
        <MessageCircle className="w-7 h-7 relative z-10 fill-white" />
      </a>

      {/* ─── NAVBAR ─── */}
      <header id="main-header" className={`fixed top-0 left-0 w-full z-40 px-6 sm:px-12 flex justify-between items-center transition-all duration-300 ${scrolled ? "bg-[#08080a]/95 backdrop-blur-lg shadow-lg shadow-black/50 py-2" : "bg-transparent py-4"}`}>
        <button onClick={() => scrollToSection('#inicio')} className="cursor-hover flex items-center gap-3 bg-transparent border-none">
          <svg className="w-8 h-8 text-white fill-current header-logo" viewBox="0 0 100 100">
            <path d="M10 50 Q 30 20, 50 50 T 90 50 Q 70 80, 50 50 T 10 50 Z" />
          </svg>
          <div className="font-display font-black tracking-tighter text-lg leading-tight text-left">
            MAREA<br /><span className="text-[#ffde59] text-xs tracking-widest">MEDIOS</span>
          </div>
        </button>

        <nav className="hidden lg:flex items-center gap-7 text-xs font-bold uppercase tracking-wider text-zinc-300">
          {['Inicio', 'Nosotros', 'Servicios', 'Proceso', 'Planes', 'Sistemas'].map((item) => (
            <button key={item} onClick={() => scrollToSection(`#${item.toLowerCase()}`)} className="cursor-hover hover:text-[#ffde59] transition-colors bg-transparent border-none">
              {item}
            </button>
          ))}
          {/* AQUÍ ESTÁN TUS ENLACES DE BLOG Y LOGIN */}
          <Link href="/blog" className="cursor-hover hover:text-[#ffde59] transition-colors text-white">BLOG</Link>
        </nav>

        <button onClick={() => scrollToSection('#planes')} className="hidden lg:block cursor-hover px-6 py-2.5 bg-[#ffde59] hover:bg-yellow-300 text-black font-extrabold text-xs uppercase tracking-wider transition-all duration-300 shadow-lg shadow-yellow-400/20 rounded-sm">
          Agenda una Reunión ↗
        </button>

        <button className="lg:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </header>

      {/* ─── MENÚ MÓVIL (Fondo Sólido Opaco para evitar que se pierda el texto) ─── */}
      <div className={`fixed inset-0 bg-[#08080a] z-30 transition-all duration-300 ease-in-out lg:hidden flex flex-col items-center justify-center ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <nav className="flex flex-col items-center gap-8 text-lg font-bold uppercase tracking-widest text-zinc-300">
          {['Inicio', 'Nosotros', 'Servicios', 'Proceso', 'Planes', 'Sistemas'].map((item) => (
            <button key={item} onClick={() => scrollToSection(`#${item.toLowerCase()}`)} className="hover:text-[#ffde59] transition-colors bg-transparent border-none">
              {item}
            </button>
          ))}
          <Link href="/blog" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#ffde59] transition-colors text-white">BLOG</Link>
        </nav>
        <button onClick={() => scrollToSection('#planes')} className="mt-10 px-8 py-3 bg-[#ffde59] text-black font-extrabold text-sm uppercase tracking-wider rounded-md">
          Agenda una Reunión ↗
        </button>
      </div>

      {/* ─── HERO ─── */}
      <section id="inicio" className="min-h-screen relative flex items-center px-6 sm:px-12 pt-28 pb-16 overflow-hidden perspective-container">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-yellow-500/10 blur-[180px] rounded-full pointer-events-none hero-glow" />

        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 z-10 hero-content">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-[2px] bg-[#ffde59]" />
              <span className="text-xs font-mono font-bold tracking-widest text-[#ffde59] uppercase">AGENCIA DE CONTENIDO DIGITAL</span>
            </div>

            <h1 className="font-display text-5xl sm:text-7xl lg:text-[5.5rem] font-black uppercase tracking-tight leading-[0.92] text-white">
              <span className="reveal-mask"><span className="reveal-item">SOMOS LA</span></span><br />
              <span className="reveal-mask"><span className="reveal-item text-[#ffde59]">MAREA QUE</span></span><br />
              <span className="reveal-mask"><span className="reveal-item">MUEVE MARCAS</span></span>
            </h1>

            <p className="hero-desc mt-8 text-zinc-300 text-base sm:text-lg max-w-xl font-light leading-relaxed opacity-0">
              Convertimos marcas pequeñas en marcas con presencia sólida. Estrategia, producción audiovisual y contenido que genera movimiento real en toda Colombia.
            </p>

            <div className="hero-btns mt-10 flex flex-wrap gap-4 items-center opacity-0">
              <button onClick={() => scrollToSection('#planes')} className="cursor-hover px-8 py-4 bg-[#ffde59] hover:bg-yellow-300 text-black font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-yellow-400/20 rounded-lg">
                Agenda una Reunión →
              </button>
              <button onClick={() => scrollToSection('#servicios')} className="cursor-hover px-8 py-4 border border-[#ffde59]/50 hover:border-[#ffde59] text-white font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 rounded-lg">
                <Play size={16} className="fill-current" /> Ver Servicios
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 relative z-10 flex justify-center mt-12 lg:mt-0">
            <div className="floating-pill absolute -left-6 top-16 z-30 px-4 py-2.5 bg-black/90 border border-[#ffde59]/40 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#ffde59]/20 flex items-center justify-center text-[#ffde59] font-bold">⚡</div>
              <div>
                <div className="text-[10px] font-mono text-zinc-400 uppercase">Impacto Mensual</div>
                <div className="text-xs font-bold text-white font-display">+25M REPRODUCCIONES</div>
              </div>
            </div>

            <div className="floating-pill-alt absolute -right-4 bottom-14 z-30 px-4 py-2.5 bg-black/90 border border-emerald-400/40 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">🎯</div>
              <div>
                <div className="text-[10px] font-mono text-zinc-400 uppercase">ROAS Pauta</div>
                <div className="text-xs font-bold text-white font-display">4.8X PROMEDIO</div>
              </div>
            </div>

            <div className="hero-badge absolute -top-4 right-4 z-20 px-4 py-2 bg-[#ffde59] text-black font-extrabold text-[11px] font-mono uppercase tracking-widest shadow-xl rounded-md">
              ALIADOS DE CRECIMIENTO
            </div>

            <div id="founder-card" className="relative rounded-2xl overflow-hidden border border-[#ffde59]/20 bg-zinc-950 p-2 shadow-[0_0_40px_rgba(250,204,21,0.15)] w-full max-w-md transform-gpu">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80" alt="Director Marea Medios" className="w-full h-[480px] object-cover rounded-xl filter contrast-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 text-xs font-mono text-zinc-400">
                EQUIPO DIRECTIVO ✦ RODAJES 4K & DRON
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MARQUEE ─── */}
      <div className="marquee-container py-4 bg-[#ffde59] text-black overflow-hidden font-black uppercase tracking-widest text-sm select-none border-y-2 border-black">
        <div className="marquee-track flex gap-8 skew-on-scroll">
          {Array(4).fill(["✦ AUDIOVISUAL", "✦ MANEJO DE REDES SOCIALES", "✦ BRANDING DIGITAL", "✦ PAUTA DIGITAL", "✦ COMMUNITY MANAGER", "✦ ESTRATEGIA DE CONTENIDO"]).flat().map((t, i) => <span key={i}>{t}</span>)}
        </div>
      </div>

      {/* ─── SHOWCASE DE REELS / TIKTOK ─── */}
      <section id="reels-showcase" className="py-24 bg-[#08080a] border-b border-white/5 relative overflow-hidden perspective-container">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-yellow-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 sm:px-12 relative z-10">
          <div className="text-center mb-16 reels-header">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-8 h-[2px] bg-[#ffde59]" />
              <span className="text-xs font-mono font-bold tracking-widest text-[#ffde59] uppercase">VIRALIDAD ESTRATÉGICA</span>
              <div className="w-8 h-[2px] bg-[#ffde59]" />
            </div>
            <h2 className="font-display text-4xl sm:text-5xl font-black uppercase text-white mb-4 tracking-tight">
              FORMATOS QUE <span className="text-[#ffde59]">CONECTAN</span>
            </h2>
            <p className="text-zinc-400 text-sm max-w-xl mx-auto font-light">Diseñamos contenido vertical nativo para TikTok e Instagram Reels pensado para retener la atención y generar conversión.</p>
          </div>

          {/* Grid de Videos */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 reels-grid">
            {[
              // IMPORTANTE: Debes colocar tus videos descargados en la carpeta public/videos/ de tu proyecto
              { mp4: "/videos/reel1.mp4", url: "https://www.instagram.com/p/DcUQrsAil-J/", offset: false },
              { mp4: "/videos/reel2.mp4", url: "https://www.instagram.com/p/DfFXO5PlR11/", offset: true },
              { mp4: "/videos/reel3.mp4", url: "https://www.instagram.com/p/DaS7_gLjODY/", offset: false },
              { mp4: "/videos/reel4.mp4", url: "https://www.instagram.com/p/DdpR-rfCSq1/", offset: true }
            ].map((reel, i) => (
              <a
                key={i}
                href={reel.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`reel-card block relative aspect-[9/16] rounded-2xl overflow-hidden group cursor-hover border border-white/10 shadow-2xl transform-gpu bg-zinc-900 ${reel.offset ? 'mt-0 md:mt-12' : ''}`}
              >
                {/* Video Nativo Auto-reproducible y Silenciado */}
                <video
                  src={reel.mp4}
                  autoPlay
                  loop
                  muted
                  playsInline // Vital para que funcione en celulares sin abrirse en pantalla completa
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                />
                
                {/* Gradiente Oscuro Inferior para que resalte el botón */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent pointer-events-none" />

                {/* Botón central al estilo de tu referencia */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                    <Play className="w-6 h-6 text-white fill-white ml-1" />
                  </div>
                </div>

                {/* Botón flotante inferior */}
                <div className="absolute bottom-5 left-0 right-0 flex justify-center pointer-events-none z-10">
                  <span className="px-4 py-2 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-2 border border-white/10 group-hover:border-[#ffde59] group-hover:text-[#ffde59] transition-all shadow-lg">
                    Ver en Instagram ↗
                  </span>
                </div>
              </a>
            ))}
        </div>

          {/* Apartado Mini del Canal */}
          <div className="mt-20 flex justify-center">
            <a href="https://www.instagram.com/mareamedios" target="_blank" rel="noopener noreferrer" className="cursor-hover inline-flex items-center gap-4 px-6 py-3 bg-zinc-900/50 border border-white/10 hover:border-[#ffde59]/50 rounded-full transition-all group backdrop-blur-sm">
              {/* Icono Instagram Gradiente */}
              <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-fuchsia-600 shadow-sm">
                <Instagram className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-white text-sm font-bold font-sans">Síguenos en Instagram</span>
              <span className="hidden sm:inline-block text-zinc-500 text-[10px] font-mono uppercase tracking-widest pl-4 border-l border-white/10 group-hover:text-[#ffde59] transition-colors">
                @mareamedios
              </span>
            </a>
          </div>

        </div>
      </section>

      {/* ─── NOSOTROS ─── */}
      <section id="nosotros" className="py-28 bg-[#f7f7f4] text-[#111] px-6 sm:px-12 relative overflow-hidden perspective-container">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 nosotros-content">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-[2px] bg-black" />
              <span className="text-xs font-mono font-bold tracking-widest text-zinc-600 uppercase">QUIÉNES SOMOS</span>
            </div>

            <h2 className="font-display text-4xl sm:text-6xl font-black uppercase tracking-tight leading-none mb-6">
              NO SOMOS SOLO <br />
              <span className="bg-[#ffde59] px-2 py-0.5 inline-block text-black mt-1">CREADORES</span><br />
              DE CONTENIDO
            </h2>

            <p className="text-zinc-700 text-base sm:text-lg leading-relaxed mb-6 font-medium">
              Marea Medios nace para resolver un problema real: marcas con potencial que se pierden en el ruido digital sin dirección, sin identidad y sin estructura.
            </p>

            <ul className="space-y-3.5 mb-8 text-sm font-bold text-zinc-800">
              {["Estrategia antes que publicaciones", "Producción audiovisual profesional", "Comunicación comercial efectiva", "Diseño visual coherente con tu marca", "Análisis y objetivos medibles"].map((item, i) => (
                <li key={i} className="check-item flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#ffde59] flex items-center justify-center text-xs shadow-md">✓</span> {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-5 relative nosotros-image transform-gpu">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-black bg-black">
              <img src="https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=800&q=80" alt="Collage Marea" className="w-full h-[440px] object-cover grayscale contrast-125 inner-img" />
              <div className="absolute bottom-6 left-6 right-6 bg-[#ffde59] text-black p-4 font-black uppercase text-xs tracking-wider shadow-xl rounded-md transform -skew-x-3">
                SOMOS MOVIMIENTO. SOMOS ESTRATEGIA. SOMOS CRECIMIENTO.
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 gap-6 mt-20 mission-vision">
          <div className="p-8 bg-[#0e0f13] text-white rounded-xl border border-white/10 shadow-2xl mv-card transform transition-all duration-300 hover:scale-[1.03]">
            <h3 className="font-display text-2xl font-black uppercase text-[#ffde59] mb-3">NUESTRA MISIÓN</h3>
            <p className="text-zinc-300 text-sm leading-relaxed">
              Impulsar marcas y profesionales que aún están "escondidos" en el mercado, llevándolos al mundo digital con estrategia, creatividad y contenido de alta calidad.
            </p>
          </div>

          <div className="p-8 bg-[#ffde59] text-black rounded-xl border border-black shadow-2xl mv-card transform transition-all duration-300 hover:scale-[1.03]">
            <h3 className="font-display text-2xl font-black uppercase mb-3">NUESTRA VISIÓN</h3>
            <p className="text-black/90 font-medium text-sm leading-relaxed">
              Ser una de las agencias de contenido y posicionamiento digital más influyentes de Colombia, reconocida por descubrir y visibilizar el talento empresarial de cada región.
            </p>
          </div>
        </div>
      </section>

      {/* ─── SERVICIOS ─── */}
      <section id="servicios" className="py-28 px-6 sm:px-12 max-w-7xl mx-auto perspective-container">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 services-header">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-[2px] bg-[#ffde59]" />
              <span className="text-xs font-mono font-bold tracking-widest text-[#ffde59] uppercase">LO QUE HACEMOS</span>
            </div>
            <h2 className="font-display text-4xl sm:text-6xl font-black uppercase tracking-tight">
              NUESTROS <span className="text-[#ffde59]">SERVICIOS</span>
            </h2>
          </div>
          <p className="text-zinc-400 text-sm max-w-md font-light leading-relaxed">
            No solo creamos contenido. Construimos posicionamiento estratégico que convierte seguidores en clientes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 services-grid">
          {[
            { icon: Video, title: "PRODUCCIÓN AUDIOVISUAL", desc: "Grabación y edición de contenido profesional para redes sociales con cámaras de cine.", tag: "VIDEO & FOTO" },
            { icon: BarChart2, title: "ESTRATEGIA DE CONTENIDO", desc: "Planificación estructurada enfocada en objetivos comerciales y ventas. Pilares y ganchos.", tag: "ESTRATEGIA" },
            { icon: Palette, title: "BRANDING DIGITAL", desc: "Construcción o rediseño de identidad visual coherente y memorable para todos tus canales.", tag: "IDENTIDAD VISUAL" },
            { icon: Smartphone, title: "MANEJO DE REDES", desc: "Gestión estratégica de perfiles digitales, métricas semanales y crecimiento sostenido.", tag: "SOCIAL MEDIA" },
            { icon: Megaphone, title: "PAUTA DIGITAL", desc: "Creación y optimización de campañas pagas en Meta, Instagram y TikTok Ads con ROI.", tag: "PUBLICIDAD" },
            { icon: TrendingUp, title: "COMMUNITY MANAGER", desc: "Gestión activa de tu comunidad digital, respuestas a clientes y relaciones con tu audiencia.", tag: "COMUNIDAD" }
          ].map((srv, i) => (
            <div key={i} onMouseMove={(e) => handleMouseMoveGlow(e, e.currentTarget)} className="service-box glow-card cursor-hover p-8 rounded-xl bg-zinc-950 border border-white/10 flex flex-col justify-between group hover:border-yellow-400/50 transition-colors shadow-lg">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold">{srv.tag}</span>
                  <div className="service-icon transition-transform duration-500 group-hover:rotate-12 group-hover:scale-125">
                    <srv.icon className="w-6 h-6 text-[#ffde59]" />
                  </div>
                </div>
                <h3 className="font-display text-xl font-bold uppercase mb-3 group-hover:text-[#ffde59] transition-colors">{srv.title}</h3>
                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">{srv.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── PROCESO ─── */}
      <section id="proceso" className="py-28 bg-[#f7f7f4] text-[#111] px-6 sm:px-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 proceso-content">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-[2px] bg-black" />
              <span className="text-xs font-mono font-bold tracking-widest text-zinc-600 uppercase">CÓMO TRABAJAMOS</span>
            </div>
            <h2 className="font-display text-4xl sm:text-6xl font-black uppercase tracking-tight mb-8">
              NUESTRO <br /><span className="bg-[#ffde59] px-2 text-black">PROCESO</span><br />DE TRABAJO
            </h2>

            <div className="relative pl-8 space-y-6">
              <div className="absolute left-2 top-2 bottom-2 w-1 bg-zinc-300 rounded-full">
                <div id="timeline-progress" className="w-full bg-[#ffde59] rounded-full h-0 transition-all duration-300 shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
              </div>

              {[
                { num: "01", title: "DIAGNÓSTICO", desc: "Analizamos tu marca, competencia y audiencia. Identificamos oportunidades claras." },
                { num: "02", title: "ESTRATEGIA", desc: "Diseñamos un plan de contenido personalizado con pilares de comunicación medibles." },
                { num: "03", title: "PRODUCCIÓN", desc: "Creamos el contenido: videos, fotografía, diseño gráfico y copy con la más alta calidad." },
                { num: "04", title: "PUBLICACIÓN", desc: "Gestionamos en canales correctos, horarios óptimos y aplicamos pauta publicitaria." }
              ].map((step, i) => (
                <div key={i} className="timeline-step relative p-5 bg-white shadow-lg border border-zinc-100 rounded-xl transform-gpu">
                  <span className="text-yellow-500 font-display font-black text-2xl mr-2">{step.num}</span>
                  <strong className="font-display text-lg uppercase">{step.title}</strong>
                  <p className="text-zinc-600 text-xs sm:text-sm mt-1">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col items-center">
            <div className="diagram-marea bg-black text-white p-8 sm:p-12 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] w-full border border-zinc-800 hover:border-yellow-400/50 transition-colors duration-500 transform-gpu">
              <div className="text-center font-display font-black text-xl sm:text-2xl tracking-widest text-[#ffde59] uppercase mb-8">
                PLAN → CREA → PUBLICA → CRECE
              </div>
              <div className="grid grid-cols-3 gap-4 text-center divide-x divide-zinc-800">
                <div className="stat-item">
                  <div className="font-display text-4xl sm:text-6xl font-black text-[#ffde59]">+50</div>
                  <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider">CLIENTES</span>
                </div>
                <div className="stat-item">
                  <div className="font-display text-4xl sm:text-6xl font-black text-white">100%</div>
                  <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider">COMPROMISO</span>
                </div>
                <div className="stat-item">
                  <div className="font-display text-4xl sm:text-6xl font-black text-[#ffde59]">3</div>
                  <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider">REGIONES</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─── PLANES ─── */}
      <section id="planes" className="py-28 px-6 sm:px-12 max-w-[1400px] mx-auto perspective-container border-t border-white/10">
        <div className="text-center max-w-3xl mx-auto mb-12 planes-header">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-8 h-[2px] bg-[#ffde59]" />
            <span className="text-xs font-mono font-bold tracking-widest text-[#ffde59] uppercase">INVERSIÓN EN TU MARCA</span>
            <div className="w-8 h-[2px] bg-[#ffde59]" />
          </div>
          <h2 className="font-display text-4xl sm:text-6xl font-black uppercase tracking-tight">
            PLANES Y <span className="text-[#ffde59]">PRECIOS</span>
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base mt-4 font-light">
            Elige el plan que mejor se adapte a tus objetivos comerciales. Más opciones para crecer juntos.
          </p>

          <div className="inline-flex items-center gap-4 mt-8 p-1.5 bg-zinc-900 border border-zinc-800 rounded-full shadow-lg">
            <button onClick={() => setIsTrimestral(false)} className={`cursor-hover px-5 py-2 rounded-full text-xs font-bold uppercase transition-all ${!isTrimestral ? "bg-[#ffde59] text-black" : "text-zinc-400 hover:text-white"}`}>
              Facturación Mensual
            </button>
            <button onClick={() => setIsTrimestral(true)} className={`cursor-hover px-5 py-2 rounded-full text-xs font-bold uppercase transition-all flex items-center gap-2 ${isTrimestral ? "bg-[#ffde59] text-black" : "text-zinc-400 hover:text-white"}`}>
              Trimestral <span className="text-[9px] px-1.5 py-0.5 bg-yellow-400/20 text-[#ffde59] rounded-full">-15% OFF</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch pricing-grid">
          {[
            { name: "BÁSICO", desc: "Para negocios que están comenzando.", priceM: "$650.000", priceT: "$552.500", feats: ["5 contenidos para redes", "3 videos comerciales", "2 carruseles", "Manejo de comunidad"], theme: "dark" },
            { name: "ESTÁNDAR", desc: "Para marcas que quieren crecer rápido.", priceM: "$1.500.000", priceT: "$1.275.000", feats: ["10 contenidos para redes", "6 videos comerciales", "4 carruseles", "Manejo total", "Community Manager"], theme: "yellow", tag: "★ MÁS POPULAR" },
            { name: "PREMIUM", desc: "Para posicionamiento total y profesional.", priceM: "$2.700.000", priceT: "$2.295.000", feats: ["15 contenidos al mes", "8 videos profesionales", "4 videos trend", "Página web incluida", "Estrategia Completa"], theme: "dark" },
            { name: "CORPORATIVO", desc: "Para empresas que dominan su sector.", priceM: "$4.500.000", priceT: "$3.825.000", feats: ["20 contenidos al mes", "10 videos cine (4K/Dron)", "Pauta Avanzada (Ads)", "Tienda E-commerce SaaS", "Director de Cuenta"], theme: "elite" }
          ].map((plan, i) => (
            <div key={i} className={`pricing-card p-6 xl:p-8 rounded-2xl flex flex-col justify-between transition-all duration-300 transform-gpu relative ${
              plan.theme === 'yellow' ? 'bg-[#ffde59] text-black border-2 border-black scale-[1.02] hover:scale-105 shadow-[0_0_50px_rgba(250,204,21,0.25)] z-10' :
              plan.theme === 'elite' ? 'bg-gradient-to-b from-zinc-900 to-black border border-yellow-400/30 hover:border-yellow-400 hover:-translate-y-2 overflow-hidden' :
              'bg-zinc-950 border border-white/10 hover:border-yellow-400/40 hover:-translate-y-2'
            }`}>
              {plan.theme === 'elite' && <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-500/10 blur-[40px] rounded-full pointer-events-none" />}
              {plan.tag && <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-black text-[#ffde59] font-mono font-bold text-[10px] px-3 py-1 uppercase tracking-widest rounded-full shadow-lg">{plan.tag}</div>}
              
              <div className="relative z-10">
                <h3 className={`font-display text-xl xl:text-2xl font-black uppercase ${plan.theme === 'yellow' ? 'text-black' : plan.theme === 'elite' ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200' : 'text-white'}`}>{plan.name}</h3>
                <p className={`text-[11px] xl:text-xs mt-2 ${plan.theme === 'yellow' ? 'text-black/80' : 'text-zinc-400'}`}>{plan.desc}</p>
                <div className="my-6">
                  <span className={`font-display text-3xl xl:text-4xl font-black ${plan.theme === 'yellow' ? 'text-black' : plan.theme === 'elite' ? 'text-white' : 'text-[#ffde59]'}`}>
                    {isTrimestral ? plan.priceT : plan.priceM}
                  </span>
                  <span className={`text-xs font-mono block mt-1 ${plan.theme === 'yellow' ? 'text-black/70' : 'text-zinc-500'}`}>COP / mes</span>
                </div>
                <ul className={`space-y-3 text-xs ${plan.theme === 'yellow' ? 'font-semibold text-black' : 'text-zinc-300'}`}>
                  {plan.feats.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2">✓ {feat}</li>
                  ))}
                </ul>
              </div>
              <a href={`https://wa.me/?text=Hola%2C%20quiero%20el%20Plan%20${plan.name}`} target="_blank" rel="noreferrer" className={`cursor-hover relative z-10 mt-8 block text-center py-3.5 font-extrabold text-xs uppercase tracking-wider transition-colors rounded-lg ${
                plan.theme === 'yellow' ? 'bg-black hover:bg-zinc-900 text-[#ffde59] shadow-xl shadow-black/20' :
                plan.theme === 'elite' ? 'bg-white hover:bg-zinc-200 text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]' :
                'bg-yellow-400/10 border border-yellow-400/20 hover:bg-yellow-400 hover:text-black text-yellow-400'
              }`}>
                {plan.theme === 'yellow' ? 'El Más Popular' : plan.theme === 'elite' ? 'Contactar Ventas' : 'Empezar Ahora'}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ─── SAAS INTERACTIVO ─── */}
      <section id="sistemas" className="py-28 px-6 sm:px-12 bg-black border-y border-white/10 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 saas-text-content">
            <span className="text-xs font-mono font-bold tracking-widest text-[#ffde59] uppercase">INFRAESTRUCTURA SAAS PREMIUM</span>
            <h2 className="font-display text-4xl sm:text-6xl font-black uppercase tracking-tight mt-3 mb-6">
              TU PROPIA TIENDA ONLINE BAJO MODELO DE <span className="text-[#ffde59]">SUSCRIPCIÓN</span>
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed mb-8 font-light">
              Le damos superpoderes digitales a tu marca. Accede a una plataforma robusta, ultra rápida y autoadministrable diseñada para multiplicar tus ventas sin costos ocultos de desarrollo.
            </p>

            <div className="flex flex-wrap gap-2 mb-8">
              {[
                { id: 'dashboard', label: '01. Dashboard' },
                { id: 'tienda', label: '02. Tienda Móvil' },
                { id: 'pedidos', label: '03. Checkout' }
              ].map(tab => (
                <button key={tab.id} onClick={() => handleSaasTab(tab.id)} className={`cursor-hover px-4 py-2 text-xs font-mono uppercase font-bold rounded transition-colors ${saasTab === tab.id ? 'bg-[#ffde59] text-black shadow-lg shadow-yellow-400/20' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`}>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3 saas-feature">
                <span className="text-xl">🛍️</span>
                <div>
                  <strong className="font-bold text-white block text-sm">Plataforma Todo en Uno</strong>
                  <p className="text-zinc-400 text-xs">Control de stock, variantes de producto y pedidos centralizados en tiempo real.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 saas-feature">
                <span className="text-xl">💳</span>
                <div>
                  <strong className="font-bold text-white block text-sm">Pasarela de Pagos & Checkout Eficiente</strong>
                  <p className="text-zinc-400 text-xs">Integrado con Wompi, ePayco o MercadoPago para que cobres sin fricción.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 relative saas-image-content">
            <div className="p-3 bg-zinc-900 rounded-2xl border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.9)] transform-gpu hover:rotate-1 transition-transform duration-700">
              <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 text-xs font-mono text-zinc-400">
                <span>{saasTab === 'dashboard' ? 'Tienda Marea — Panel de Control General' : saasTab === 'tienda' ? 'Tienda Marea — Catálogo Móvil Optimizado' : 'Tienda Marea — Módulo de Pedidos y Pasarela'}</span>
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]" />
                  <span className="w-3 h-3 rounded-full bg-yellow-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]" />
                  <span className="w-3 h-3 rounded-full bg-green-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]" />
                </div>
              </div>
              <div className="relative h-80 overflow-hidden rounded-xl mt-2 bg-zinc-950 flex items-center justify-center">
                <img 
                  src={saasTab === 'dashboard' ? '/images/dashboard.png' : saasTab === 'tienda' ? '/images/tienda.png' : '/images/orders.png'} 
                  alt="SaaS Preview" 
                  className={`w-full h-full object-cover transition-all duration-400 ${isSaasChanging ? 'opacity-0 blur-md scale-95' : 'opacity-100 blur-0 scale-100'}`} 
                />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─── TESTIMONIOS ─── */}
      <section id="testimonios" className="py-28 px-6 sm:px-12 max-w-7xl mx-auto perspective-container">
        <div className="text-center max-w-3xl mx-auto mb-16 testimonios-header">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-8 h-[2px] bg-[#ffde59]" />
            <span className="text-xs font-mono font-bold tracking-widest text-[#ffde59] uppercase">LO QUE DICEN NUESTROS CLIENTES</span>
            <div className="w-8 h-[2px] bg-[#ffde59]" />
          </div>
          <h2 className="font-display text-4xl sm:text-6xl font-black uppercase tracking-tight">
            ELLOS YA <span className="text-[#ffde59]">CRECIERON</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { q: "Marea Medios transformó completamente la presencia digital de nuestro restaurante. Ahora tenemos una imagen profesional y nuestras ventas crecieron notablemente.", a: "CARLOS M.", r: "Propietario, Restaurante", l: "C" },
            { q: "Antes publicaba sin dirección y sin resultados. Con Marea tengo una estrategia clara, contenido de calidad y clientes que llegan por redes sociales directamente.", a: "LAURA P.", r: "Marca Personal", l: "L" },
            { q: "El equipo de Marea entiende el negocio, no solo las redes. Eso hace la diferencia. Son aliados reales de crecimiento para cualquier empresa.", a: "ANDRÉS R.", r: "Gerente de Servicios", l: "A" }
          ].map((t, i) => (
            <div key={i} className="testimonial-card p-8 bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-3xl flex flex-col justify-between hover:-translate-y-4 hover:border-yellow-400/50 hover:shadow-[0_20px_40px_rgba(250,204,21,0.1)] transition-all duration-500 transform-gpu">
              <div>
                <div className="text-[#ffde59] font-display text-6xl font-black mb-2 opacity-50">“</div>
                <p className="text-zinc-300 text-sm italic leading-relaxed">"{t.q}"</p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/10 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-[#ffde59] flex items-center justify-center font-bold font-display text-white">{t.l}</div>
                <div>
                  <strong className="font-display font-bold text-[#ffde59] block uppercase leading-tight">{t.a}</strong>
                  <span className="text-[10px] text-zinc-400 block uppercase">{t.r}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="pt-16 pb-12 bg-black border-t border-white/10 overflow-hidden relative">
        <div className="py-4 overflow-hidden mb-12 select-none border-b border-white/5">
          <div className="marquee-track font-display text-6xl sm:text-8xl font-black uppercase tracking-tighter text-zinc-800 gap-8">
            <span className="hover:text-[#ffde59] transition-colors">SOMOS LA MAREA QUE MUEVE MARCAS ✦</span>
            <span className="text-white">MAREA MEDIOS ✦</span>
            <span className="hover:text-[#ffde59] transition-colors">ESTRATEGIA ✦ PRODUCCIÓN ✦ SOFTWARE ✦</span>
            <span className="text-white">MAREA MEDIOS ✦</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12 text-xs footer-content">
          <div className="md:col-span-2">
            <div className="font-display font-black text-2xl tracking-tighter mb-4 flex items-center gap-2 footer-logo">
              MAREA<span className="text-[#ffde59]">MEDIOS</span>
            </div>
            <p className="text-zinc-400 max-w-sm leading-relaxed mb-4">
              Agencia de contenido digital estratégica. Convertimos marcas pequeñas en marcas con presencia sólida en Colombia.
            </p>
            <span className="font-mono text-[#ffde59] uppercase text-[11px]">SÍGUENOS EN REDES:</span>
            <div className="flex gap-4 mt-2 text-zinc-400">
              <a href="#" className="cursor-hover hover:text-[#ffde59] transition-colors">Instagram</a>
              <a href="#" className="cursor-hover hover:text-[#ffde59] transition-colors">Facebook</a>
              <a href="#" className="cursor-hover hover:text-[#ffde59] transition-colors">YouTube</a>
            </div>
          </div>

          <div>
            <span className="font-mono text-[#ffde59] uppercase font-bold tracking-wider block mb-4">NAVEGACIÓN</span>
            <ul className="space-y-2 text-zinc-400">
              {['Inicio', 'Nosotros', 'Servicios', 'Proceso', 'Planes', 'Sistemas'].map(item => (
                <li key={item}><button onClick={() => scrollToSection(`#${item.toLowerCase()}`)} className="cursor-hover hover:text-white transition-colors">{item}</button></li>
              ))}
              <li><Link href="/blog" className="cursor-hover hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/login" title="Iniciar Sesión">Iniciar Sesión</Link></li>
            </ul>
          </div>

          <div>
            <span className="font-mono text-[#ffde59] uppercase font-bold tracking-wider block mb-4">SERVICIOS</span>
            <ul className="space-y-2 text-zinc-400">
              <li>Producción Audiovisual</li>
              <li>Estrategia de Contenido</li>
              <li>Branding Digital</li>
              <li>Manejo de Redes Sociales</li>
              <li>Pauta Digital</li>
              <li>Community Manager</li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center text-xs font-mono text-zinc-500 gap-4 footer-bottom">
          <div>© 2026 MAREA MEDIOS. TODOS LOS DERECHOS RESERVADOS.</div>
          <div>BOGOTÁ ✦ CUNDINAMARCA ✦ TOLIMA ✦ HUILA ✦ COLOMBIA</div>
        </div>
      </footer>

      {/* Mantenemos tu Widget Original Abajo (puedes borrar el <a> superior si este te gusta más) */}
      <WhatsAppWidget />
      
    </div>
    </>
  )
}