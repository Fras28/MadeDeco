'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import AdminNav from '@/components/AdminNav'
import Link from 'next/link'
import DachshundIcon from '@/components/DachshundIcon'
import Icon from '@/components/Icons'

interface CustomerData {
  name:               string
  email:              string
  token:              string
  stamps:             number
  discountUsed:       boolean
  totalSlots:         number
  discountPercentage: number
  completed:          boolean
  createdAt:          string
  stampLogs:          { id: string; createdAt: string; note?: string }[]
}

export default function StampPage() {
  const { token }                 = useParams<{ token: string }>()
  const [customer,  setCustomer]  = useState<CustomerData | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [stamping,  setStamping]  = useState(false)
  const [resetting, setResetting] = useState(false)
  const [feedback,  setFeedback]  = useState<{ type: 'success'|'error'; msg: string } | null>(null)
  const [error,     setError]     = useState('')

  async function fetchCustomer() {
    const res  = await fetch(`/api/admin/customer/${token}`)
    const data = await res.json()
    if (data.error) { setError(data.error); return }
    setCustomer(data)
  }

  useEffect(() => {
    if (!token) return
    fetchCustomer().finally(() => setLoading(false))
  }, [token])

  async function handleStamp() {
    if (!customer || stamping) return
    setStamping(true)
    setFeedback(null)
    try {
      const res  = await fetch(`/api/admin/stamp/${token}`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setFeedback({ type: 'error',   msg: data.error ?? 'Error al sellar.' })
      } else {
        setFeedback({ type: 'success', msg: data.message })
        await fetchCustomer()
      }
    } finally {
      setStamping(false)
    }
  }

  async function handleReset() {
    if (!customer || resetting) return
    if (!confirm(`¿Aplicar el ${customer.discountPercentage}% de descuento y reiniciar la tarjeta de ${customer.name}?`)) return
    setResetting(true)
    setFeedback(null)
    try {
      const res  = await fetch(`/api/admin/reset/${token}`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setFeedback({ type: 'error',   msg: data.error })
      } else {
        setFeedback({ type: 'success', msg: data.message })
        await fetchCustomer()
      }
    } finally {
      setResetting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50">
        <AdminNav />
        <div className="flex items-center justify-center h-[calc(100vh-56px)]">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen bg-cream-50">
        <AdminNav />
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <Icon.Search className="w-14 h-14 text-brand-200 mx-auto mb-4" />
          <h2 className="font-serif text-2xl text-brand-900 mb-2">Cliente no encontrado</h2>
          <p className="text-brand-500 mb-6">{error}</p>
          <Link href="/admin/scan" className="btn-primary">← Volver al escáner</Link>
        </div>
      </div>
    )
  }

  const progress = Math.round((customer.stamps / customer.totalSlots) * 100)

  return (
    <div className="min-h-screen bg-cream-50">
      <AdminNav />

      <div className="max-w-xl mx-auto px-4 py-8">

        <Link href="/admin/customers" className="text-brand-400 text-sm hover:text-brand-700 mb-5 inline-flex items-center gap-1">
          ← Clientes
        </Link>

        <div className="loyalty-card mt-3 mb-4">
          <div className="px-6 pt-6 pb-3 flex items-center justify-between">
            <div>
              <p className="font-serif text-2xl text-brand-900">{customer.name}</p>
              <p className="text-brand-400 text-sm">{customer.email}</p>
              <p className="text-brand-300 text-xs mt-0.5">
                Cliente desde {new Date(customer.createdAt).toLocaleDateString('es-AR')}
              </p>
            </div>
            {customer.completed
              ? <span className="badge-completed">Completa</span>
              : <span className="badge-progress">{customer.stamps}/{customer.totalSlots}</span>
            }
          </div>

          <div className="px-6 pb-3">
            <div className="flex justify-between text-xs text-brand-400 mb-1">
              <span>Progreso</span><span>{progress}%</span>
            </div>
            <div className="h-2 bg-brand-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center px-6 mb-4">
            <div className="flex-1 h-px bg-brand-100" />
            <span className="mx-3 text-brand-300 text-xs">✦</span>
            <div className="flex-1 h-px bg-brand-100" />
          </div>

          <div className="px-6 pb-5">
            <div className="grid grid-cols-5 gap-3 justify-items-center">
              {Array.from({ length: customer.totalSlots }).map((_, i) => {
                const filled  = i < customer.stamps
                const initial = i < 2
                return (
                  <div key={i} className={`stamp-slot ${filled ? (initial ? 'initial' : 'filled') : ''}`}>
                    {filled && (
                      <DachshundIcon variant={initial ? 'dark' : 'light'} />
                    )}
                    {!filled && <span className="text-brand-200 text-xs">{i+1}</span>}
                  </div>
                )
              })}
            </div>
          </div>

          {customer.completed && (
            <div className="mx-6 mb-5 p-4 rounded-2xl text-center"
              style={{ background: 'linear-gradient(135deg, #9E7E5C, #B89670)' }}>
              <div className="flex items-center justify-center gap-2 mb-0.5">
                <Icon.Gift className="w-5 h-5 text-white" />
                <p className="text-white font-serif text-xl">{customer.discountPercentage}% de descuento disponible</p>
              </div>
              <p className="text-white/70 text-xs mt-0.5">Aplicá el descuento y luego presioná "Reiniciar tarjeta"</p>
            </div>
          )}
        </div>

        {feedback && (
          <div className={`mb-4 rounded-2xl px-5 py-4 text-sm font-medium flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {feedback.type === 'success'
              ? <Icon.CheckCircle className="w-4 h-4 shrink-0" />
              : <Icon.XCircle className="w-4 h-4 shrink-0" />
            }
            {feedback.msg}
          </div>
        )}

        <div className="space-y-3 mb-6">
          {!customer.completed ? (
            <button onClick={handleStamp} disabled={stamping} className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2">
              {stamping ? (
                <><Icon.Clock className="w-5 h-5 animate-spin" /> Agregando sello…</>
              ) : (
                <><Icon.Tag className="w-5 h-5" /> Sumar sello ({customer.stamps} → {customer.stamps + 1})</>
              )}
            </button>
          ) : (
            <button onClick={handleReset} disabled={resetting} className="btn-gold w-full py-4 text-base flex items-center justify-center gap-2">
              <Icon.CheckCircle className="w-5 h-5" />
              {resetting ? 'Reiniciando…' : 'Descuento aplicado → Reiniciar tarjeta'}
            </button>
          )}

          <Link href="/admin/scan" className="btn-secondary w-full py-3 text-center flex items-center justify-center gap-2">
            <Icon.Camera className="w-4 h-4" />
            Escanear otro cliente
          </Link>
        </div>

        {customer.stampLogs.length > 0 && (
          <div className="bg-white rounded-2xl border border-brand-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-brand-50 flex items-center justify-between">
              <div>
                <p className="font-medium text-brand-900">Historial de sellos</p>
                <p className="text-brand-400 text-xs">{customer.stampLogs.length} compras registradas</p>
              </div>
            </div>
            <div className="divide-y divide-brand-50">
              {customer.stampLogs.map((log, idx) => (
                <div key={log.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs shrink-0">
                    {customer.stampLogs.length - idx}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-brand-900">
                      Compra #{customer.stampLogs.length - idx}
                    </p>
                    <p className="text-brand-400 text-xs">
                      {new Date(log.createdAt).toLocaleString('es-AR', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                  {log.note && <p className="text-xs text-brand-400 italic">{log.note}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
