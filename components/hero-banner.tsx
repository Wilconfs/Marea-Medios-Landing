'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Tag, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

// 1. Array de 5 slides con la estructura exacta que requiere tu componente
const SLIDES = [
  {
    id: 1,
    tag: '#MasterRace2026',
    title: 'Potencia Sin Límites',
    subtitle: 'Hardware de Última Generación',
    description: 'Arma o actualiza tu setup con las mejores tarjetas gráficas, procesadores y componentes del mercado con garantía oficial.',
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?q=80&w=2070&auto=format&fit=crop',
    color: 'from-zinc-900 via-slate-800 to-zinc-950', // Gradiente oscuro premium / setup gamer
    link: '#productos'
  },
  {
    id: 2,
    tag: '#RGBPeripherals',
    title: 'Inmersión Total',
    subtitle: 'Periféricos Premium',
    description: 'Domina cada partida con teclados mecánicos, ratones de alta precisión y monitores con tasas de refresco brutales.',
    image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=2080&auto=format&fit=crop',
    color: 'from-purple-900 via-indigo-950 to-slate-950', // Gradiente cyberpunk / nocturno
    link: '#productos'
  },
  {
    id: 3,
    tag: '#GarantiaDirecta',
    title: 'Respaldo Absoluto',
    subtitle: 'Componentes Asegurados',
    description: 'Compra con la total tranquilidad de contar con soporte técnico especializado local y cobertura directa de fábrica.',
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?q=80&w=2070&auto=format&fit=crop',
    color: 'from-blue-950 via-slate-900 to-indigo-950', // Gradiente azul tecnológico
    link: '#productos'
  },
  {
    id: 4,
    tag: '#AsesoriaCustom',
    title: 'Armado a tu Medida',
    subtitle: 'Compatibilidad 100%',
    description: '¿Dudas de hardware? Te guiamos de forma personalizada para que configures la workstation de desarrollo o PC gaming que sueñas.',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop',
    color: 'from-slate-900 via-emerald-950 to-slate-900', // Gradiente verde Matrix / Workspace
    link: '#productos'
  },
  {
    id: 5,
    tag: '#EnviosPriority',
    title: 'Logística Segura',
    description: 'Recibe todo el hardware directamente en tu puerta en Bogotá en tiempo récord, con empaque blindado de alta protección.',
    subtitle: 'Envíos Rápidos y Asegurados',
    image: 'https://images.unsplash.com/photo-1566241477600-ac026ad43874?q=80&w=2092&auto=format&fit=crop',
    color: 'from-indigo-950 via-slate-900 to-purple-950', // Gradiente índigo violeta
    link: '#productos'
  }
];

export function HeroBanner() {
  const [current, setCurrent] = useState(0)

  // 2. Lógica de carrusel automático (cambia cada 6 segundos)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1))
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => setCurrent((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1))
  const prevSlide = () => setCurrent((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1))

  return (
    /* Corregida la doble declaración de 'relative' en el container */
    <section className="group relative h-[520px] w-[100vw] left-[50%] right-[50%] -translate-x-[50%] overflow-hidden bg-card lg:h-[640px] select-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          // 👇 HABILITAMOS EL DRAG DE FRAMER MOTION PARA RATÓN Y PANTALLAS TÁCTILES
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.6}
          onDragEnd={(e, info) => {
            if (info.offset.x < -100) {
              nextSlide()
            } else if (info.offset.x > 100) {
              prevSlide()
            }
          }}
          className={`absolute inset-0 flex h-full w-full bg-gradient-to-r ${SLIDES[current].color} px-6 py-12 md:px-12 cursor-grab active:cursor-grabbing`}
        >
          
          {/* Fondo Decorativo */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          
          <div className="mx-auto grid h-full w-full max-w-7xl items-center gap-8 md:grid-cols-2 relative z-10">
            {/* TEXTO */}
            <motion.div
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md text-white">
                <Tag className="h-3.5 w-3.5" /> {SLIDES[current].tag}
              </span>
              <h1 className="mt-4 font-display text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                {SLIDES[current].title}
                <span className="mt-2 block bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
                  {SLIDES[current].subtitle}
                </span>
              </h1>
              <p className="mt-4 max-w-md text-base text-white/90 sm:text-lg pointer-events-none">
                {SLIDES[current].description}
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 shadow-lg">
                  <Link href={SLIDES[current].link}>
                    Comprar ahora <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </motion.div>

            {/* IMAGEN PRINCIPAL */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="relative hidden h-full w-full md:block pointer-events-none select-none"
            >
              <div className="relative h-[85%] w-full overflow-hidden rounded-2xl border border-white/20 shadow-2xl">
                <Image
                  src={SLIDES[current].image}
                  alt={SLIDES[current].title}
                  fill
                  className="object-cover pointer-events-none select-none"
                  priority
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controles de Navegación (Fijos y visibles para Móvil y PC) */}
      <button 
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/20 p-2 text-white backdrop-blur-md transition-all hover:bg-black/40 z-30 flex items-center justify-center opacity-100"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/20 p-2 text-white backdrop-blur-md transition-all hover:bg-black/40 z-30 flex items-center justify-center opacity-100"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Indicadores (Puntos abajo actualizados dinámicamente para los 5 elementos) */}
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2 z-30">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all ${
              current === i ? 'w-8 bg-white' : 'w-2 bg-white/40'
            }`}
          />
        ))}
      </div>
    </section>
  )
}