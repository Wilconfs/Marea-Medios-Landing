'use client'

import { useEffect, useState } from 'react'
import { Loader2, Save, MessageCircle, CreditCard, Store, Sliders } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type Settings = {
  storeName: string
  whatsappNumber: string
  paymentMethod: string 
  currency: string
}

type ModuleItem = {
  id: string
  code: string
  name: string
  description: string | null
  isActive: boolean
}

const DEFAULTS: Settings = {
  storeName: 'Tienda Marea',
  whatsappNumber: '573001234567',
  paymentMethod: 'whatsapp',
  currency: 'COP',
}

export function SettingsView() {
  const [data, setData] = useState<Settings>(DEFAULTS)
  const [modules, setModules] = useState<ModuleItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [updatingModuleId, setUpdatingModuleId] = useState<string | null>(null)

  // 📡 CARGA INICIAL: El backend deduce quién eres por tu sesión
  useEffect(() => {
    async function loadData() {
      try {
        // 1. Cargar configuraciones básicas globales
        const settingsRes = await fetch('/api/admin/settings')
        const settingsData = await settingsRes.json()
        
        if (settingsData && typeof settingsData === 'object' && !settingsData.error) {
          setData({
            storeName: settingsData.storeName ?? DEFAULTS.storeName,
            whatsappNumber: settingsData.whatsappNumber ?? DEFAULTS.whatsappNumber,
            paymentMethod: settingsData.paymentMethod ?? DEFAULTS.paymentMethod,
            currency: settingsData.currency ?? DEFAULTS.currency,
          })
        }

        // 2. Cargar los módulos dinámicos asignados a tu sesión
        const modulesRes = await fetch('/api/admin/modules')
        if (modulesRes.ok) {
          const modulesData = await modulesRes.json()
          setModules(modulesData.modules || [])
        }
      } catch (err) {
        console.error("Error cargando la configuración:", err)
        toast.error('Error al cargar los datos del comercio')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, []) // El arreglo vacío significa que corre una sola vez al cargar la página

  // 🎛️ CONTROL DEL INTERRUPTOR: Cero IDs quemados
  async function handleToggleModule(moduleId: string, currentStatus: boolean) {
    setUpdatingModuleId(moduleId)
    try {
      const res = await fetch('/api/admin/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId: moduleId,
          isActive: !currentStatus
        })
      })

      if (!res.ok) throw new Error()
      
      setModules((prev) =>
        prev.map((mod) =>
          mod.id === moduleId ? { ...mod, isActive: !currentStatus } : mod
        )
      )
      toast.success('Módulo actualizado correctamente')
    } catch {
      toast.error('No se pudo cambiar el estado del módulo')
    } finally {
      setUpdatingModuleId(null)
    }
  }

  // 💾 GUARDAR AJUSTES BÁSICOS
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
          }
          // El backend asume el tenantId por sesión, no se envía por el cliente
        }),
      })
      if (!res.ok) throw new Error()
      toast.success('Configuración guardada con éxito')
    } catch {
      toast.error('No se pudo guardar la configuración')
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
          Ajustes globales de la tienda y administración de características.
        </p>
      </div>

      {/* Info de la tienda */}
      <div className="rounded-lg bg-card p-6" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Store className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-base font-semibold">Información de la tienda</h2>
            <p className="text-xs text-muted-foreground">Datos básicos visibles en la tienda</p>
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
      <div className="rounded-lg bg-card p-6" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-green-500/10 text-green-600 dark:text-green-400">
            <MessageCircle className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-base font-semibold">WhatsApp</h2>
            <p className="text-xs text-muted-foreground">Número al que llegarán los pedidos</p>
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
          <p className="mt-1 text-xs text-muted-foreground">Ejemplo Colombia: 57 + 3001234567 → 573001234567</p>
        </div>
      </div>

      {/* Método de pago */}
      <div className="rounded-lg bg-card p-6" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <CreditCard className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-base font-semibold">Método de pago</h2>
            <p className="text-xs text-muted-foreground">Define cómo los clientes finalizan su compra</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setData({ ...data, paymentMethod: 'whatsapp' })}
            className={cn(
              'flex flex-col items-start rounded-lg border-2 p-4 text-left transition-all',
              data.paymentMethod === 'whatsapp' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
            )}
          >
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-600" />
              <span className="font-display font-semibold">Pedido por WhatsApp</span>
              {data.paymentMethod === 'whatsapp' && (
                <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">ACTIVO</span>
              )}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">El carrito genera un mensaje de WhatsApp con el detalle del pedido al número del comercio.</p>
          </button>

          <button
            type="button"
            onClick={() => setData({ ...data, paymentMethod: 'mercadopago' })}
            className={cn(
              'flex flex-col items-start rounded-lg border-2 p-4 text-left transition-all',
              data.paymentMethod === 'mercadopago' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
            )}
          >
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <span className="font-display font-semibold">Mercado Pago</span>
              {data.paymentMethod === 'mercadopago' && (
                <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">ACTIVO</span>
              )}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Pagos con tarjeta, Nequi y Daviplata. Requiere configurar credenciales (próximamente).</p>
          </button>
        </div>
      </div>

      {/* SECCIÓN MÓDULOS DE CARACTERÍSTICAS */}
      <div className="rounded-lg bg-card p-6" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Sliders className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-base font-semibold">Módulos y Características</h2>
            <p className="text-xs text-muted-foreground">Activa o inactiva las extensiones modulares de tu plataforma.</p>
          </div>
        </div>

        <div className="divide-y divide-border rounded-md border bg-background">
          {modules.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground text-center">No hay módulos disponibles para este comercio.</p>
          ) : (
            modules.map((mod) => (
              <div key={mod.id} className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50">
                <div className="space-y-0.5 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-foreground">{mod.name}</span>
                    <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground">
                      {mod.code}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {mod.description || 'Sin descripción asignada.'}
                  </p>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => handleToggleModule(mod.id, mod.isActive)}
                    disabled={updatingModuleId === mod.id}
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                      mod.isActive ? "bg-primary" : "bg-muted",
                      updatingModuleId === mod.id && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out",
                        mod.isActive ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button onClick={save} disabled={saving} size="lg">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Guardar cambios globales
        </Button>
      </div>
    </div>
  )
}