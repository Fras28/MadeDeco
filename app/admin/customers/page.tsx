'use client'

import { useEffect, useState, useCallback } from 'react'
import AdminNav from '@/components/AdminNav'
import Link from 'next/link'
import DachshundIcon from '@/components/DachshundIcon'

interface Customer {
  id:           string
  name:         string
  email:        string
  token:        string
  stamps:       number
  discountUsed: boolean
  completed:    boolean
  createdAt:    string
}

interface CustomerDetail extends Customer {
  totalSlots:         number
  discountPercentage: number
  stampLogs: { id: string; createdAt: string; note?: string }[]
}

interface Pagination { total: number; page: number; pages: number; limit: number }

export default function CustomersPage() {
  const [customers,        setCustomers]        = useState<Customer[]>([])
  const [pagination,       setPagination]       = useState<Pagination | null>(null)
  const [loading,          setLoading]          = useState(true)
  const [search,           setSearch]           = useState('')
  const [page,             setPage]             = useState(1)
  const [debouncedSearch,  setDebouncedSearch]  = useState('')
  const [selected,         setSelected]         = useState<CustomerDetail | null>(null)
  const [detailLoading,    setDetailLoading]    = useState(false)
  const [stamping,         setStamping]         = useState(false)
  const [resetting,        setResetting]        = useState(false)
  const [detailFeedback,   setDetailFeedback]   = useState<{ type: 'success'|'error'; msg: string } | null>(null)

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 380)
    return () => clearTimeout(t)
  }, [search])

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '25' })
    if (debouncedSearch) params.set('search', debouncedSearch)
    const res  = await fetch(`/api/admin/customers?${params}`)
    const data = await res.json()
    setCustomers(data.customers ?? [])
    setPagination(data.pagination ?? null)
    setLoading(false)
  }, [page, debouncedSearch])

  useEffect(() => { fetchCustomers() }, [fetchCustomers])
  useEffect(() => { setPage(1) }, [debouncedSearch])

  // ── Abrir detalle de cliente ──
  async function openDetail(token: string) {
    setDetailLoading(true)
    setDetailFeedback(null)
    setSelected(null)
    const res  = await fetch(`/api/admin/customer/${token}`)
    const data = await res.json()
    if (!data.error) setSelected(data)
    setDetailLoading(false)
  }

  // ── Sumar sello desde el panel de detalle ──
  async function handleStamp() {
    if (!selected || stamping) return
    setStamping(true)
    setDetailFeedback(null)
    try {
      const res  = await fetch(`/api/admin/stamp/${selected.token}`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setDetailFeedback({ type: 'error', msg: data.error })
      } else {
        setDetailFeedback({ type: 'success', msg: data.message })
        await openDetail(selected.token)
        await fetchCustomers()
      }
    } finally {
      setStamping(false)
    }
  }

  // ── Resetear tarjeta ──
  async function handleReset() {
    if (!selected || resetting) return
    if (!confirm(`¿Aplicar el descuento y reiniciar la tarjeta de ${selected.name}?`)) return
    setResetting(true)
    setDetailFeedback(null)
    try {
      const res  = await fetch(`/api/admin/reset/${selected.token}`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setDetailFeedback({ type: 'error', msg: data.error })
      } else {
        setDetailFeedback({ type: 'success', msg: data.message })
        await openDetail(selected.token)
        await fetchCustomers()
      }
    } finally {
      setResetting(false)
    }
  }

  const selProgress = selected ? Math.round((selected.stamps / selected.totalSlots) * 100) : 0

  return (
    <div className="min-h-screen bg-cream-50">
      <AdminNav />

      <div className="max-w-6xl mx-auto px-4 py-8 flex gap-6">

        {/* ══ Lista de clientes ══ */}
        <div className={`flex-1 min-w-0 transition-all duration-300 ${selected ? 'hidden md:block md:max-w-sm lg:max-w-md' : ''}`}>

          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="font-serif text-3xl text-brand-900">Clientes</h1>
              <p className="text-brand-400 text-sm mt-0.5">
                {pagination ? `${pagination.total} registrados` : ''}
              </p>
            </div>
          </div>

          {/* Búsqueda */}
          <div className="relative mb-4">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-300 text-sm">🔍</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre o email…"
              className="input-field pl-10"
            />
          </div>

          {/* Lista */}
          <div className="bg-white rounded-2xl border border-brand-100 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-brand-400 text-sm">Cargando…</div>
            ) : customers.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-4xl mb-3">👥</p>
                <p className="text-brand-400 text-sm">Sin resultados.</p>
              </div>
            ) : (
              <div className="divide-y divide-brand-50">
                {customers.map(c => (
                  <button
                    key={c.id}
                    onClick={() => openDetail(c.token)}
                    className={`w-full text-left px-4 py-3.5 hover:bg-cream-100 transition-colors flex items-center gap-3 ${
                      selected?.token === c.token ? 'bg-cream-100 border-l-2 border-brand-500' : ''
                    }`}
                  >
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-medium text-sm shrink-0">
                      {c.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-brand-900 text-sm truncate">{c.name}</p>
                      <p className="text-brand-400 text-xs truncate">{c.email}</p>
                    </div>

                    {/* Sellos mini */}
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 10 }).map((_, i) => (
                          <div key={i} className={`w-2 h-2 rounded-full ${i < c.stamps ? 'bg-brand-500' : 'bg-brand-100'}`} />
                        ))}
                      </div>
                      {c.completed && (
                        <span className="text-xs text-green-600 font-medium">🎉 Completa</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Paginación */}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {Array.from({ length: pagination.pages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${
                    page === i + 1
                      ? 'bg-brand-900 text-white'
                      : 'bg-white text-brand-600 border border-brand-200 hover:border-brand-400'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ══ Panel de detalle ══ */}
        {(detailLoading || selected) && (
          <div className="flex-1 md:flex-none md:w-96 lg:w-[420px]">

            {/* Botón cerrar en mobile */}
            <div className="flex items-center gap-3 mb-4 md:hidden">
              <button
                onClick={() => setSelected(null)}
                className="flex items-center gap-1 text-brand-500 text-sm hover:text-brand-800"
              >
                ← Volver
              </button>
            </div>

            {detailLoading && (
              <div className="bg-white rounded-3xl border border-brand-100 p-10 animate-pulse h-[500px]" />
            )}

            {selected && !detailLoading && (
              <div className="space-y-4 sticky top-20">

                {/* Tarjeta del cliente */}
                <div className="loyalty-card">
                  {/* Header */}
                  <div className="px-6 pt-6 pb-3 flex items-center justify-between">
                    <div>
                      <p className="font-serif text-xl text-brand-900">{selected.name}</p>
                      <p className="text-brand-400 text-xs">{selected.email}</p>
                      <p className="text-brand-300 text-xs mt-0.5">
                        Cliente desde {new Date(selected.createdAt).toLocaleDateString('es-AR')}
                      </p>
                    </div>
                    <div className="text-right">
                      {selected.completed
                        ? <span className="badge-completed">🎉 Completa</span>
                        : <span className="badge-progress">{selected.stamps}/{selected.totalSlots}</span>
                      }
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="px-6 pb-3">
                    <div className="flex justify-between text-xs text-brand-400 mb-1">
                      <span>Progreso</span>
                      <span>{selProgress}%</span>
                    </div>
                    <div className="h-2 bg-brand-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all duration-700"
                        style={{ width: `${selProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Separador */}
                  <div className="flex items-center px-6 mb-3">
                    <div className="flex-1 h-px bg-brand-100" />
                    <span className="mx-3 text-brand-300 text-xs">✦</span>
                    <div className="flex-1 h-px bg-brand-100" />
                  </div>

                  {/* Grid de sellos */}
                  <div className="px-6 pb-5">
                    <div className="grid grid-cols-5 gap-2.5 justify-items-center">
                      {Array.from({ length: selected.totalSlots }).map((_, i) => {
                        const filled  = i < selected.stamps
                        const initial = i < 2
                        return (
                          <div key={i} className={`stamp-slot ${filled ? (initial ? 'initial' : 'filled') : ''}`}>
                            {filled && (
                              <DachshundIcon variant={initial ? 'dark' : 'light'} className="w-7 h-4" />
                            )}
                            {!filled && <span className="text-brand-200 text-xs">{i+1}</span>}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Banner descuento */}
                  {selected.completed && (
                    <div className="mx-6 mb-5 p-3 rounded-2xl text-center"
                      style={{ background: 'linear-gradient(135deg, #9E7E5C, #B89670)' }}>
                      <p className="text-white font-medium">🎁 {selected.discountPercentage}% de descuento disponible</p>
                    </div>
                  )}
                </div>

                {/* Feedback */}
                {detailFeedback && (
                  <div className={`rounded-2xl px-4 py-3 text-sm font-medium ${
                    detailFeedback.type === 'success'
                      ? 'bg-green-50 border border-green-200 text-green-800'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}>
                    {detailFeedback.type === 'success' ? '✅ ' : '❌ '}{detailFeedback.msg}
                  </div>
                )}

                {/* Acciones */}
                <div className="bg-white rounded-2xl border border-brand-100 p-4 space-y-2.5">
                  <p className="text-xs font-medium text-brand-500 uppercase tracking-wide mb-1">Acciones</p>

                  {!selected.completed ? (
                    <button
                      onClick={handleStamp}
                      disabled={stamping}
                      className="btn-primary w-full py-3"
                    >
                      {stamping ? '⏳ Agregando…' : `🔖 Sumar sello (${selected.stamps} → ${selected.stamps + 1})`}
                    </button>
                  ) : (
                    <button
                      onClick={handleReset}
                      disabled={resetting}
                      className="btn-gold w-full py-3"
                    >
                      {resetting ? 'Reiniciando…' : '✅ Descuento aplicado → Reiniciar tarjeta'}
                    </button>
                  )}

                  <Link
                    href={`/admin/scan`}
                    className="btn-secondary w-full py-2.5 text-sm text-center block"
                  >
                    📷 Ir al escáner QR
                  </Link>

                  <a
                    href={`/card/${selected.token}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center text-brand-400 text-xs hover:text-brand-700 transition-colors mt-1"
                  >
                    Ver tarjeta del cliente ↗
                  </a>
                </div>

                {/* Historial de sellos */}
                {selected.stampLogs.length > 0 && (
                  <div className="bg-white rounded-2xl border border-brand-100 overflow-hidden">
                    <div className="px-5 py-3 border-b border-brand-50">
                      <p className="text-sm font-medium text-brand-900">Historial de sellos</p>
                      <p className="text-brand-400 text-xs">{selected.stampLogs.length} compras registradas</p>
                    </div>
                    <div className="divide-y divide-brand-50 max-h-56 overflow-y-auto">
                      {selected.stampLogs.map((log, idx) => (
                        <div key={log.id} className="flex items-center gap-3 px-5 py-2.5">
                          <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs shrink-0">
                            {selected.stampLogs.length - idx}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-brand-900">
                              {new Date(log.createdAt).toLocaleDateString('es-AR', {
                                day: '2-digit', month: '2-digit', year: 'numeric',
                              })}
                            </p>
                            <p className="text-brand-400 text-xs">
                              {new Date(log.createdAt).toLocaleTimeString('es-AR', {
                                hour: '2-digit', minute: '2-digit',
                              })}
                            </p>
                          </div>
                          {log.note && (
                            <p className="ml-auto text-xs text-brand-400 italic">{log.note}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
