'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import QRCode from 'qrcode'
import DachshundIcon from '@/components/DachshundIcon'
import Icon from '@/components/Icons'

interface CardData {
  name:               string
  email:              string
  token:              string
  stamps:             number
  discountUsed:       boolean
  totalSlots:         number
  discountPercentage: number
  completed:          boolean
}

/* ── Confetti burst on card completion ─────────────────────── */
const CONFETTI_COLORS = ['#9E7E5C', '#C4A882', '#D4B896', '#B89670', '#EDE5D8', '#F5F0EA']

function ConfettiBurst() {
  const pieces = Array.from({ length: 28 }, (_, i) => ({
    color:  CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    left:   Math.random() * 100,
    dur:    Math.random() * 2.5 + 2,
    delay:  Math.random() * 1.5,
    size:   Math.random() * 8 + 5,
    shape:  i % 3 === 0 ? '50%' : i % 3 === 1 ? '0%' : '2px',
  }))
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((p, i) => (
        <div
          key={i}
          className="absolute top-0 confetti-piece"
          style={{
            left:                    p.left + '%',
            width:                   p.size + 'px',
            height:                  p.size + 'px',
            background:              p.color,
            borderRadius:            p.shape,
            animationDuration:       p.dur + 's',
            animationDelay:          p.delay + 's',
            opacity:                 0.85,
          }}
        />
      ))}
    </div>
  )
}

/* ── Interactive 3D stamp slot ─────────────────────────────── */
function StampSlot({ filled, initial, index }: { filled: boolean; initial: boolean; index: number }) {
  const [pressed, setPressed] = useState(false)

  return (
    <div
      className={`stamp-slot ${filled ? (initial ? 'initial' : 'filled') : ''}
        cursor-default select-none transition-all duration-200`}
      style={{
        width:          54,
        height:         54,
        animationDelay: filled ? `${index * 0.055}s` : '0s',
        transform:      pressed ? 'scale(0.92) translateY(2px)' : 'scale(1)',
        boxShadow:      filled
          ? '0 4px 12px rgba(158,126,92,0.28)'
          : '0 2px 6px rgba(0,0,0,0.06)',
      }}
      onMouseEnter={() => filled && setPressed(true)}
      onMouseLeave={() => setPressed(false)}
      title={filled ? (initial ? 'Sello de bienvenida' : 'Compra realizada') : 'Pendiente'}
    >
      {filled  && <DachshundIcon variant={initial ? 'dark' : 'light'} />}
      {!filled && <span className="text-brand-200 text-xs font-light">{index + 1}</span>}
    </div>
  )
}

