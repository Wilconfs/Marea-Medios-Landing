'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Users, DollarSign, ShoppingCart, Package, Star } from 'lucide-react'
import { KpiCard } from '@/components/admin/kpi-card'
import { SalesChart } from '@/components/admin/sales-chart'
import { formatPrice, formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'

type Stats = {
  totalCustomers: number
  totalOrders: number
  totalSales: number
  totalProducts: number
  monthly: { month: number; total: number }[]
  topProducts: {
    id: string
    name: string
    imageUrl: string
    rating: number
    soldCount: number
    price: number
  }[]
  recentOrders: {
    id: string
    total: number
    status: string
    createdAt: string
    customerName: string | null
    user: { name: string } | null
  }[]
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  CONFIRMED: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  SHIPPED: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
  DELIVERED: 'bg-green-500/10 text-green-700 dark:text-green-400',
  CANCELLED: 'bg-red-500/10 text-red-700 dark:text-red-400',
}

export function DashboardView() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((d) => setStats(d))
      .finally(() => setLoading(false))
  }, [])

  if (loading || !stats) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-card" />
          ))}
        </div>
        <div className="h-72 animate-pulse rounded-lg bg-card" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPIs - Usando 'label' para evitar errores de TypeScript */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Clientes"
          value={formatNumber(stats.totalCustomers)}
          icon={Users}
          iconBg="bg-blue-500/10 text-blue-600 dark:text-blue-400"
          //delta="7%"
          trend="up"
        />
        <KpiCard
          label="Ventas Totales"
          value={formatPrice(stats.totalSales)}
          icon={DollarSign}
          iconBg="bg-green-500/10 text-green-600 dark:text-green-400"
          //delta="7%"
          trend="up"
        />
        <KpiCard
          label="Pedidos"
          value={formatNumber(stats.totalOrders)}
          icon={ShoppingCart}
          iconBg="bg-amber-500/10 text-amber-600 dark:text-amber-400"
          //delta="3.5%"
          trend="down"
        />
        <KpiCard
          label="Productos activos"
          value={formatNumber(stats.totalProducts)}
          icon={Package}
          iconBg="bg-purple-500/10 text-purple-600 dark:text-purple-400"
        />
      </div>

      {/* Sales chart */}
      <div
        className="rounded-lg bg-card p-5"
        style={{ boxShadow: 'var(--shadow-sm)' }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Ingresos por mes</h2>
          <span className="text-xs text-muted-foreground">Últimos 12 meses</span>
        </div>
        <SalesChart data={stats.monthly} />
      </div>

      {/* Top products + Recent orders */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div
          className="rounded-lg bg-card p-5 lg:col-span-3"
          style={{ boxShadow: 'var(--shadow-sm)' }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Más vendidos</h2>
            <Link
              href="/admin/products"
              className="text-xs font-medium text-primary hover:underline"
            >
              Ver todos
            </Link>
          </div>
          <div className="space-y-3">
            {stats.topProducts.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Aún no hay productos.
              </p>
            ) : (
              stats.topProducts.map((p, i) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-secondary"
                >
                  <span className="w-5 text-center text-xs font-semibold text-muted-foreground">
                    {i + 1}
                  </span>
                  <div className="relative h-10 w-10 overflow-hidden rounded-md bg-muted">
                    {p.imageUrl && (
                      <Image
                        /* LA CORRECCIÓN: split para manejar múltiples URLs */
                        src={p.imageUrl.split(',')[0]}
                        alt={p.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    )}
                  </div>
                  <div className="flex-1 truncate">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        {p.rating?.toFixed(1) ?? '0.0'}
                      </span>
                      <span>•</span>
                      <span>{formatNumber(p.soldCount)} vendidos</span>
                    </div>
                  </div>
                  <p className="font-mono text-sm font-semibold">
                    {formatPrice(p.price)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div
          className="rounded-lg bg-card p-5 lg:col-span-2"
          style={{ boxShadow: 'var(--shadow-sm)' }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Pedidos recientes</h2>
            <Link
              href="/admin/orders"
              className="text-xs font-medium text-primary hover:underline"
            >
              Ver todos
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentOrders.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Aún no hay pedidos.
              </p>
            ) : (
              stats.recentOrders.map((o) => (
                <Link
                  key={o.id}
                  href={`/admin/orders/${o.id}`}
                  className="flex items-center justify-between gap-2 rounded-md p-2 transition-colors hover:bg-secondary"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {o.customerName ?? o.user?.name ?? 'Invitado'}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      #{o.id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-semibold">
                      {formatPrice(o.total)}
                    </p>
                    <span
                      className={cn(
                        'mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold',
                        STATUS_COLOR[o.status] ?? '',
                      )}
                    >
                      {STATUS_LABEL[o.status] ?? o.status}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}