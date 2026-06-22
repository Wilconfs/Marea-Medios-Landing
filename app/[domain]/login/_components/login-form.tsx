'use client'

import { useState, useEffect } from 'react' // ◄ 1. AGREGAMOS useEffect
import { signIn, useSession } from 'next-auth/react' // ◄ 2. AGREGAMOS useSession
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export function LoginForm() {
  const router = useRouter()
  const { status } = useSession() // ◄ 3. CAPTURAMOS EL ESTADO DE LA SESIÓN ('authenticated', 'loading', 'unauthenticated')
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get('callbackUrl') ?? '/admin'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // ◄ 4. SI EL USUARIO YA ESTÁ LOGUEADO, LO EXPULSAMOS AL ADMIN EN SEGUIDA
  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/admin')
    }
  }, [status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })
      if (res?.error) {
        setError('Correo o contraseña inválidos')
        toast.error('No se pudo iniciar sesión')
      } else if (res?.ok) {
        toast.success('¡Bienvenido de vuelta!')
        router.replace(callbackUrl)
      }
    } catch (err) {
      console.error(err)
      setError('Ocurrió un error. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  // ◄ 5. MIENTRAS VALIDA LA SESIÓN, PARAMOS EL RENDER PARA EVITAR EL "PARPADEO" VISUAL DEL FORMULARIO
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
        Cargando sesión...
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
      
      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Contraseña
        </label>
        
        <div className="relative flex items-center">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'} 
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            required
          />

          <button
            type="button" 
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 p-1 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
            title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button type="submit" size="lg" className="w-full" loading={loading}>
        Ingresar
      </Button>
    </form>
  )
}