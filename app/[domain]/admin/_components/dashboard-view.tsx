'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Users, DollarSign, ShoppingCart, Package, Star, AlertTriangle, BarChart3 } from 'lucide-react'
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
    stock?: number // 👈 AGREGA ESTA LÍNEA
    isActive: boolean // 👈 AGREGAR ESTA LÍNEA
  }[]
  recentOrders: {
    id: string;
    total: number;
    status: string;
    createdAt: string;
    customerName: string | null;
    user: { name: string } | null;
  }[]
  salesByCategory: { name: string; value: number }[]
  ordersByStatus: { status: string; count: number }[]
  lowStockAlerts: { id: string; name: string; stock: number }[]
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

  const maxCategoryValue = Math.max(...stats.salesByCategory.map(c => c.value), 1)

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Clientes"
          value={formatNumber(stats.totalCustomers)}
          icon={Users}
          iconBg="bg-blue-500/10 text-blue-600 dark:text-blue-400"
          trend="up"
        />
        <KpiCard
          label="Ventas Totales"
          value={formatPrice(stats.totalSales)}
          icon={DollarSign}
          iconBg="bg-green-500/10 text-green-600 dark:text-green-400"
          trend="up"
        />
        <KpiCard
          label="Pedidos"
          value={formatNumber(stats.totalOrders)}
          icon={ShoppingCart}
          iconBg="bg-amber-500/10 text-amber-600 dark:text-amber-400"
          trend="down"
        />
        <KpiCard
          label="Productos activos"
          value={formatNumber(stats.totalProducts)}
          icon={Package}
          iconBg="bg-purple-500/10 text-purple-600 dark:text-purple-400"
        />
      </div>

      {/* SECCIÓN DE GRÁFICOS EQUILIBRADOS */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Gráfico Izquierdo: Ingresos por mes */}
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

        {/* Componente Derecho: Distribución por Categorías */}
        <div
          className="rounded-lg bg-card p-5"
          style={{ boxShadow: 'var(--shadow-sm)' }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Ventas por Categoría</h2>
            <span className="text-xs text-muted-foreground">Distribución comercial</span>
          </div>
          
          <div className="space-y-4 overflow-y-auto max-h-[260px] pr-2">
            {stats.salesByCategory.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                Sin ventas registradas por categoría aún.
              </p>
            ) : (
              stats.salesByCategory.map((cat) => {
                const percentage = (cat.value / maxCategoryValue) * 100
                return (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{cat.name}</span>
                      <span className="font-mono font-semibold text-slate-900 dark:text-white">
                        {formatPrice(cat.value)}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-primary h-full transition-all duration-500 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* DETALLES OPERATIVOS ADICIONALES */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Pedidos agrupados por Estado */}
        <div 
          className="rounded-lg bg-card p-5 lg:col-span-2"
          style={{ boxShadow: 'var(--shadow-sm)' }}
        >
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-slate-500" />
            <h2 className="font-display text-lg font-semibold">Estado de Pedidos</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {stats.ordersByStatus.map((item) => (
              <div key={item.status} className="p-3 bg-secondary/40 rounded-xl border border-secondary flex flex-col justify-between">
                <span className={cn(
                  'inline-block self-start rounded-full px-2 py-0.5 text-[10px] font-semibold',
                  STATUS_COLOR[item.status] ?? ''
                )}>
                  {STATUS_LABEL[item.status] ?? item.status}
                </span>
                <span className="text-2xl font-bold font-mono mt-2 text-slate-800 dark:text-white">
                  {item.count}
                </span>
              </div>
            ))}
            {stats.ordersByStatus.length === 0 && (
              <p className="col-span-2 py-6 text-center text-sm text-muted-foreground">No hay registro de órdenes.</p>
            )}
          </div>
        </div>

        {/* Alertas críticas de Stock */}
        <div 
          className="rounded-lg bg-card p-5 lg:col-span-3"
          style={{ boxShadow: 'var(--shadow-sm)' }}
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <h2 className="font-display text-lg font-semibold">Alertas de Inventario Bajo</h2>
            </div>
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
              Stock &le; 5 unids
            </span>
          </div>
          <div className="divide-y divide-secondary">
            {stats.lowStockAlerts.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                🎉 ¡Excelente! Todos los productos tienen buen stock.
              </p>
            ) : (
              stats.lowStockAlerts.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-[70%]">
                    {item.name}
                  </span>
                  <span className={cn(
                    "font-mono text-xs font-bold px-2 py-1 rounded-md",
                    item.stock === 0 ? "bg-red-500/10 text-red-600" : "bg-amber-500/10 text-amber-600"
                  )}>
                    {item.stock === 0 ? "Agotado" : `${item.stock} unidades`}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Secciones inferiores intactas */}
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
                        src={p.imageUrl.split(',')[0]}
                        alt={p.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    )}
                  </div>
                  <div className="flex-1 truncate">
  <p className="truncate text-sm font-medium text-slate-800">{p.name}</p>
  <div className="flex items-center gap-2 text-xs text-muted-foreground">
    <span className="font-medium text-slate-600">
      {formatNumber(p.soldCount ?? 0)} vendidos
    </span>
    <span>•</span>
    
    {/* ⚡ LÓGICA DIRECTA Y REAL DESDE LA BASE DE DATOS */}
    {!p.isActive ? (
      <span className="font-semibold text-slate-400">Desactivado</span>
    ) : p.stock === 0 ? (
      <span className="font-semibold text-rose-500">Sin stock</span>
    ) : (
      <span className="font-medium text-emerald-600">Disponible</span>
    )}
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