import Link from 'next/link'
import { Sparkles, Mail, Phone, MapPin } from 'lucide-react'

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border/60 bg-secondary/40">
      <div className="container-page py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 font-display text-lg font-bold"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Sparkles className="h-4 w-4" />
              </span>
              Ecom<span className="text-primary">Dash</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Tu tienda de moda online: encuentra ofertas únicas en ropa,
              calzado y accesorios.
            </p>
          </div>

          <div>
            <h4 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Tienda
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-primary">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-primary">
                  Carrito
                </Link>
              </li>
              <li>
                <Link href="/?flashSale=true" className="hover:text-primary">
                  Ofertas Flash
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Contacto
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" /> +57 300 123 4567
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" /> hola@ecomdash.com
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> Bogotá, Colombia
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-border/60 pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} EcomDash. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
