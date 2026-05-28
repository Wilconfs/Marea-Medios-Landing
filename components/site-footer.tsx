'use client'

import Link from 'next/link'
import { Laptop, Mail, Phone, MapPin } from 'lucide-react'

export function SiteFooter() {
  return (
    // 🎛️ bg-slate-900 da el tono oscuro pero suave, y el borde superior conserva tu azul de marca
    <footer className="border-t-2 border-blue-600 bg-slate-900 text-slate-300">
      <div className="container-page py-10">
        <div className="grid gap-8 md:grid-cols-3">
          
          {/* Columna 1: Branding y Descripción */}
          <div className="space-y-3">
            <Link
              href="/"
              className="flex items-center gap-2 font-display text-lg font-bold text-white"
            >
              {/* Icono encerrado en el azul corporativo */}
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md">
                <Laptop className="h-4.5 w-4.5" />
              </span>
              <span className="tracking-tight">Marea <span className="text-blue-500">Medios</span></span>
            </Link>
            <p className="max-w-xs text-sm text-slate-400 leading-relaxed">
              Tu portal tecnológico de confianza: encuentra lo mejor en hardware, componentes y soluciones digitales de alta calidad.
            </p>
          </div>

          {/* Columna 2: Navegación Rápida */}
          <div>
            <h4 className="mb-3 font-display text-xs font-semibold uppercase tracking-wider text-slate-500">
              Tienda
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-slate-300 hover:text-blue-400 transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-slate-300 hover:text-blue-400 transition-colors">
                  Carrito
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-slate-300 hover:text-blue-400 transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-slate-300 hover:text-blue-400 transition-colors">
                  Registro
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Información de Contacto */}
          <div>
            <h4 className="mb-3 font-display text-xs font-semibold uppercase tracking-wider text-slate-500">
              Contacto
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2.5 text-slate-300">
                <Phone className="h-4 w-4 text-blue-500 shrink-0" />
                <span>+57 300 123 4567</span>
              </li>
              <li className="flex items-center gap-2.5 text-slate-300">
                <Mail className="h-4 w-4 text-blue-500 shrink-0" />
                <span className="truncate">hola@mareamedios.com</span>
              </li>
              <li className="flex items-center gap-2.5 text-slate-300">
                <MapPin className="h-4 w-4 text-blue-500 shrink-0" />
                <span>Bogotá, Colombia</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Línea inferior de derechos de autor */}
        <div className="mt-10 border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Marea Medios. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}