import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href: string
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center space-x-1 text-sm text-slate-500 mb-4">
      <Link href="/" className="hover:text-indigo-600 transition-colors">Inicio</Link>
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-1 text-slate-300" />
          <Link 
            href={item.href} 
            className={`${index === items.length - 1 ? 'font-bold text-slate-900' : 'hover:text-indigo-600'} transition-colors`}
          >
            {item.label}
          </Link>
        </div>
      ))}
    </nav>
  )
}