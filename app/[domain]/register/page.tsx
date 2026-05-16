import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { RegisterForm } from './_components/register-form'

export default function RegisterPage() {
  return (
    <div className="container-page flex min-h-[calc(100vh-12rem)] items-center justify-center py-10">
      <div
        className="w-full max-w-md rounded-lg bg-card p-7 sm:p-8"
        style={{ boxShadow: 'var(--shadow-md)' }}
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow">
            <Sparkles className="h-6 w-6" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">
            Crear cuenta
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Únete a Tienda Marea en segundos
          </p>
        </div>

        <RegisterForm />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
