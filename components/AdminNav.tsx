'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const links = [
  { href: '/admin/dashboard', label: 'Dashboard',   icon: '📊' },
  { href: '/admin/customers', label: 'Clientes',    icon: '👥' },
  { href: '/admin/scan',      label: 'Escanear QR', icon: '📷' },
  { href: '/admin/settings',  label: 'Config',      icon: '⚙️' },
]

export default function AdminNav() {
  const pathname = usePathname()
  const router   = useRouter()

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin')
    router.refresh()
  }

  return (
    <nav className="bg-brand-950 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
        {/* Logo */}
        <Link href="/admin/dashboard" className="font-serif text-lg text-cream-100 flex items-center gap-2 shrink-0">
          <span className="text-brand-400">✦</span>
          <span className="hidden sm:inline">Madedeco</span>
          <span className="sm:hidden">Admin</span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-0.5 overflow-x-auto">
          {links.map(({ href, label, icon }) => {
            const active = pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                  active
                    ? 'bg-brand-700 text-white'
                    : 'text-brand-300 hover:text-white hover:bg-brand-800'
                }`}
              >
                <span>{icon}</span>
                <span className="hidden md:inline">{label}</span>
              </Link>
            )
          })}

          <div className="w-px h-5 bg-brand-700 mx-1" />

          <button
            onClick={handleLogout}
            className="px-2.5 py-1.5 rounded-lg text-sm text-brand-400 hover:text-red-400 transition-colors whitespace-nowrap"
          >
            <span className="hidden sm:inline">Salir</span>
            <span className="sm:hidden">✕</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
