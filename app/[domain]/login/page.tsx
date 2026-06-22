import { LoginForm } from './_components/login-form'
import { CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import logoMarea from './logo.png'

export default function LoginPage() {
  return (
    <div className="grid h-screen w-full grid-cols-1 lg:grid-cols-12 bg-background overflow-hidden select-none">
      
      {/* SECCIÓN IZQUIERDA: PANEL VISUAL DE MARCA (Se expande a 5 columnas en LG y 4 en XL) */}
      <div className="relative hidden flex-col justify-between bg-zinc-950 p-10 text-white lg:col-span-5 xl:col-span-4 lg:flex border-r border-zinc-800">
        {/* Patrón de fondo sutil */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f23_1px,transparent_1px),linear-gradient(to_bottom,#1f1f23_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />
        
        {/* Gradiente de luz en la esquina */}
        <div className="absolute -left-20 -top-20 h-[350px] w-[350px] rounded-full bg-blue-600/10 blur-[120px]" />

        {/* Header de Marca */}
        <div className="relative z-10 flex items-center gap-3 font-medium">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white p-1.5 shadow-[0_0_20px_rgba(255,255,255,0.15)]">
            <Image 
              src={logoMarea}
              alt="Marea Medios Logo" 
              width={28} 
              height={28}
            />
          </div>
          <span className="font-display text-lg font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            CRM Marea Medios
          </span>
        </div>

        {/* Beneficios / Mensaje del CRM */}
        <div className="relative z-10 my-auto space-y-6">
          <h2 className="text-3xl font-bold font-display tracking-tight leading-tight bg-gradient-to-br from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
            Control total de tus comercios y operaciones.
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-sm">
            Gestiona la infraestructura multi-tenant, monitorea métricas en tiempo real y optimiza tus canales de venta desde un solo lugar.
          </p>
          
          <div className="space-y-3.5 pt-4 border-t border-zinc-800/60">
            <div className="flex items-center gap-3 text-sm text-zinc-300">
              <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" />
              <span>Infraestructura Multi-tenant Activa</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-zinc-300">
              <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" />
              <span>Métricas de rendimiento y ventas</span>
            </div>
          </div>
        </div>

        {/* Footer de Marca */}
        <div className="relative z-10 text-xs text-zinc-500">
          &copy; {new Date().getFullYear()} Marea Medios. Todos los derechos reservados.
        </div>
      </div>

      {/* SECCIÓN DERECHA: FORMULARIO DE LOGUEO (Ahora con fondo texturizado) */}
      <div className="relative flex h-full flex-col justify-between p-6 sm:p-10 lg:col-span-7 xl:col-span-8 bg-zinc-50/60 dark:bg-zinc-950/40 overflow-y-auto">
        
        {/* Sofisticado patrón de puntos suaves para romper el blanco plano */}
        <div className="absolute inset-0 bg-[radial-gradient(#e4e4e7_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)] opacity-70 pointer-events-none" />

        {/* Contenedor e Tarjeta Flotante (Le da profundidad) */}
        <div className="relative z-10 mx-auto flex w-full max-w-[420px] flex-col justify-center my-auto">
          
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-sm">
            
            {/* Logo visible solo en móviles */}
            <div className="flex lg:hidden items-center gap-2 mb-6">
              <Image 
                src={logoMarea} 
                alt="Marea Medios Logo" 
                width={32} 
                height={32}
                className="object-contain"
              />
              <span className="font-display text-base font-bold tracking-tight text-zinc-900">
                Marea Medios
              </span>
            </div>

            <div className="flex flex-col space-y-2 text-left mb-6">
              <h1 className="text-2xl font-bold font-display tracking-tight text-zinc-900 dark:text-zinc-50">
                Iniciar Sesión
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Ingresa tus credenciales corporativas para acceder al panel administrativo.
              </p>
            </div>

            {/* Formulario inyectado */}
            <LoginForm />
            
          </div>
          
        </div>

        {/* Términos en la base */}
        <div className="relative z-10 text-center text-xs text-muted-foreground lg:text-left pt-4 border-t border-zinc-200/40 lg:border-none">
          Al ingresar, aceptas nuestros términos de servicio y políticas de privacidad de datos.
        </div>
      </div>

    </div>
  )
}