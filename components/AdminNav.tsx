'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import Icon from '@/components/Icons'

const links = [
  { href: '/admin/dashboard', label: 'Dashboard',   Icon: Icon.ChartBar },
  { href: '/admin/customers', label: 'Clientes',    Icon: Icon.Users    },
  { href: '/admin/scan',      label: 'Escanear QR', Icon: Icon.Camera   },
  { href: '/admin/qr',        label: 'Mostrador',   Icon: Icon.QrCode   },
  { href: '/admin/settings',  label: 'Config',      Icon: Icon.Cog      },
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
        <Link href="/admin/dashboard" className="shrink-0 flex items-center">
          <Image
            src="/LogoMadeDeco.webp"
            alt="Made Deco"
            width={110}
            height={43}
            className="brightness-0 invert opacity-90"
          />
        </Link>

        {/* Links */}
        <div className="flex items-center gap-0.5 overflow-x-auto">
          {links.map(({ href, label, Icon: I }) => {
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
                <I className="w-4 h-4" />
                <span className="hidden md:inline">{label}</span>
              </Link>
            )
          })}

          <div className="w-px h-5 bg-brand-700 mx-1" />

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm text-brand-400 hover:text-red-400 transition-colors whitespace-nowrap"
          >
            <Icon.LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
