'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Tag, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

// 1. Definimos los slides (puedes cambiar las imágenes y textos fácilmente)
const SLIDES = [
  {
    id: 1,
    tag: '#BigFashionSale',
    title: '¡Oferta por Tiempo Limitado!',
    subtitle: 'Hasta 50% OFF',
    description: 'Renueva tu estilo con descuentos imperdibles en moda, calzado y accesorios.',
    image: 'https://cdn.abacus.ai/images/9ab4aeaa-f741-4054-b137-a7ea64a06f41.png',
    color: 'from-blue-600 via-blue-700 to-blue-900',
    link: '/?flashSale=true'
  },
  {
    id: 2,
    tag: '#NuevaColeccion',
    title: 'Estilo que te Define',
    subtitle: 'Temporada 2024',
    description: 'Descubre las tendencias que están marcando el paso este año.',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop',
    color: 'from-purple-600 via-indigo-700 to-indigo-900',
    link: '#productos'
  }
]

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
    <section className="group relative h-[450px] w-full overflow-hidden rounded-xl shadow-xl lg:h-[520px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className={`relative h-full w-full bg-gradient-to-br ${SLIDES[current].color} p-6 sm:p-10 md:p-16`}
        >
          {/* Fondo Decorativo */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          
          <div className="relative z-10 grid h-full items-center gap-8 md:grid-cols-2">
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
              <p className="mt-4 max-w-md text-base text-white/90 sm:text-lg">
                {SLIDES[current].description}
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 shadow-lg">
                  <Link href={SLIDES[current].link}>
                    Comprar ahora <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm">
                  <Link href="#productos">Explorar</Link>
                </Button>
              </div>
            </motion.div>

            {/* IMAGEN PRINCIPAL */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="relative hidden h-full w-full md:block"
            >
              <div className="relative h-full w-full overflow-hidden rounded-2xl border border-white/20 shadow-2xl">
                <Image
                  src={SLIDES[current].image}
                  alt={SLIDES[current].title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controles de Navegación (aparecen al hacer hover) */}
      <button 
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/20 p-2 text-white opacity-0 backdrop-blur-md transition-opacity hover:bg-black/40 group-hover:opacity-100"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/20 p-2 text-white opacity-0 backdrop-blur-md transition-opacity hover:bg-black/40 group-hover:opacity-100"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Indicadores (Puntos abajo) */}
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
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