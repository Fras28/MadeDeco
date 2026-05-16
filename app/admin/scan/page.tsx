'use client'

import { useEffect, useRef, useState } from 'react'
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
}

type ScanState = 'idle' | 'scanning' | 'loading' | 'found' | 'stamped' | 'error'

export default function ScanPage() {
  const scannerRef       = useRef<import('html5-qrcode').Html5Qrcode | null>(null)
  const [scanState,  setScanState]  = useState<ScanState>('idle')
  const [customer,   setCustomer]   = useState<CustomerData | null>(null)
  const [message,    setMessage]    = useState('')
  const [stamping,   setStamping]   = useState(false)
  const [resetting,  setResetting]  = useState(false)
  const [manualToken, setManualToken] = useState('')
  const [camError,   setCamError]   = useState('')
  const isStoppingRef = useRef(false)

  useEffect(() => {
    return () => { stopScanner() }
  }, [])

  async function stopScanner() {
    if (isStoppingRef.current) return
    isStoppingRef.current = true
    try {
      if (scannerRef.current) {
        const state = scannerRef.current.getState()
        if (state === 2) await scannerRef.current.stop()
        scannerRef.current.clear()
        scannerRef.current = null
      }
    } catch { /* ignore */ } finally {
      isStoppingRef.current = false
    }
  }

  async function startScanner() {
    setScanState('scanning')
    setCamError('')
    setCustomer(null)
    setMessage('')

    const { Html5Qrcode } = await import('html5-qrcode')
    const containerId = 'qr-reader'
    const container   = document.getElementById(containerId)
    if (!container) { setCamError('Error interno: contenedor no encontrado.'); return }

    const qr = new Html5Qrcode(containerId, { verbose: false })
    scannerRef.current = qr

    try {
      await qr.start(
        { facingMode: 'environment' },
        { fps: 12, qrbox: { width: 240, height: 240 }, aspectRatio: 1.0 },
        (decodedText) => {
          const match = decodedText.match(/\/admin\/stamp\/([a-f0-9-]{36})/)
          const token = match?.[1] ?? (decodedText.length === 36 ? decodedText : null)
          if (token) {
            stopScanner().then(() => fetchCustomer(token))
          }
        },
        () => { /* frame sin código — ignorar */ }
      )
    } catch (err: any) {
      setScanState('idle')
      setCamError(
        err?.message?.includes('Permission')
          ? 'Permiso de cámara denegado. Habilitalo en la configuración del navegador.'
          : 'No se pudo iniciar la cámara. Usá el ingreso manual.'
      )
    }
  }

  async function fetchCustomer(token: string) {
    setScanState('loading')
    setMessage('')
    try {
      const res  = await fetch(`/api/admin/customer/${token}`)
      const data = await res.json()
      if (!res.ok) { setScanState('error'); setMessage(data.error ?? 'Cliente no encontrado.'); return }
      setCustomer(data)
      setScanState('found')
    } catch {
      setScanState('error')
      setMessage('Error de conexión. Intentá de nuevo.')
    }
  }

  async function handleStamp() {
    if (!customer || stamping) return
    setStamping(true)
    try {
      const res  = await fetch(`/api/admin/stamp/${customer.token}`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setMessage(data.error ?? 'Error al sellar.')
      } else {
        setMessage(data.message)
        setCustomer(prev => prev ? { ...prev, stamps: data.stamps, completed: data.completed } : prev)
        setScanState('stamped')
      }
    } finally {
      setStamping(false)
    }
  }

  async function handleReset() {
    if (!customer || resetting) return
    setResetting(true)
    try {
      const res  = await fetch(`/api/admin/reset/${customer.token}`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setMessage(data.error ?? 'Error al reiniciar.')
      } else {
        setMessage(data.message)
        await fetchCustomer(customer.token)
      }
    } finally {
      setResetting(false)
    }
  }

  function handleScanNext() {
    setCustomer(null)
    setMessage('')
    setScanState('idle')
  }

  function handleManual(e: React.FormEvent) {
    e.preventDefault()
    const raw   = manualToken.trim()
    if (!raw) return
    const match = raw.match(/\/admin\/stamp\/([a-f0-9-]{36})/)
    const token = match?.[1] ?? (raw.length === 36 ? raw : null)
    if (!token) { setMessage('Token inválido. Pegá la URL o el token directamente.'); return }
    stopScanner().then(() => fetchCustomer(token))
    setManualToken('')
  }

  const progress = customer ? Math.round((customer.stamps / customer.totalSlots) * 100) : 0

  return (
    <div className="min-h-screen bg-cream-50">
      <AdminNav />

      <div className="max-w-lg mx-auto px-4 py-6">

        {/* Header */}
        <div className="mb-5">
          <h1 className="font-serif text-3xl text-brand-900">Escanear QR</h1>
          <p className="text-brand-400 text-sm mt-1">
            Escaneá el código del cliente para sumarle un sello
          </p>
        </div>

        {/* ── idle / scanning ── */}
        {(scanState === 'idle' || scanState === 'scanning') && (
          <div className="space-y-4">
            <div className="bg-brand-950 rounded-3xl overflow-hidden relative" style={{ minHeight: 320 }}>
              <div
                id="qr-reader"
                className={scanState === 'scanning' ? 'block' : 'hidden'}
                style={{ width: '100%' }}
              />

              {scanState === 'idle' && (
                <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
                  <Icon.Camera className="w-16 h-16 text-brand-600 mb-4" />
                  <p className="text-cream-200 text-sm font-light">
                    Presioná el botón para activar la cámara
                  </p>
                </div>
              )}

              {scanState === 'scanning' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative w-52 h-52">
                    {[
                      'top-0 left-0 border-t-4 border-l-4 rounded-tl-2xl',
                      'top-0 right-0 border-t-4 border-r-4 rounded-tr-2xl',
                      'bottom-0 left-0 border-b-4 border-l-4 rounded-bl-2xl',
                      'bottom-0 right-0 border-b-4 border-r-4 rounded-br-2xl',
                    ].map((cls, i) => (
                      <div key={i} className={`absolute w-8 h-8 border-brand-400 ${cls}`} />
                    ))}
                    <div className="absolute inset-x-0 top-1/2 h-0.5 bg-brand-400 opacity-70 animate-pulse" />
                  </div>
                </div>
              )}
            </div>

            {camError && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-amber-800 text-sm flex items-center gap-2">
                <Icon.ExclamationTriangle className="w-4 h-4 shrink-0" />
                {camError}
              </div>
            )}

            {scanState === 'idle' ? (
              <button onClick={startScanner} className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2">
                <Icon.Camera className="w-5 h-5" />
                Activar cámara y escanear
              </button>
            ) : (
              <button onClick={() => { stopScanner(); setScanState('idle') }} className="btn-secondary w-full flex items-center justify-center gap-2">
                <Icon.X className="w-4 h-4" />
                Detener cámara
              </button>
            )}
          </div>
        )}

        {/* ── loading ── */}
        {scanState === 'loading' && (
          <div className="bg-white rounded-3xl border border-brand-100 p-12 flex flex-col items-center">
            <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-brand-500">Buscando cliente…</p>
          </div>
        )}

        {/* ── error ── */}
        {scanState === 'error' && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center">
              <Icon.XCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
              <p className="text-red-800 font-medium">{message}</p>
            </div>
            <button onClick={handleScanNext} className="btn-primary w-full">
              Escanear de nuevo
            </button>
          </div>
        )}

        {/* ── found / stamped ── */}
        {(scanState === 'found' || scanState === 'stamped') && customer && (
          <div className="space-y-4 animate-fade-in-up">
            <div className="loyalty-card">
              <div className="px-6 pt-6 pb-3 flex items-center justify-between">
                <div>
                  <p className="font-serif text-2xl text-brand-900">{customer.name}</p>
                  <p className="text-brand-400 text-sm">{customer.email}</p>
                </div>
                {customer.completed
                  ? <span className="badge-completed">Completa</span>
                  : <span className="badge-progress">{customer.stamps}/{customer.totalSlots}</span>
                }
              </div>

              <div className="px-6 pb-2">
                <div className="flex justify-between text-xs text-brand-400 mb-1">
                  <span>Progreso</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 bg-brand-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all duration-700"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center px-6 my-3">
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
                      <div
                        key={i}
                        className={`stamp-slot ${filled ? (initial ? 'initial' : 'filled') : ''}`}
                        style={filled ? { animationDelay: `${i * 0.04}s` } : {}}
                      >
                        {filled && <DachshundIcon variant={initial ? 'dark' : 'light'} />}
                        {!filled && <span className="text-brand-200 text-xs">{i + 1}</span>}
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
                    <p className="text-white font-serif text-xl">{customer.discountPercentage}% de descuento</p>
                  </div>
                  <p className="text-white/80 text-xs">
                    Aplicá el descuento y luego reiniciá la tarjeta
                  </p>
                </div>
              )}
            </div>

            {message && scanState === 'stamped' && (
              <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 text-sm font-medium text-green-800 flex items-center gap-2">
                <Icon.CheckCircle className="w-5 h-5 shrink-0" />
                {message}
              </div>
            )}

            {!customer.completed ? (
              <button
                onClick={handleStamp}
                disabled={stamping || scanState === 'stamped'}
                className={`w-full py-4 text-base font-semibold rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 ${
                  scanState === 'stamped'
                    ? 'bg-green-500 text-white cursor-default'
                    : 'btn-primary'
                }`}
              >
                {stamping ? (
                  <>
                    <Icon.Clock className="w-5 h-5 animate-spin" />
                    Agregando sello…
                  </>
                ) : scanState === 'stamped' ? (
                  <>
                    <Icon.CheckCircle className="w-5 h-5" />
                    Sello agregado
                  </>
                ) : (
                  <>
                    <Icon.Tag className="w-5 h-5" />
                    Sumar sello ({customer.stamps}→{customer.stamps + 1})
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-3">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center flex items-center justify-center gap-2">
                  <Icon.Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
                  <p className="text-amber-900 font-semibold">
                    Tarjeta completa — aplicá el {customer.discountPercentage}% de descuento
                  </p>
                </div>
                <button
                  onClick={handleReset}
                  disabled={resetting}
                  className="btn-gold w-full py-4 text-base flex items-center justify-center gap-2"
                >
                  <Icon.CheckCircle className="w-5 h-5" />
                  {resetting ? 'Reiniciando…' : 'Descuento aplicado → Reiniciar tarjeta'}
                </button>
              </div>
            )}

            <button
              onClick={handleScanNext}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <Icon.Camera className="w-4 h-4" />
              Escanear siguiente cliente
            </button>

            <Link
              href={`/admin/stamp/${customer.token}`}
              className="block text-center text-brand-400 text-xs hover:text-brand-700 transition-colors"
            >
              Ver perfil completo →
            </Link>
          </div>
        )}

        {/* Ingreso manual */}
        {(scanState === 'idle' || scanState === 'scanning' || scanState === 'error') && (
          <div className="mt-5 bg-white rounded-3xl border border-brand-100 p-5">
            <h2 className="font-serif text-base text-brand-900 mb-1">Ingreso manual</h2>
            <p className="text-brand-400 text-xs mb-3">
              Pegá el token del cliente o la URL completa de su QR
            </p>
            <form onSubmit={handleManual} className="flex gap-2">
              <input
                type="text"
                value={manualToken}
                onChange={e => setManualToken(e.target.value)}
                placeholder="Token o URL del QR…"
                className="input-field flex-1 text-sm py-2.5"
              />
              <button type="submit" className="btn-gold px-4 py-2.5 text-sm whitespace-nowrap">
                Buscar →
              </button>
            </form>
            {message && (
              <p className="text-red-600 text-xs mt-2">{message}</p>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
