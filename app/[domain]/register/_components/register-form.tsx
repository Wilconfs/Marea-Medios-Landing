'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export function RegisterForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [phone, setPhone] = useState('')
  const hostname = typeof window !== 'undefined' ? window.location.host : ''
  const cleanSlug = hostname.split(':')[0].split('.')[0]

  console.log("✈️ Enviando registro para el Tenant Slug:", cleanSlug)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password, tenantId: cleanSlug }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        // CORRECCIÓN: Captura .message o .error para mostrar la razón exacta en pantalla
        const errorMessage = data?.message || data?.error || 'No se pudo crear la cuenta'
        setError(errorMessage)
        toast.error(errorMessage)
        return
      }
      // Auto login
      const signInRes = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })
      if (signInRes?.ok) {
        toast.success('¡Cuenta creada con éxito!')
        router.replace('/')
      } else {
        router.replace('/login')
      }
    } catch (err) {
      console.error(err)
      setError('Ocurrió un error. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Nombre completo</Label>
        <div className="relative">
          <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="name"
            type="text"
            autoComplete="name"
            required
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Correo electrónico</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      {/* ◄ 3. NUEVO CAMPO: TELÉFONO CELULAR */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono celular</label>
        <input
          type="tel"
          placeholder="Número de celular"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          required // Hace que el navegador valide que no vaya vacío
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Contraseña</Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button type="submit" size="lg" className="w-full" loading={loading}>
        Crear mi cuenta
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Al registrarte, aceptas nuestros términos de uso.
      </p>
    </form>
  )
}