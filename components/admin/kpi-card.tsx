'use client'

import type { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export function KpiCard({
  label,
  value,
  delta,
  trend,
  icon: Icon,
  iconBg,
}: {
  label: string
  value: string
  delta?: string
  trend?: 'up' | 'down'
  icon: LucideIcon
  iconBg: string
}) {
  return (
    <div
      className="rounded-lg bg-card p-5"
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      <div className="flex items-start justify-between">
        <div
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-lg',
            iconBg,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        {delta && (
          <span
            className={cn(
              'flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold',
              trend === 'up'
                ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                : 'bg-red-500/10 text-red-600 dark:text-red-400',
            )}
          >
            {trend === 'up' ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {delta}
          </span>
        )}
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold tracking-tight">
        {value}
      </p>
    </div>
  )
}
