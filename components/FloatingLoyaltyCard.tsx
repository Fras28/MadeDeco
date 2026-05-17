'use client'

import { useEffect, useRef } from 'react'
import DachshundIcon from './DachshundIcon'

interface Props {
  stamps?:    number
  totalSlots?: number
  name?:      string
}

export default function FloatingLoyaltyCard({
  stamps     = 3,
  totalSlots = 8,
  name       = 'María García',
}: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const cardRef    = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const wrapper = wrapperRef.current
    const card    = cardRef.current
    if (!wrapper || !card) return

    let rafId: number
    let targetRX = -4
    let targetRY =  8
    let currentRX = -4
    let currentRY =  8

    // Desktop: follow mouse globally
    const onMouseMove = (e: MouseEvent) => {
      const rect = wrapper.getBoundingClientRect()
      const cx   = rect.left + rect.width  / 2
      const cy   = rect.top  + rect.height / 2
      targetRY = ((e.clientX - cx) / (rect.width  / 2)) * 14
      targetRX = -((e.clientY - cy) / (rect.height / 2)) * 9
    }
    const onMouseLeave = () => { targetRX = -4; targetRY = 8 }
    wrapper.addEventListener('mousemove', onMouseMove)
    wrapper.addEventListener('mouseleave', onMouseLeave)

    // Touch: follow finger
    const onTouchMove = (e: TouchEvent) => {
      if (!e.touches[0]) return
      const rect = wrapper.getBoundingClientRect()
      const cx   = rect.left + rect.width  / 2
      const cy   = rect.top  + rect.height / 2
      targetRY = ((e.touches[0].clientX - cx) / (rect.width  / 2)) * 8
      targetRX = -((e.touches[0].clientY - cy) / (rect.height / 2)) * 5
    }
    wrapper.addEventListener('touchmove', onTouchMove, { passive: true })

    // Smooth interpolation loop
    function tick() {
      currentRX += (targetRX - currentRX) * 0.07
      currentRY += (targetRY - currentRY) * 0.07
      if (card) card.style.transform = `rotateX(${currentRX}deg) rotateY(${currentRY}deg)`
      rafId = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      cancelAnimationFrame(rafId)
      wrapper.removeEventListener('mousemove', onMouseMove)
      wrapper.removeEventListener('mouseleave', onMouseLeave)
      wrapper.removeEventListener('touchmove', onTouchMove)
    }
  }, [])

  const progress = Math.round((stamps / totalSlots) * 100)

  return (
    <div
      ref={wrapperRef}
      className="card-3d-wrapper w-full max-w-[340px] mx-auto cursor-pointer select-none"
      style={{ filter: 'drop-shadow(0 28px 48px rgba(158,126,92,0.28))' }}
    >
      <div
        ref={cardRef}
        className="card-3d holo-card loyalty-card"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Golden top accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-[3px] rounded-t-3xl"
          style={{ background: 'linear-gradient(90deg, #7E6040, #C4A882, #D4B896, #C4A882, #7E6040)' }}
        />

        {/* Header */}
        <div className="px-6 pt-7 pb-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-serif text-[1.15rem] text-brand-900 leading-snug">{name}</p>
              <p className="text-brand-400 text-[11px] mt-0.5">Tarjeta de Fidelización</p>
            </div>
            <span className="badge-progress text-[10px] mt-0.5">
              {stamps}/{totalSlots}
            </span>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-label text-brand-400" style={{ fontSize: '0.65rem' }}>Progreso</span>
              <span className="font-label text-brand-500" style={{ fontSize: '0.65rem' }}>{progress}%</span>
            </div>
            <div className="h-[5px] bg-brand-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #9E7E5C, #C4A882)',
                  transition: 'width 1s cubic-bezier(0.16,1,0.3,1)',
                }}
              />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center px-6 mb-4">
          <div className="flex-1 h-px bg-brand-100" />
          <span className="mx-3 text-brand-300 text-[10px]">✦</span>
          <div className="flex-1 h-px bg-brand-100" />
        </div>

        {/* Stamp grid */}
        <div className="px-5 pb-5">
          <div className="grid grid-cols-4 gap-2.5 justify-items-center">
            {Array.from({ length: totalSlots }).map((_, i) => {
              const filled  = i < stamps
              const initial = i < 2
              return (
                <div
                  key={i}
                  className={`stamp-slot ${filled ? (initial ? 'initial' : 'filled') : ''}`}
                  style={{
                    width: 52,
                    height: 52,
                    animationDelay: filled ? `${i * 0.06}s` : '0s',
                  }}
                  title={filled ? (initial ? 'Sello de bienvenida' : 'Compra realizada') : 'Pendiente'}
                >
                  {filled  && <DachshundIcon variant={initial ? 'dark' : 'light'} />}
                  {!filled && <span className="text-brand-200 text-[11px] font-light">{i + 1}</span>}
                </div>
              )
            })}
          </div>
        </div>

        {/* Reward banner */}
        <div className="mx-5 mb-5 px-4 py-2.5 bg-brand-50 rounded-2xl text-center border border-brand-100">
          <p className="text-brand-700 text-xs">
            <span className="font-semibold">{totalSlots - stamps} sellos más</span>
            {' '}→{' '}
            <span className="font-semibold text-brand-600">20% de descuento</span>
          </p>
        </div>
      </div>
    </div>
  )
}
