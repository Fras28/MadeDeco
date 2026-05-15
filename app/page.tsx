'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function HomePage() {
  const router = useRouter()
  const [name,    setName]    = useState('')
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name, email }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Ocurrió un error.')
        return
      }

      router.push(`/card/${data.token}`)
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(160deg, #FAF7F3 0%, #EDE5D8 100%)' }}>

      {/* Logo / Header */}
      <div className="text-center mb-10 animate-fade-in-up">
        <p className="text-brand-500 text-sm font-medium tracking-[0.2em] uppercase mb-3">
          Fragancias & Deco
        </p>
        <h1 className="font-serif text-5xl md:text-6xl text-brand-900 font-light mb-3">
          Madedeco
        </h1>
        <div className="w-16 h-px bg-brand-400 mx-auto mb-4" />
        <p className="text-brand-600 text-lg font-light">
          Tarjeta de Fidelización
        </p>
      </div>

      {/* Explicación */}
      <div className="w-full max-w-sm mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { icon: '🛍️', text: 'Comprás' },
            { icon: '🔖', text: 'Acumulás sellos' },
            { icon: '🎁', text: '20% OFF' },
          ].map(({ icon, text }) => (
            <div key={text} className="bg-white/70 rounded-2xl p-3 border border-brand-100">
              <div className="text-2xl mb-1">{icon}</div>
              <p className="text-xs text-brand-700 font-medium">{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Formulario */}
      <div className="w-full max-w-sm animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-brand-100">
          <h2 className="font-serif text-2xl text-brand-900 mb-1 text-center">
            Crear mi tarjeta
          </h2>
          <p className="text-brand-500 text-sm text-center mb-6">
            O accedé a la tuya si ya sos cliente
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-brand-700 mb-1.5 uppercase tracking-wide">
                Nombre completo
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="María García"
                className="input-field"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-brand-700 mb-1.5 uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="maria@ejemplo.com"
                className="input-field"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2 py-3.5 text-base"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Procesando…
                </span>
              ) : (
                'Ver mi tarjeta →'
              )}
            </button>
          </form>

          <p className="text-brand-400 text-xs text-center mt-5">
            Si ya sos cliente, ingresá tu email y accedemos a tu tarjeta.
          </p>
        </div>
      </div>

      {/* Footer */}
      <p className="text-brand-400 text-xs text-center mt-8">
        © {new Date().getFullYear()} Madedeco · Buenos Aires
      </p>
    </main>
  )
}