/* ── Main card page ─────────────────────────────────────────── */
export default function CardPage() {
  const { token }              = useParams<{ token: string }>()
  const [card,    setCard]     = useState<CardData | null>(null)
  const [loading, setLoading]  = useState(true)
  const [error,   setError]    = useState('')
  const [qrUrl,   setQrUrl]    = useState('')
  const [copied,  setCopied]   = useState(false)
  const [mounted, setMounted]  = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  // 3D tilt refs for the main loyalty card
  const wrapperRef = useRef<HTMLDivElement>(null)
  const cardRef    = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!token) return
    fetch(`/api/card/${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); return }
        setCard(data)

        // Confetti burst if card is just completed
        if (data.completed && !data.discountUsed) {
          setTimeout(() => setShowConfetti(true), 600)
          setTimeout(() => setShowConfetti(false), 5000)
        }

        const cardUrl = `${window.location.origin}/admin/stamp/${data.token}`
        QRCode.toDataURL(cardUrl, {
          width:  260,
          margin: 2,
          color:  { dark: '#2C1E0F', light: '#FAFAF8' },
        }).then(setQrUrl)
      })
      .catch(() => setError('No se pudo cargar la tarjeta.'))
      .finally(() => setLoading(false))
  }, [token])

  // 3D tilt effect on the loyalty card
  useEffect(() => {
    const wrapper = wrapperRef.current
    const card    = cardRef.current
    if (!wrapper || !card) return

    let rafId: number
    let targetRX = -3, targetRY = 5
    let curRX = -3, curRY = 5

    const onMove = (e: MouseEvent) => {
      const rect = wrapper.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top  + rect.height / 2
      targetRY = ((e.clientX - cx) / (rect.width  / 2)) * 12
      targetRX = -((e.clientY - cy) / (rect.height / 2)) * 8
    }
    const onLeave = () => { targetRX = -3; targetRY = 5 }

    function tick() {
      curRX += (targetRX - curRX) * 0.07
      curRY += (targetRY - curRY) * 0.07
      if (card) card.style.transform = `rotateX(${curRX}deg) rotateY(${curRY}deg)`
      rafId = requestAnimationFrame(tick)
    }
    wrapper.addEventListener('mousemove', onMove)
    wrapper.addEventListener('mouseleave', onLeave)
    tick()
    return () => {
      cancelAnimationFrame(rafId)
      wrapper.removeEventListener('mousemove', onMove)
      wrapper.removeEventListener('mouseleave', onLeave)
    }
  }, [card])

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    })
  }

  /* ── Loading ─────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center mesh-bg-warm">
        <div className="text-center glass-warm rounded-3xl p-10 shadow-xl border border-brand-100">
          <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-brand-500 font-accent text-lg">Cargando tu tarjeta…</p>
        </div>
      </div>
    )
  }

  /* ── Error ───────────────────────────────────────────────── */
  if (error || !card) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 mesh-bg-warm">
        <div className="text-center max-w-sm glass-warm rounded-3xl p-10 shadow-xl border border-brand-100">
          <Icon.Search className="w-14 h-14 text-brand-300 mx-auto mb-4" />
          <h2 className="font-serif text-2xl text-brand-900 mb-2">Tarjeta no encontrada</h2>
          <p className="text-brand-500 mb-6 text-sm">{error || 'Este enlace no es válido.'}</p>
          <Link href="/" className="btn-primary">Crear mi tarjeta</Link>
        </div>
      </div>
    )
  }

  const progress = Math.round((card.stamps / card.totalSlots) * 100)

  return (
    <main className="relative min-h-screen overflow-hidden">

      {/* ── Confetti on completion ──────────────────────────── */}
      {showConfetti && <ConfettiBurst />}

      {/* ── Background ─────────────────────────────────────── */}
      <div className="absolute inset-0 mesh-bg-warm" />
      <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(196,168,130,0.2), transparent 70%)' }} />
      <div className="absolute -bottom-40 -left-20 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(158,126,92,0.15), transparent 70%)' }} />

      {/* ── Content ────────────────────────────────────────── */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12 pb-16">

        {/* Logo */}
        <div className={`text-center mb-6 ${mounted ? 'animate-reveal-up delay-0' : 'opacity-0'}`}>
          <Image src="/LogoMadeDeco.webp" alt="Made Deco" width={190} height={74} className="mx-auto mb-2" priority />
          <div className="flex items-center justify-center gap-3 mb-1.5">
            <div className="h-px w-8 bg-brand-300" />
            <div className="w-1 h-1 rounded-full bg-brand-400" />
            <div className="h-px w-8 bg-brand-300" />
          </div>
          <p className="font-accent text-brand-400 text-base">Tu Tarjeta Fiel</p>
        </div>

        {/* ── Main loyalty card with 3D tilt ──────────────── */}
        <div
          className={`w-full max-w-[340px] mb-5 ${mounted ? 'animate-reveal-up delay-100' : 'opacity-0'}`}
        >
          <div
            ref={wrapperRef}
            className="card-3d-wrapper cursor-pointer"
            style={{ filter: 'drop-shadow(0 24px 40px rgba(100,70,30,0.22))' }}
          >
            <div
              ref={cardRef}
              className="card-3d holo-card loyalty-card"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Gold top accent */}
              <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-3xl"
                style={{ background: 'linear-gradient(90deg, #7E6040, #C4A882, #D4B896, #C4A882, #7E6040)' }} />

              {/* Card header */}
              <div className="px-6 pt-7 pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-serif text-xl text-brand-900">{card.name}</p>
                    <p className="text-brand-400 text-xs mt-0.5">{card.email}</p>
                  </div>
                  {card.completed ? (
                    <span className="badge-completed">Completa ✓</span>
                  ) : (
                    <span className="badge-progress">{card.stamps}/{card.totalSlots}</span>
                  )}
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="font-label text-brand-400">Progreso</span>
                    <span className="font-label text-brand-500">{progress}%</span>
                  </div>
                  <div className="h-[5px] bg-brand-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 delay-500"
                      style={{
                        width: `${progress}%`,
                        background: card.completed
                          ? 'linear-gradient(90deg, #6E5234, #9E7E5C, #C4A882)'
                          : 'linear-gradient(90deg, #9E7E5C, #C4A882)',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center px-6 mb-5">
                <div className="flex-1 h-px bg-brand-100" />
                <span className="mx-3 text-brand-300 text-xs">✦</span>
                <div className="flex-1 h-px bg-brand-100" />
              </div>

              {/* Stamp grid */}
              <div className="px-5 pb-5">
                <div className="grid grid-cols-5 gap-2.5 justify-items-center">
                  {Array.from({ length: card.totalSlots }).map((_, i) => (
                    <StampSlot
                      key={i}
                      filled={i < card.stamps}
                      initial={i < 2}
                      index={i}
                    />
                  ))}
                </div>

                {/* Stamp legend */}
                <div className="flex items-center justify-center gap-4 mt-4 text-[10px] text-brand-400">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-brand-100 border border-brand-300" />
                    <span>Bienvenida</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-brand-500" />
                    <span>Compra</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full border-2 border-brand-200" />
                    <span>Pendiente</span>
                  </div>
                </div>
              </div>

              {/* Reward section */}
              {card.completed ? (
                <div
                  className="mx-5 mb-6 p-4 rounded-2xl text-center relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #7E6040, #9E7E5C, #C4A882)' }}
                >
                  <div className="absolute inset-0 opacity-20"
                    style={{ background: 'repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(255,255,255,0.1) 6px, rgba(255,255,255,0.1) 12px)' }} />
                  <p className="relative text-white font-serif text-3xl mb-0.5 text-shimmer">
                    {card.discountPercentage}% OFF
                  </p>
                  <p className="relative text-white/80 text-xs leading-relaxed">
                    Presentá esta tarjeta en tu próxima compra
                  </p>
                </div>
              ) : (
                <div className="mx-5 mb-6 p-3 bg-brand-50/80 rounded-2xl text-center border border-brand-100">
                  <p className="text-brand-700 text-sm">
                    <span className="font-semibold">{card.totalSlots - card.stamps} sellos más</span>
                    {' '}→{' '}
                    <span className="font-semibold text-brand-600">{card.discountPercentage}% de descuento</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── QR Code panel ─────────────────────────────────── */}
        <div className={`w-full max-w-[340px] ${mounted ? 'animate-reveal-up delay-200' : 'opacity-0'}`}>
          <div
            className="glass-warm rounded-3xl p-6 text-center border border-brand-100"
            style={{ boxShadow: '0 16px 48px rgba(100,70,30,0.14), 0 2px 8px rgba(100,70,30,0.08)' }}
          >
            <p className="font-label text-brand-400 mb-4">Tu código QR</p>

            {qrUrl ? (
              <div className="relative inline-block">
                <img
                  src={qrUrl}
                  alt="QR de tu tarjeta"
                  className="mx-auto rounded-2xl"
                  style={{ width: 190, height: 190 }}
                />
                {/* Subtle border glow on QR */}
                <div className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{ boxShadow: 'inset 0 0 0 1.5px rgba(158,126,92,0.2)' }} />
              </div>
            ) : (
              <div
                className="w-[190px] h-[190px] mx-auto rounded-2xl animate-pulse"
                style={{ background: 'linear-gradient(135deg, #F2EBE0, #EDE5D8)' }}
              />
            )}

            <p className="text-brand-400 text-xs mt-4 leading-relaxed max-w-[220px] mx-auto">
              Mostrá este QR en el local para sumar tu sello automáticamente
            </p>

            <button
              onClick={handleCopyLink}
              className="btn-secondary w-full mt-4 text-sm flex items-center justify-center gap-2
                hover:shadow-md active:scale-[0.98] transition-all duration-200"
            >
              {copied ? (
                <>
                  <Icon.CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-green-700">Enlace copiado</span>
                </>
              ) : (
                <>
                  <Icon.QrCode className="w-4 h-4" />
                  Compartir mi tarjeta
                </>
              )}
            </button>
          </div>
        </div>

        {/* Back link */}
        <Link
          href="/"
          className={`mt-7 text-brand-400 text-xs hover:text-brand-600 transition-colors
            flex items-center gap-1 ${mounted ? 'animate-reveal-up delay-400' : 'opacity-0'}`}
        >
          <span>←</span> Volver al inicio
        </Link>
      </div>
    </main>
  )
}
  )
}
in>
  )
}
