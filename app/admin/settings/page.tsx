'use client'

import { useEffect, useState } from 'react'
import AdminNav from '@/components/AdminNav'

interface Settings {
  businessName:       string
  discountPercentage: number
  totalSlots:         number
  initialStamps:      number
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    businessName:       'Madedeco',
    discountPercentage: 20,
    totalSlots:         10,
    initialStamps:      2,
  })
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(data => { if (!data.error) setSettings(data) })
      .finally(() => setLoading(false))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setFeedback(null)
    try {
      const res  = await fetch('/api/admin/settings', {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(settings),
      })
      const data = await res.json()
      if (!res.ok) {
        setFeedback({ type: 'error',   msg: data.error })
      } else {
        setFeedback({ type: 'success', msg: 'Configuración guardada exitosamente.' })
      }
    } catch {
      setFeedback({ type: 'error', msg: 'Error de conexión.' })
    } finally {
      setSaving(false)
    }
  }

  function update(key: keyof Settings, value: string | number) {
    setSettings(prev => ({ ...prev, [key]: value }))
    setFeedback(null)
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <AdminNav />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-7">
          <h1 className="font-serif text-3xl text-brand-900">Configuración</h1>
          <p className="text-brand-400 text-sm mt-1">Parámetros del programa de fidelización</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl border border-brand-100 p-10 animate-pulse h-96" />
        ) : (
          <form onSubmit={handleSave} className="space-y-5">

            {/* Nombre del negocio */}
            <div className="bg-white rounded-3xl border border-brand-100 p-6">
              <h2 className="font-serif text-lg text-brand-900 mb-4">Negocio</h2>
              <div>
                <label className="block text-xs font-medium text-brand-700 mb-1.5 uppercase tracking-wide">
                  Nombre del comercio
                </label>
                <input
                  type="text"
                  required
                  value={settings.businessName}
                  onChange={e => update('businessName', e.target.value)}
                  className="input-field"
                  placeholder="Madedeco"
                />
                <p className="text-brand-300 text-xs mt-1.5">
                  Aparece en la tarjeta del cliente y en el encabezado de la app.
                </p>
              </div>
            </div>

            {/* Configuración de la tarjeta */}
            <div className="bg-white rounded-3xl border border-brand-100 p-6">
              <h2 className="font-serif text-lg text-brand-900 mb-4">Tarjeta de sellos</h2>
              <div className="space-y-5">

                {/* Sellos totales */}
                <div>
                  <label className="block text-xs font-medium text-brand-700 mb-1.5 uppercase tracking-wide">
                    Cantidad total de sellos
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min={3} max={20} step={1}
                      value={settings.totalSlots}
                      onChange={e => update('totalSlots', Number(e.target.value))}
                      className="flex-1 accent-brand-500"
                    />
                    <span className="w-12 text-center font-semibold text-brand-900 bg-brand-50 rounded-xl py-1.5">
                      {settings.totalSlots}
                    </span>
                  </div>
                  <p className="text-brand-300 text-xs mt-1.5">
                    Cuántos sellos necesita el cliente para obtener el descuento. (3–20)
                  </p>
                </div>

                {/* Sellos de bienvenida */}
                <div>
                  <label className="block text-xs font-medium text-brand-700 mb-1.5 uppercase tracking-wide">
                    Sellos de bienvenida
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min={0} max={Math.max(0, settings.totalSlots - 1)} step={1}
                      value={settings.initialStamps}
                      onChange={e => update('initialStamps', Number(e.target.value))}
                      className="flex-1 accent-brand-500"
                    />
                    <span className="w-12 text-center font-semibold text-brand-900 bg-brand-50 rounded-xl py-1.5">
                      {settings.initialStamps}
                    </span>
                  </div>
                  <p className="text-brand-300 text-xs mt-1.5">
                    Sellos que recibe el cliente al registrarse (incentivo de inicio).
                  </p>
                </div>

                {/* Vista previa mini */}
                <div>
                  <p className="text-xs font-medium text-brand-500 uppercase tracking-wide mb-2">
                    Vista previa
                  </p>
                  <div className="flex flex-wrap gap-1.5 p-3 bg-cream-100 rounded-2xl">
                    {Array.from({ length: settings.totalSlots }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ${
                          i < settings.initialStamps
                            ? 'bg-brand-200 border-brand-300'
                            : 'border-brand-200 bg-white'
                        }`}
                      >
                        {i < settings.initialStamps && (
                          <span className="text-brand-600 text-xs">★</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-brand-300 text-xs mt-1">
                    {settings.initialStamps} de bienvenida · {settings.totalSlots - settings.initialStamps} por compras
                  </p>
                </div>
              </div>
            </div>

            {/* Descuento */}
            <div className="bg-white rounded-3xl border border-brand-100 p-6">
              <h2 className="font-serif text-lg text-brand-900 mb-4">Descuento</h2>
              <div>
                <label className="block text-xs font-medium text-brand-700 mb-1.5 uppercase tracking-wide">
                  Porcentaje de descuento al completar la tarjeta
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={5} max={50} step={5}
                    value={settings.discountPercentage}
                    onChange={e => update('discountPercentage', Number(e.target.value))}
                    className="flex-1 accent-brand-500"
                  />
                  <span className="w-16 text-center font-semibold text-brand-900 bg-brand-50 rounded-xl py-1.5 text-lg">
                    {settings.discountPercentage}%
                  </span>
                </div>
                <div className="mt-3 flex gap-2">
                  {[10, 15, 20, 25, 30].map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => update('discountPercentage', v)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                        settings.discountPercentage === v
                          ? 'bg-brand-900 text-white'
                          : 'bg-brand-50 text-brand-700 hover:bg-brand-100'
                      }`}
                    >
                      {v}%
                    </button>
                  ))}
                </div>
                <p className="text-brand-300 text-xs mt-2">
                  El cliente recibe este descuento en su próxima compra al completar los {settings.totalSlots} sellos.
                </p>
              </div>
            </div>

            {/* Feedback */}
            {feedback && (
              <div className={`rounded-2xl px-5 py-4 text-sm font-medium ${
                feedback.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                {feedback.type === 'success' ? '✅ ' : '❌ '}{feedback.msg}
              </div>
            )}

            {/* Guardar */}
            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full py-4 text-base"
            >
              {saving ? 'Guardando…' : '💾 Guardar configuración'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
