'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Icon from '@/components/Icons'
import FloatingLoyaltyCard from '@/components/FloatingLoyaltyCard'

/* ── Floating ambient particles ──────────────────────────── */
const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  size:     Math.random() * 7 + 3,
  x:        Math.random() * 100,
  y:        Math.random() * 100,
  dur:      Math.random() * 9 + 6,
  delay:    Math.random() * 5,
  color:    ['#9E7E5C', '#C4A882', '#B89670', '#D0B897'][i % 4],
}))

/* ── Step cards ──────────────────────────────────────────── */
const HOW_IT_WORKS = [
  { Icon: Icon.ShoppingBag, label: 'Comprás',        sub: 'en el local',     color: 'from-brand-100 to-brand-50'   },
  { Icon: Icon.Tag,         label: 'Acumulás sellos', sub: 'por cada compra', color: 'from-amber-50 to-cream-100'   },
  { Icon: Icon.Gift,        label: '20% OFF',          sub: 'al completar',   color: 'from-brand-50 to-cream-100'   },
]

export default function HomePage() {
  const router  = useRouter()
  const [email,   setEmail]   = useState('')
  const [name,    setName]    = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [mounted, setMounted] = useState(false)

  // Focus ref for email input
  const emailRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const lookupRes  = await fetch('/api/lookup', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      })
      const lookupData = await lookupRes.json()

      if (!lookupRes.ok) { setError(lookupData.error ?? 'Ocurrió un error.'); return }

      if (lookupData.found) { router.push(`/card/${lookupData.token}`); return }

      if (!name.trim()) {
        setError('Por favor completá tu nombre para crear tu tarjeta.')
        setLoading(false)
        return
      }

      const registerRes  = await fetch('/api/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name: name.trim(), email }),
      })
      const registerData = await registerRes.json()

      if (!registerRes.ok) { setError(registerData.error ?? 'Ocurrió un error.'); return }

      router.push(`/card/${registerData.token}`)
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden">

      {/* ── Animated gradient background ───────────────────── */}
      <div className="absolute inset-0 mesh-bg-warm" />

      {/* ── Decorative blurred orbs ────────────────────────── */}
      <div
        className="absolute -top-40 -right-40 w-[480px] h-[480px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(196,168,130,0.22), transparent 70%)' }}
      />
      <div
        className="absolute -bottom-48 -left-24 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(158,126,92,0.18), transparent 70%)' }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full pointer-events-none opacity-30"
        style={{ background: 'radial-gradient(ellipse, rgba(232,215,190,0.4), transparent 70%)' }}
      />

      {/* ── Floating particles (client-only) ───────────────── */}
      {mounted && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {PARTICLES.map((p, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width:                    p.size + 'px',
                height:                   p.size + 'px',
                left:                     p.x + '%',
                top:                      p.y + '%',
                background:               p.color,
                animationName:            'particleFloat',
                animationDuration:        p.dur + 's',
                animationDelay:           p.delay + 's',
                animationTimingFunction:  'ease-in-out',
                animationIterationCount:  'infinite',
              }}
            />
          ))}
        </div>
      )}

      {/* ── Content ────────────────────────────────────────── */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-14 gap-0">

        {/* Logo */}
        <div className={`text-center mb-7 ${mounted ? 'animate-reveal-up delay-0' : 'opacity-0'}`}>
          <Image
            src="/LogoMadeDeco.webp"
            alt="Made Deco"
            width={230}
            height={90}
            className="mx-auto mb-3 drop-shadow-sm"
            priority
          />
          <div className="flex items-center justify-center gap-3 mb-2.5">
            <div className="h-px w-10 bg-brand-300" />
            <div className="w-1 h-1 rounded-full bg-brand-400" />
            <div className="h-px w-10 bg-brand-300" />
          </div>
          <p className="font-accent text-brand-500 text-xl tracking-wide">
            Tarjeta de Fidelización
          </p>
        </div>

        {/* 3D Floating loyalty card preview */}
        <div
          className={`w-full max-w-[340px] mb-8 ${mounted ? 'animate-reveal-up delay-100' : 'opacity-0'}`}
        >
          {/* Floating wrapper with continuous float animation */}
          <div className="animate-float-card">
            <FloatingLoyaltyCard stamps={3} totalSlots={8} />
          </div>

          {/* Soft shadow below card */}
          <div
            className="mx-auto mt-3 rounded-full opacity-30"
            style={{
              width: '70%',
              height: '12px',
              background: 'radial-gradient(ellipse, rgba(100,70,40,0.4), transparent 70%)',
              filter: 'blur(6px)',
            }}
          />
        </div>

        {/* How it works — 3 steps */}
        <div className={`w-full max-w-[340px] mb-6 ${mounted ? 'animate-reveal-up delay-200' : 'opacity-0'}`}>
          <div className="grid grid-cols-3 gap-2.5 relative">

            {/* Connector lines between steps */}
            <div className="absolute top-[22px] left-[33%] right-[33%] h-px bg-gradient-to-r from-brand-200 via-brand-300 to-brand-200 pointer-events-none" />

            {HOW_IT_WORKS.map(({ Icon: I, label, sub, color }, idx) => (
              <div
                key={label}
                className="group relative"
                style={{ animationDelay: `${0.2 + idx * 0.08}s` }}
              >
                <div
                  className={`glass-warm rounded-2xl p-3 text-center border border-brand-100
                    hover:border-brand-300 hover:shadow-lg
                    active:scale-95 transition-all duration-300 cursor-default`}
                >
                  {/* Icon bubble */}
                  <div
                    className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color}
                      flex items-center justify-center mx-auto mb-2
                      group-hover:scale-110 group-hover:shadow-md
                      transition-all duration-300 border border-brand-100`}
                  >
                    <I className="w-5 h-5 text-brand-500 group-hover:text-brand-700 transition-colors" />
                  </div>
                  <p className="font-semibold text-brand-900 text-[11px] leading-tight">{label}</p>
                  <p className="text-brand-400 text-[9.5px] mt-0.5 leading-tight">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form glass card */}
        <div className={`w-full max-w-[340px] ${mounted ? 'animate-reveal-up delay-300' : 'opacity-0'}`}>
          <div className="glass-warm rounded-3xl shadow-2xl p-7 border border-brand-100"
            style={{ boxShadow: '0 24px 64px rgba(100,70,30,0.18), 0 4px 16px rgba(100,70,30,0.10)' }}>

            {/* Form header */}
            <div className="text-center mb-5">
              <h2 className="font-serif text-[1.4rem] text-brand-900 font-light mb-0.5">
                Accedé a tu tarjeta
              </h2>
              <p className="font-accent text-brand-400 text-[1rem] leading-snug">
                Ingresá tus datos para continuar
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Email */}
              <div className="group">
                <label className="block font-label text-brand-600 mb-1.5">Email</label>
                <div className="relative">
                  <Icon.Envelope className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-300 group-focus-within:text-brand-500 transition-colors" />
                  <input
                    ref={emailRef}
                    type="email"
                    required
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError('') }}
                    placeholder="maria@ejemplo.com"
                    className="input-field pl-10"
                    disabled={loading}
                    autoFocus
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Name */}
              <div className="group">
                <label className="block font-label text-brand-600 mb-1.5">Nombre completo</label>
                <div className="relative">
                  <Icon.User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-300 group-focus-within:text-brand-500 transition-colors" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => { setName(e.target.value); setError('') }}
                    placeholder="María García"
                    className="input-field pl-10"
                    disabled={loading}
                    autoComplete="name"
                  />
                </div>
                <p className="text-brand-300 text-[11px] mt-1.5 leading-snug">
                  Solo necesario si es tu primera vez.
                </p>
              </div>

              {/* Error state */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3
                  text-red-700 text-sm flex items-center gap-2
                  animate-reveal-up delay-0">
                  <Icon.XCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full mt-1 py-3.5 text-[0.95rem] relative overflow-hidden group/btn
                  hover:shadow-lg active:scale-[0.98] transition-all duration-200"
                style={{ boxShadow: '0 4px 16px rgba(100,70,30,0.28)' }}
              >
                {/* Shimmer overlay on hover */}
                <span className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"
                  style={{ background: 'linear-gradient(108deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)' }} />
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Verificando…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1.5">
                    Ver mi tarjeta
                    <span className="group-hover/btn:translate-x-1 transition-transform duration-200 inline-block">→</span>
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className={`text-center mt-8 space-y-1 ${mounted ? 'animate-reveal-up delay-500' : 'opacity-0'}`}>
          <p className="text-brand-300 text-[11px]">
            © {new Date().getFullYear()} Made Deco · Buenos Aires
    