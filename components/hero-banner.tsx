'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden rounded-lg" style={{ boxShadow: 'var(--shadow-md)' }}>
      <div className="relative grid items-center gap-6 bg-gradient-to-br from-primary via-blue-600 to-blue-800 p-6 text-primary-foreground sm:p-10 md:grid-cols-2 md:gap-4 md:p-12">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
            <Tag className="h-3.5 w-3.5" /> #BigFashionSale
          </span>
          <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
            ¡Oferta por Tiempo Limitado!
            <span className="mt-2 block bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
              Hasta 50% OFF
            </span>
          </h1>
          <p className="mt-3 max-w-md text-sm text-white/85 sm:text-base">
            Renueva tu estilo con descuentos imperdibles en moda, calzado y
            accesorios.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
              <Link href="/?flashSale=true">
                Ver ofertas <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="glass-dark" className="text-white">
              <Link href="#productos">Explorar tienda</Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative z-10 hidden md:block"
        >
          <div
            className="relative ml-auto aspect-[4/3] w-full max-w-md overflow-hidden rounded-lg bg-white/10"
            style={{ boxShadow: 'var(--shadow-lg)' }}
          >
            <Image
              src="https://cdn.abacus.ai/images/9ab4aeaa-f741-4054-b137-a7ea64a06f41.png"
              alt="Camisetas dobladas y zapatillas blancas"
              fill
              sizes="(max-width: 768px) 100vw, 500px"
              className="object-cover"
              priority
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
