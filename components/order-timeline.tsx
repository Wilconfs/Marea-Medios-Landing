'use client'

import { CheckCircle2, Clock, Package, Truck, Home, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

const STEPS: Array<{
  key: OrderStatus
  label: string
  icon: typeof Clock
}> = [
  { key: 'PENDING', label: 'Recibido', icon: Clock },
  { key: 'CONFIRMED', label: 'Preparando', icon: Package },
  { key: 'SHIPPED', label: 'Enviado', icon: Truck },
  { key: 'DELIVERED', label: 'Entregado', icon: Home },
]

export function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === 'CANCELLED') {
    return (
      <div className="flex items-center gap-3 rounded-md bg-red-500/10 p-4">
        <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
        <div>
          <p className="font-semibold text-red-700 dark:text-red-400">Pedido cancelado</p>
          <p className="text-sm text-red-600/80 dark:text-red-400/80">
            Este pedido ha sido cancelado.
          </p>
        </div>
      </div>
    )
  }

  const currentIdx = STEPS.findIndex((s) => s.key === status)

  return (
    <div className="w-full">
      <div className="flex items-start justify-between gap-2">
        {STEPS.map((step, i) => {
          const Icon = step.icon
          const done = i <= currentIdx
          const active = i === currentIdx
          return (
            <div key={step.key} className="flex flex-1 flex-col items-center text-center">
              <div className="flex w-full items-center">
                {/* Left line (hidden on first) */}
                <div
                  className={cn(
                    'h-1 flex-1 rounded',
                    i === 0 ? 'invisible' : done ? 'bg-primary' : 'bg-border',
                  )}
                />
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all',
                    done
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground',
                    active && 'ring-4 ring-primary/20',
                  )}
                >
                  {done && !active ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <div
                  className={cn(
                    'h-1 flex-1 rounded',
                    i === STEPS.length - 1
                      ? 'invisible'
                      : i < currentIdx
                      ? 'bg-primary'
                      : 'bg-border',
                  )}
                />
              </div>
              <p
                className={cn(
                  'mt-2 text-xs font-medium',
                  done ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {step.label}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
