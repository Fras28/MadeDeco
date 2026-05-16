'use client'

import { useEffect, useState } from 'react'
import AdminNav from '@/components/AdminNav'
import Link from 'next/link'
import Icon from '@/components/Icons'

interface Stats {
  totalCustomers:     number
  completedCards:     number
  totalStamps:        number
  discountPercentage: number
  recentStamps:       { id: string; customerName: string; createdAt: string }[]
}

type StatCard = {
  label: string
  value: string | number
  Icon:  React.FC<{ className?: string }>
  color: string
}

export default function DashboardPage() {
  const [stats,   setStats]   = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(setStats)
      .finally(() => setLoading(false))
  }, [])

  const cards: StatCard[] = stats
    ? [
        { label: 'Clientes registrados', value: stats.totalCustomers,          Icon: Icon.Users,    color: 'bg-blue-50   border-blue-200   text-blue-700'   },
        { label: 'Tarjetas completas',   value: stats.completedCards,           Icon: Icon.Sparkles, color: 'bg-green-50  border-green-200  text-green-700'  },
        { label: 'Sellos otorgados',     value: stats.totalStamps,              Icon: Icon.Tag,      color: 'bg-brand-50  border-brand-200  text-brand-700'  },
        { label: 'Descuento activo',     value: `${stats.discountPercentage}%`, Icon: Icon.Gift,     color: 'bg-purple-50 border-purple-200 text-purple-700' },
      ]
    : []

  return (
    <div className="min-h-screen bg-cream-50">
      <AdminNav />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl text-brand-900">Dashboard</h1>
          <p className="text-brand-400 text-sm mt-1">Resumen del programa de fidelización</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-brand-100 animate-pulse h-24" />
            ))}
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {cards.map(({ label, value, Icon: I, color }) => (
                <div key={label} className={`rounded-2xl p-5 border ${color} bg-opacity-50`}>
                  <I className="w-5 h-5 mb-2" />
                  <div className="text-2xl font-semibold">{value}</div>
                  <div className="text-xs opacity-80 mt-0.5">{label}</div>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <Link
                href="/admin/scan"
                className="flex items-center gap-4 bg-brand-900 text-white rounded-2xl p-5 hover:bg-brand-800 transition-colors group"
              >
                <Icon.Camera className="w-7 h-7 text-brand-300 shrink-0" />
                <div>
                  <p className="font-semibold">Escanear QR</p>
                  <p className="text-brand-300 text-xs">Sumá un sello al cliente</p>
                </div>
                <Icon.ArrowRight className="ml-auto w-4 h-4 text-brand-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/admin/customers"
                className="flex items-center gap-4 bg-white border border-brand-200 rounded-2xl p-5 hover:border-brand-400 transition-colors group"
              >
                <Icon.Users className="w-7 h-7 text-brand-400 shrink-0" />
                <div>
                  <p className="font-semibold text-brand-900">Ver clientes</p>
                  <p className="text-brand-400 text-xs">Lista completa de tarjetas</p>
                </div>
                <Icon.ArrowRight className="ml-auto w-4 h-4 text-brand-300 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Actividad reciente */}
            {stats && stats.recentStamps.length > 0 && (
              <div className="bg-white rounded-2xl border border-brand-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-brand-50">
                  <h2 className="font-serif text-lg text-brand-900">Actividad reciente</h2>
                </div>
                <div className="divide-y divide-brand-50">
                  {stats.recentStamps.map((s) => (
                    <div key={s.id} className="flex items-center gap-3 px-6 py-3">
                      <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center shrink-0">
                        <Icon.Tag className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-brand-900">{s.customerName}</p>
                        <p className="text-xs text-brand-400">
                          {new Date(s.createdAt).toLocaleString('es-AR', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <div className="ml-auto">
                        <span className="text-xs bg-brand-50 text-brand-600 px-2 py-1 rounded-lg">+1 sello</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
