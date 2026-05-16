'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Icon from '@/components/Icons'

export default function HomePage() {
  const router = useRouter()

  const [email,   setEmail]   = useState('')
  const [name,    setName]    = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // 1. Check if email already exists
      const lookupRes  = await fetch('/api/lookup', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      })
      const lookupData = await lookupRes.json()

      if (!lookupRes.ok) {
        setError(lookupData.error ?? 'Ocurrió un error.')
        return
      }

      // 2a. Existing customer → go straight to their card
      if (lookupData.found) {
        router.push(`/card/${lookupData.token}`)
        return
      }

      // 2b. New customer → name is required
      if (!name.trim()) {
        setError('Por favor completá tu nombre para crear tu tarjeta.')
        setLoading(false)
        return
      }

      // 3. Register new customer
      const registerRes  = await fetch('/api/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name: name.trim(), email }),
      })
      const registerData = await registerRes.json()

      if (!registerRes.ok) {
        setError(registerData.error ?? 'Ocurrió un error.')
        return
      }

      router.push(`/card/${registerData.token}`)
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(160deg, #FAF7F3 0%, #EDE5D8 100%)' }}
    >

      {/* Logo */}
      <div className="text-center mb-10 animate-fade-in-up">
        <Image
          src="/LogoMadeDeco.webp"
          alt="Made Deco"
          width={280}
          height={110}
          className="mx-auto mb-4"
          priority
        />
        <div className="w-16 h-px bg-brand-300 mx-auto mb-3" />
        <p className="font-accent text-brand-500 text-xl">
          Tarjeta de Fidelización
        </p>
      </div>

      {/* How it works */}
      <div className="w-full max-w-sm mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { Icon: Icon.ShoppingBag, text: 'Comprás' },
            { Icon: Icon.Tag,         text: 'Acumulás sellos' },
            { Icon: Icon.Gift,        text: '20% OFF' },
          ].map(({ Icon: I, text }) => (
            <div key={text} className="bg-white/70 rounded-2xl p-3 border border-brand-100">
              <I className="w-6 h-6 mx-auto mb-1.5 text-brand-500" />
              <p className="text-xs text-brand-700 font-medium">{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Form card */}
      <div className="w-full max-w-sm animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-brand-100">

          <h2 className="font-serif text-2xl text-brand-900 mb-1 text-center font-light">
            Accedé a tu tarjeta
          </h2>
          <p className="font-accent text-brand-400 text-base text-center mb-6">
            Ingresá tus datos para continuar
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block font-label text-brand-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Icon.Envelope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-300" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  placeholder="maria@ejemplo.com"
                  className="input-field pl-9"
                  disabled={loading}
                  autoFocus
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block font-label text-brand-700 mb-1.5">
                Nombre completo
              </label>
              <div className="relative">
                <Icon.User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-300" />
                <input
                  type="text"
                  value={name}
                  onChange={e => { setName(e.target.value); setError('') }}
                  placeholder="María García"
                  className="input-field pl-9"
                  disabled={loading}
                />
              </div>
              <p className="text-brand-300 text-xs mt-1.5 leading-relaxed">
                Solo necesario si es tu primera vez. Si ya sos cliente, con el email alcanza.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm flex items-center gap-2">
                <Icon.XCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2 py-3.5 text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Verificando…
                </span>
              ) : (
                'Ver mi tarjeta →'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <p className="text-brand-300 text-xs text-center mt-8">
        © {new Date().getFullYear()} Made Deco · Buenos Aires
      </p>
    </main>
  )
}
