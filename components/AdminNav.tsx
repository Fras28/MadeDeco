'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import Icon from '@/components/Icons'

const links = [
  { href: '/admin/dashboard', label: 'Inicio',     Icon: Icon.ChartBar },
  { href: '/admin/customers', label: 'Clientes',   Icon: Icon.Users    },
  { href: '/admin/scan',      label: 'Escanear',   Icon: Icon.Camera   },
  { href: '/admin/qr',        label: 'Mostrador',  Icon: Icon.QrCode   },
  { href: '/admin/settings',  label: 'Config',     Icon: Icon.Cog      },
]

function isActive(pathname: string, href: string) {
  if (href === '/admin/dashboard') return pathname === href
  return pathname.startsWith(href)
}

export default function AdminNav() {
  const pathname = usePathname()
  const router   = useRouter()

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin')
    router.refresh()
  }

  return (
    <>
      {/* ══════════════════════════════════════════════════════
          TOP NAR — desktop full / mobile minimal (logo + logout)
      ══════════════════════════════════════════════════════ */}
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

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-0.5">
            {links.map(({ href, label, Icon: I }) => {
              const active = isActive(pathname, href)
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
                  <span>{label}</span>
                </Link>
              )
            })}

            <div className="w-px h-5 bg-brand-700 mx-1" />

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm text-brand-400 hover:text-red-400 transition-colors"
            >
              <Icon.LogOut className="w-4 h-4" />
              <span>Salir</span>
            </button>
          </div>

          {/* Mobile: logout button only (links go to bottom bar) */}
          <button
            onClick={handleLogout}
            className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-brand-400 hover:text-red-400 transition-colors"
          >
            <Icon.LogOut className="w-4 h-4" />
            <span className="text-xs">Salir</span>
          </button>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════
          BOTTOM NAV — mobile only, fixed
      ══════════════════════════════════════════════════════ */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-brand-950 border-t border-brand-800"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-stretch h-16">
          {links.map(({ href, label, Icon: I }) => {
            const active = isActive(pathname, href)
            return (
              <Link
                key={href}
                href={href}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 pt-1 transition-colors ${
                  active
                    ? 'text-white'
                    : 'text-brand-500 hover:text-brand-200'
                }`}
              >
                {/* Active indicator dot */}
                <div className={`absolute top-0 w-8 h-0.5 rounded-b-full transition-colors ${
                  active ? 'bg-brand-400' : 'bg-transparent'
                }`} />

                <I className={`w-5 h-5 transition-transform ${active ? 'scale-110' : ''}`} />
                <span className="text-[10px] font-medium tracking-wide leading-none">
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
