'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AdminLoginPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const redirect     = searchParams.get('redirect') ?? '/admin/dashboard'

  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Contraseña incorrecta.')
        return
      }

      router.push(redirect)
      router.refresh()
    } catch {
      setError('Error de conexión.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(160deg, #2C1E0F 0%, #4A3320 60%, #6E5234 100%)' }}>

      <div className="w-full max-w-sm animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <p className="text-brand-300 text-xs tracking-[0.3em] uppercase mb-2">Panel de</p>
          <h1 className="font-serif text-4xl text-cream-50 font-light">Madedeco</h1>
          <div className="w-12 h-px bg-brand-500 mx-auto mt-3" />
        </div>

        {/* Card */}
        <div className="bg-cream-50 rounded-3xl p-8 shadow-2xl">
          <h2 className="font-serif text-xl text-brand-900 mb-1">Acceso Administrativo</h2>
          <p className="text-brand-400 text-sm mb-6">Ingresá la contraseña para continuar.</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-brand-700 mb-1.5 uppercase tracking-wide">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field"
                disabled={loading}
                autoFocus
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
              className="btn-primary w-full py-3.5"
            >
              {loading ? 'Ingresando…' : 'Ingresar →'}
            </button>
          </form>
        </div>

        <p className="text-brand-500 text-xs text-center mt-6">
          ← <a href="/" className="hover:text-brand-300 transition-colors">Volver al sitio de clientes</a>
        </p>
      </div>
    </main>
  )
}
