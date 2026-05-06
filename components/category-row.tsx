'use client'

import Link from 'next/link'
import {
  Shirt,
  Wind,
  Layers,
  Ruler,
  ShoppingBag,
  Footprints,
  LayoutGrid,
  type LucideIcon,
} from 'lucide-react'
import { motion } from 'framer-motion'

const iconMap: Record<string, LucideIcon> = {
  Shirt,
  Wind,
  Layers,
  Ruler,
  ShoppingBag,
  Footprints,
  LayoutGrid,
}

interface Category {
  id: string
  name: string
  slug: string
  icon: string
}

export function CategoryRow({
  categories,
  activeSlug,
}: {
  categories: Category[]
  activeSlug?: string
}) {
  const safe = categories ?? []
  return (
    <div className="rounded-lg bg-card p-4 sm:p-6" style={{ boxShadow: 'var(--shadow-sm)' }}>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-7">
        <CategoryButton
          href="/"
          icon={LayoutGrid}
          label="Todos"
          active={!activeSlug}
          delay={0}
        />
        {safe.map((c, i) => {
          const Icon = iconMap[c?.icon] ?? Shirt
          return (
            <CategoryButton
              key={c?.id}
              href={`/?category=${encodeURIComponent(c?.slug ?? '')}`}
              icon={Icon}
              label={c?.name ?? ''}
              active={activeSlug === c?.slug}
              delay={(i + 1) * 0.04}
            />
          )
        })}
      </div>
    </div>
  )
}

function CategoryButton({
  href,
  icon: Icon,
  label,
  active,
  delay,
}: {
  href: string
  icon: LucideIcon
  label: string
  active?: boolean
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: delay ?? 0 }}
    >
      <Link
        href={href}
        className={`group flex flex-col items-center gap-2 rounded-lg p-3 transition-colors duration-fast ${
          active
            ? 'bg-primary/10 text-primary'
            : 'hover:bg-secondary text-foreground'
        }`}
      >
        <span
          className={`flex h-12 w-12 items-center justify-center rounded-full transition-transform duration-normal group-hover:scale-110 ${
            active
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-foreground'
          }`}
        >
          <Icon className="h-5 w-5" />
        </span>
        <span className="text-xs font-medium">{label}</span>
      </Link>
    </motion.div>
  )
}
