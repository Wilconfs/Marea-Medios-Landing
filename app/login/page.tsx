import { LoginForm } from './_components/login-form'
import { Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
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
            Bienvenido de vuelta
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ingresa a tu cuenta de EcomDash ADITADO ALPHA
          </p>
        </div>

        <LoginForm />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          ¿Aún no tienes cuenta?{' '}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  )
}
