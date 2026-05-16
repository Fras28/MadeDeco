'use client'

import { useEffect, useState, useRef } from 'react'
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

export default function CardPage() {
  const { token }                 = useParams<{ token: string }>()
  const [card,    setCard]        = useState<CardData | null>(null)
  const [loading, setLoading]     = useState(true)
  const [error,   setError]       = useState('')
  const [qrUrl,   setQrUrl]       = useState('')
  const [copied,  setCopied]      = useState(false)
  const canvasRef                 = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!token) return
    fetch(`/api/card/${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); return }
        setCard(data)
        const cardUrl = `${window.location.origin}/admin/stamp/${token}`
        QRCode.toDataURL(cardUrl, {
          width:  280,
          margin: 2,
          color:  { dark: '#2C1E0F', light: '#FAFAF8' },
        }).then(setQrUrl)
      })
      .catch(() => setError('No se pudo cargar la tarjeta.'))
      .finally(() => setLoading(false))
  }, [token])

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(160deg, #FAF7F3 0%, #EDE5D8 100%)' }}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
          <p className="text-brand-500 font-light">Cargando tu tarjeta…</p>
        </div>
      </div>
    )
  }

  if (error || !card) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4"
        style={{ background: 'linear-gradient(160deg, #FAF7F3 0%, #EDE5D8 100%)' }}>
        <div className="text-center max-w-sm">
          <Icon.Search className="w-14 h-14 text-brand-300 mx-auto mb-4" />
          <h2 className="font-serif text-2xl text-brand-900 mb-2">Tarjeta no encontrada</h2>
          <p className="text-brand-500 mb-6">{error || 'Este enlace no es válido.'}</p>
          <Link href="/" className="btn-primary">Crear mi tarjeta</Link>
        </div>
      </div>
    )
  }

  const progress = Math.round((card.stamps / card.totalSlots) * 100)

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
      style={{ background: 'linear-gradient(160deg, #FAF7F3 0%, #EDE5D8 100%)' }}>

      {/* Header */}
      <div className="text-center mb-6 animate-fade-in-up">
        <Image
          src="/LogoMadeDeco.webp"
          alt="Made Deco"
          width={200}
          height={78}
          className="mx-auto mb-3"
          priority
        />
        <p className="font-accent text-brand-400 text-lg">
          Tu Tarjeta Fiel
        </p>
      </div>

      {/* Tarjeta principal */}
      <div className="loyalty-card w-full max-w-sm animate-fade-in-up" style={{ animationDelay: '0.1s' }}>

        <div className="px-6 pt-7 pb-5">
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="font-serif text-xl text-brand-900">{card.name}</p>
              <p className="text-brand-400 text-xs">{card.email}</p>
            </div>
            {card.completed ? (
              <span className="badge-completed">Completa</span>
            ) : (
              <span className="badge-progress">
                {card.stamps}/{card.totalSlots}
              </span>
            )}
          </div>

          <div className="mt-4 mb-1">
            <div className="flex justify-between mb-1.5">
              <span className="font-label text-brand-400">Progreso</span>
              <span className="font-label text-brand-400">{progress}%</span>
            </div>
            <div className="h-1.5 bg-brand-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center px-6 mb-5">
          <div className="flex-1 h-px bg-brand-100" />
          <div className="mx-3 text-brand-300 text-xs">✦</div>
          <div className="flex-1 h-px bg-brand-100" />
        </div>

        <div className="px-6 pb-6">
          <div className="grid grid-cols-5 gap-3 justify-items-center">
            {Array.from({ length: card.totalSlots }).map((_, i) => {
              const isFilled  = i < card.stamps
              const isInitial = i < 2
              return (
                <div
                  key={i}
                  className={`stamp-slot ${isFilled ? (isInitial ? 'initial' : 'filled') : ''}`}
                  style={isFilled ? { animationDelay: `${i * 0.05}s` } : {}}
                  title={isFilled ? (isInitial ? 'Sello de bienvenida' : 'Compra realizada') : 'Pendiente'}
                >
                  {isFilled && (
                    <DachshundIcon variant={isInitial ? 'dark' : 'light'} />
                  )}
                  {!isFilled && (
                    <span className="text-brand-200 text-xs font-light">{i + 1}</span>
                  )}
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-brand-400">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-brand-100 border border-brand-300" />
              <span>Bienvenida</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-brand-500" />
              <span>Compra</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full border-2 border-brand-200" />
              <span>Pendiente</span>
            </div>
          </div>
        </div>

        {card.completed ? (
          <div className="mx-6 mb-6 p-4 rounded-2xl text-center"
            style={{ background: 'linear-gradient(135deg, #9E7E5C, #B89670)' }}>
            <p className="text-white font-serif text-2xl mb-0.5">{card.discountPercentage}% OFF</p>
            <p className="text-white/80 text-xs">
              Presentá esta tarjeta en tu próxima compra
            </p>
          </div>
        ) : (
          <div className="mx-6 mb-6 p-3 bg-brand-50 rounded-2xl text-center border border-brand-100">
            <p className="text-brand-700 text-sm">
              <span className="font-semibold">{card.totalSlots - card.stamps} sellos más</span>
              {' '}para obtener{' '}
              <span className="font-semibold text-brand-600">{card.discountPercentage}% de descuento</span>
            </p>
          </div>
        )}
      </div>

      {/* QR Code */}
      <div className="mt-6 w-full max-w-sm animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="bg-white rounded-3xl shadow-lg p-6 border border-brand-100 text-center">
          <p className="font-label text-brand-400 mb-4">
            Tu código QR
          </p>
          {qrUrl ? (
            <img
              src={qrUrl}
              alt="QR de tu tarjeta"
              className="mx-auto rounded-2xl"
              style={{ width: 200, height: 200 }}
            />
          ) : (
            <div className="w-[200px] h-[200px] mx-auto bg-brand-50 rounded-2xl animate-pulse" />
          )}
          <p className="text-brand-400 text-xs mt-4 leading-relaxed">
            Mostrá este QR en el local para que sumen tu sello automáticamente
          </p>

          <button onClick={handleCopyLink} className="btn-secondary w-full mt-4 text-xs flex items-center justify-center gap-2">
            {copied ? (
              <><Icon.CheckCircle className="w-4 h-4" /> Enlace copiado</>
            ) : (
              <><Icon.QrCode className="w-4 h-4" /> Compartir mi tarjeta</>
            )}
          </button>
        </div>
      </div>

      <Link
        href="/"
        className="mt-6 text-brand-400 text-xs hover:text-brand-600 transition-colors"
      >
        ← Volver al inicio
      </Link>
    </main>
  )
}
