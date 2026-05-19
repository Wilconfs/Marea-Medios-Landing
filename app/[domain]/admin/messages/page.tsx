'use client'

import { useEffect, useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type TemplateType = 'RECIBIDO' | 'PREPARACION' | 'ENVIADO' | 'ENTREGADO' | 'CANCELLED'

type Template = {
  id: string
  type: TemplateType
  message: string
}

export default function MessagesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Estados independientes para el texto de cada pestaña
  const [prepMessage, setPrepMessage] = useState('')
  const [envMessage, setEnvMessage] = useState('')
  const [entMessage, setEntMessage] = useState('')
  const [recMessage, setRecMessage] = useState('')
  const [cancelMessage, setCancelMessage] = useState('')

  // 1. Cargar las plantillas guardadas desde la API
  async function loadTemplates() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/templates')
      if (!res.ok) throw new Error()
      const data: Template[] = await res.json()
      
      setTemplates(data)
      
      // Asignar los textos de la BD a sus respectivos bloques
      data.forEach((t) => {
        if (t.type === 'RECIBIDO') setRecMessage(t.message) // 👈 Añadido
        if (t.type === 'PREPARACION') setPrepMessage(t.message)
        if (t.type === 'ENVIADO') setEnvMessage(t.message)
        if (t.type === 'ENTREGADO') setEntMessage(t.message)
        if (t.type === 'CANCELLED') setCancelMessage(t.message) // 👈 Añadido
      })
    } catch {
      toast.error('Error al cargar las plantillas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTemplates()
  }, [])

  // 2. Guardar o actualizar la plantilla mediante el endpoint POST
  async function handleSave(type: TemplateType, message: string) {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, message }),
      })

      if (!res.ok) throw new Error()
      toast.success('Plantilla guardada correctamente')
      loadTemplates()
    } catch {
      toast.error('No se pudo guardar la plantilla')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Plantillas de WhatsApp</h2>
        <p className="text-sm text-muted-foreground">
          Personaliza los mensajes automáticos que enviarás a tus clientes según el estado de sus compras.
        </p>
      </div>

      <Tabs defaultValue="RECIBIDO" className="w-full">
      <TabsList className="grid w-full grid-cols-5 max-w-2xl rounded-xl"> {/* Cambiado grid-cols-3 a grid-cols-5 */}
        <TabsTrigger value="RECIBIDO" className="rounded-lg">Recibido</TabsTrigger>
        <TabsTrigger value="PREPARACION" className="rounded-lg">En Preparación</TabsTrigger>
        <TabsTrigger value="ENVIADO" className="rounded-lg">Enviado</TabsTrigger>
        <TabsTrigger value="ENTREGADO" className="rounded-lg">Entregado</TabsTrigger>
        <TabsTrigger value="CANCELLED" className="rounded-lg">Cancelado</TabsTrigger>
      </TabsList>
      {/* PESTAÑA: RECIBIDO */}
      <TabsContent value="RECIBIDO" className="space-y-4 pt-2">
        <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
          <label className="text-sm font-semibold block">Mensaje de bienvenida cuando el pedido es registrado</label>
          <Textarea
            value={recMessage}
            onChange={(e) => setRecMessage(e.target.value)}
            placeholder="Ej: Hola {cliente}, hemos recibido tu pedido #{pedido} con éxito..."
            className="min-h-[120px] rounded-xl"
          />
          <VariablesGuide />
          <Button disabled={saving} onClick={() => handleSave('RECIBIDO', recMessage)} className="rounded-xl gap-2">
            <Save className="h-4 w-4" /> Guardar Plantilla
          </Button>
        </div>
      </TabsContent>
      {/* ... (Las pestañas PREPARACION, ENVIADO y ENTREGADO se quedan exactamente igual) ... */}

        {/* PESTAÑA: EN PREPARACIÓN */}
        <TabsContent value="PREPARACION" className="space-y-4 pt-2">
          <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
            <label className="text-sm font-semibold block">Mensaje cuando el pedido está listo para empacar</label>
            <Textarea
              value={prepMessage}
              onChange={(e) => setPrepMessage(e.target.value)}
              placeholder="Ej: Hola {cliente}! Tu pedido #{pedido} ya está en preparación..."
              className="min-h-[120px] rounded-xl"
            />
            <VariablesGuide />
            <Button 
              disabled={saving} 
              onClick={() => handleSave('PREPARACION', prepMessage)}
              className="rounded-xl gap-2"
            >
              <Save className="h-4 w-4" /> Guardar Plantilla
            </Button>
          </div>
        </TabsContent>

        {/* PESTAÑA: ENVIADO */}
        <TabsContent value="ENVIADO" className="space-y-4 pt-2">
          <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
            <label className="text-sm font-semibold block">Mensaje cuando el producto va en camino</label>
            <Textarea
              value={envMessage}
              onChange={(e) => setEnvMessage(e.target.value)}
              placeholder="Ej: ¡Buenas noticias {cliente}! Tu pedido #{pedido} va en camino..."
              className="min-h-[120px] rounded-xl"
            />
            <VariablesGuide />
            <Button 
              disabled={saving} 
              onClick={() => handleSave('ENVIADO', envMessage)}
              className="rounded-xl gap-2"
            >
              <Save className="h-4 w-4" /> Guardar Plantilla
            </Button>
          </div>
        </TabsContent>

        {/* PESTAÑA: ENTREGADO */}
        <TabsContent value="ENTREGADO" className="space-y-4 pt-2">
          <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
            <label className="text-sm font-semibold block">Mensaje de confirmación de entrega exitosa</label>
            <Textarea
              value={entMessage}
              onChange={(e) => setEntMessage(e.target.value)}
              placeholder="Ej: Hola {cliente}, confirmamos que tu pedido #{pedido} fue entregado. ¡Gracias!"
              className="min-h-[120px] rounded-xl"
            />
            <VariablesGuide />
            <Button 
              disabled={saving} 
              onClick={() => handleSave('ENTREGADO', entMessage)}
              className="rounded-xl gap-2"
            >
              <Save className="h-4 w-4" /> Guardar Plantilla
            </Button>
          </div>
        </TabsContent>

        {/* PESTAÑA: CANCELADO */}
        <TabsContent value="CANCELLED" className="space-y-4 pt-2">
          <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
            <label className="text-sm font-semibold block">Mensaje de notificación de cancelación del pedido</label>
            <Textarea
              value={cancelMessage}
              onChange={(e) => setCancelMessage(e.target.value)}
              placeholder="Ej: Hola {cliente}, te informamos que tu pedido #{pedido} ha sido cancelado..."
              className="min-h-[120px] rounded-xl"
            />
            <VariablesGuide />
            <Button disabled={saving} onClick={() => handleSave('CANCELLED', cancelMessage)} className="rounded-xl gap-2">
              <Save className="h-4 w-4" /> Guardar Plantilla
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function VariablesGuide() {
  return (
    <div className="rounded-xl bg-muted/50 p-4 text-xs text-muted-foreground space-y-2">
      <p className="font-semibold text-slate-700 dark:text-slate-300">💡 Atajos dinámicos disponibles:</p>
      <p>Puedes incluir estas palabras clave entre llaves en cualquier parte del texto y el sistema las reemplazará automáticamente con los datos reales del pedido antes de abrir WhatsApp:</p>
      <div className="flex flex-wrap gap-3 pt-1">
        <span>• <code className="bg-background px-1.5 py-0.5 rounded border font-mono font-bold text-primary">{`{cliente}`}</code> : Nombre del comprador</span>
        <span>• <code className="bg-background px-1.5 py-0.5 rounded border font-mono font-bold text-primary">{`{pedido}`}</code> : Código corto del pedido</span>
        <span>• <code className="bg-background px-1.5 py-0.5 rounded border font-mono font-bold text-primary">{`{total}`}</code> : El valor total de la compra</span>
      </div>
    </div>
  )
}