'use client'

import { useEffect, useState } from 'react'
import { Loader2, Save, MessageCircle, CreditCard, Store } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type Settings = {
  storeName: string
  whatsappNumber: string
  paymentMethod: string // 'whatsapp' | 'mercadopago'
  currency: string
}

const DEFAULTS: Settings = {
  storeName: 'EcomDash',
  whatsappNumber: '573001234567',
  paymentMethod: 'whatsapp',
  currency: 'COP',
}

export function SettingsView() {
  const [data, setData] = useState<Settings>(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d && typeof d === 'object' && !d.error) {
          setData({
            storeName: d.storeName ?? DEFAULTS.storeName,
            whatsappNumber: d.whatsappNumber ?? DEFAULTS.whatsappNumber,
            paymentMethod: d.paymentMethod ?? DEFAULTS.paymentMethod,
            currency: d.currency ?? DEFAULTS.currency,
          })
        }
      })
      .finally(() => setLoading(false))
  }, [])

  async function save() {
    if (!data.storeName.trim()) {
      toast.error('El nombre de la tienda es obligatorio')
      return
    }
    const cleanWa = data.whatsappNumber.replace(/[^\d]/g, '')
    if (cleanWa.length < 10) {
      toast.error('Teléfono de WhatsApp inválido')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            storeName: data.storeName.trim(),
            whatsappNumber: cleanWa,
            paymentMethod: data.paymentMethod,
            currency: data.currency,
          },
        }),
      })
      if (!res.ok) throw new Error()
      toast.success('Configuración guardada')
    } catch {
      toast.error('No se pudo guardar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Configuración</h1>
        <p className="text-sm text-muted-foreground">
          Ajustes globales de la tienda
        </p>
      </div>

      {/* Store info */}
      <div
        className="rounded-lg bg-card p-6"
        style={{ boxShadow: 'var(--shadow-sm)' }}
      >
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Store className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-base font-semibold">Información de la tienda</h2>
            <p className="text-xs text-muted-foreground">
              Datos básicos visibles en la tienda
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="storeName">Nombre de la tienda</Label>
            <Input
              id="storeName"
              value={data.storeName}
              onChange={(e) => setData({ ...data, storeName: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="currency">Moneda</Label>
            <Input
              id="currency"
              value={data.currency}
              onChange={(e) => setData({ ...data, currency: e.target.value.toUpperCase() })}
              maxLength={3}
            />
          </div>
        </div>
      </div>

      {/* WhatsApp */}
      <div
        className="rounded-lg bg-card p-6"
        style={{ boxShadow: 'var(--shadow-sm)' }}
      >
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-green-500/10 text-green-600 dark:text-green-400">
            <MessageCircle className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-base font-semibold">WhatsApp</h2>
            <p className="text-xs text-muted-foreground">
              Número al que llegarán los pedidos
            </p>
          </div>
        </div>
        <div>
          <Label htmlFor="whatsappNumber">Número (con código de país, sin +)</Label>
          <Input
            id="whatsappNumber"
            value={data.whatsappNumber}
            onChange={(e) => setData({ ...data, whatsappNumber: e.target.value })}
            placeholder="573001234567"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Ejemplo Colombia: 57 + 3001234567 → 573001234567
          </p>
        </div>
      </div>

      {/* Payment method */}
      <div
        className="rounded-lg bg-card p-6"
        style={{ boxShadow: 'var(--shadow-sm)' }}
      >
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <CreditCard className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-base font-semibold">Método de pago</h2>
            <p className="text-xs text-muted-foreground">
              Define cómo los clientes finalizan su compra
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setData({ ...data, paymentMethod: 'whatsapp' })}
            className={cn(
              'flex flex-col items-start rounded-lg border-2 p-4 text-left transition-all',
              data.paymentMethod === 'whatsapp'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50',
            )}
          >
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-600" />
              <span className="font-display font-semibold">Pedido por WhatsApp</span>
              {data.paymentMethod === 'whatsapp' && (
                <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                  ACTIVO
                </span>
              )}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              El carrito genera un mensaje de WhatsApp con el detalle del pedido al número del comercio.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setData({ ...data, paymentMethod: 'mercadopago' })}
            className={cn(
              'flex flex-col items-start rounded-lg border-2 p-4 text-left transition-all',
              data.paymentMethod === 'mercadopago'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50',
            )}
          >
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <span className="font-display font-semibold">Mercado Pago</span>
              {data.paymentMethod === 'mercadopago' && (
                <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                  ACTIVO
                </span>
              )}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Pagos con tarjeta, Nequi y Daviplata. Requiere configurar credenciales (próximamente).
            </p>
          </button>
        </div>

        {data.paymentMethod === 'mercadopago' && (
          <div className="mt-4 rounded-md bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">
            ⚠️ La integración con Mercado Pago requiere claves de API. Mientras se configura, los pedidos seguirán usando WhatsApp como respaldo.
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} size="lg">
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Guardar cambios
        </Button>
      </div>
    </div>
  )
}
