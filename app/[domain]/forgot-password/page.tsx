'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [step, setStep] = useState(1) // 1: Enviar, 2: Verificar, 3: Restablecer
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Acción 1: Solicitar código de verificación
  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send-code', identifier }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.message || 'Error al enviar el código')
      
      setMessage(data.message)
      setStep(2)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Acción 2: Verificar código
  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify-code', identifier, code }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.message || 'Código incorrecto')

      setMessage(data.message)
      setStep(3)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Acción 3: Actualizar a la nueva contraseña
  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const res = await fetch('//api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset-password', identifier, code, newPassword }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.message || 'Error al cambiar contraseña')

      setMessage('¡Contraseña actualizada con éxito! Ya puedes iniciar sesión.')
      setStep(4) // Flujo completado
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Recuperar Contraseña
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Tienda Marea • Gestión de accesos
          </p>
        </div>

        {message && <div className="p-3 text-sm text-green-600 bg-green-50 rounded-lg border border-green-200">{message}</div>}
        {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">{error}</div>}

        {step === 1 && (
          <form className="mt-8 space-y-6" onSubmit={handleSendCode}>
            <div className="space-y-2">
              <Label htmlFor="identifier">Ingresa tu Correo o Teléfono Celular</Label>
              <Input
                id="identifier"
                type="text"
                placeholder="ejemplo@marea.com o 3012345678"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar código por WhatsApp'}
            </Button>
          </form>
        )}

        {step === 2 && (
          <form className="mt-8 space-y-6" onSubmit={handleVerifyCode}>
            <div className="space-y-2">
              <Label htmlFor="code">Código de Verificación (6 dígitos)</Label>
              <Input
                id="code"
                type="text"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
              {loading ? 'Verificando...' : 'Verificar Código'}
            </Button>
          </form>
        )}

        {step === 3 && (
          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nueva Contraseña (Mínimo 6 caracteres)</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="******"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={loading}>
              {loading ? 'Actualizando...' : 'Restablecer Contraseña'}
            </Button>
          </form>
        )}

        {step === 4 && (
          <div className="text-center mt-6">
            <Button onClick={() => window.location.href = '/login'} className="w-full">
              Volver al Login
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}