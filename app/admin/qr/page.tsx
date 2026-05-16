'use client'

import { useEffect, useRef, useState } from 'react'
import AdminNav from '@/components/AdminNav'
import Icon from '@/components/Icons'
import QRCode from 'qrcode'

export default function QrMostradorPage() {
  const canvasRef      = useRef<HTMLCanvasElement>(null)
  const previewRef     = useRef<HTMLCanvasElement>(null)
  const previewWrapRef = useRef<HTMLDivElement>(null)
  const [siteUrl,    setSiteUrl]    = useState('')
  const [qrReady,    setQrReady]    = useState(false)
  const [copied,     setCopied]     = useState(false)
  const [rendering,  setRendering]  = useState(true)

  useEffect(() => {
    const url = window.location.origin
    setSiteUrl(url)
    renderCard(url)
  }, [])

  // ── Paleta de marca ──────────────────────────────────────────
  const BRAND = {
    cream:    '#FAF7F3',
    cream2:   '#F0E8DC',
    cream3:   '#E8DDD0',
    brown50:  '#F5EFE8',
    brown100: '#E8D9C8',
    brown300: '#C4A882',
    brown500: '#9E7E5C',
    brown700: '#6E5234',
    brown900: '#2C1E0F',
    gold:     '#B89670',
  }

  // ── Render en canvas (fullres para descarga + preview) ────────
  async function renderCard(url: string) {
    setRendering(true)

    const W = 900
    const H = 1200

    // ── Off-screen canvas (alta resolución para descarga) ──
    const offscreen = document.createElement('canvas')
    offscreen.width  = W
    offscreen.height = H
    const ctx = offscreen.getContext('2d')!

    // Fondo degradado
    const bg = ctx.createLinearGradient(0, 0, 0, H)
    bg.addColorStop(0,    BRAND.cream)
    bg.addColorStop(0.4,  BRAND.cream2)
    bg.addColorStop(1,    BRAND.cream3)
    ctx.fillStyle = bg
    roundRect(ctx, 0, 0, W, H, 0)
    ctx.fill()

    // Marco exterior (borde dorado)
    ctx.strokeStyle = BRAND.brown300
    ctx.lineWidth   = 3
    roundRect(ctx, 20, 20, W - 40, H - 40, 28)
    ctx.stroke()

    // Marco interior decorativo (fino)
    ctx.strokeStyle = BRAND.brown100
    ctx.lineWidth   = 1
    roundRect(ctx, 36, 36, W - 72, H - 72, 20)
    ctx.stroke()

    // ── Logo Made Deco ─────────────────────────────────────
    const logo = await loadImage('/LogoMadeDeco.webp')
    const logoW = 340
    const logoH = Math.round(logo.height * (logoW / logo.width))
    ctx.drawImage(logo, (W - logoW) / 2, 90, logoW, logoH)

    const afterLogo = 90 + logoH + 28

    // Línea separadora fina
    ctx.strokeStyle = BRAND.brown300
    ctx.lineWidth   = 1
    drawLine(ctx, W * 0.2, afterLogo, W * 0.8, afterLogo)

    // Subtítulo
    ctx.fillStyle  = BRAND.brown500
    ctx.font       = '400 34px Georgia, serif'
    ctx.textAlign  = 'center'
    ctx.fillText('Tarjeta de Fidelización', W / 2, afterLogo + 52)

    // Tag "Sumate al programa"
    const pillY = afterLogo + 76
    const pillW = 300
    const pillH = 40
    const pillX = (W - pillW) / 2
    ctx.fillStyle = BRAND.brown100
    roundRect(ctx, pillX, pillY, pillW, pillH, 20)
    ctx.fill()
    ctx.fillStyle = BRAND.brown700
    ctx.font      = '600 14px "Helvetica Neue", Helvetica, Arial, sans-serif'
    ctx.letterSpacing = '0.12em'
    ctx.fillText('SUMATE AL PROGRAMA', W / 2, pillY + 27)
    ctx.letterSpacing = '0em'

    // ── QR Code ────────────────────────────────────────────
    const QR_SIZE = 380
    const qrDataUrl = await QRCode.toDataURL(url, {
      width:  QR_SIZE,
      margin: 1,
      color:  { dark: BRAND.brown900, light: '#00000000' },
      errorCorrectionLevel: 'H',
    })
    const qrImg = await loadImage(qrDataUrl)

    // Tarjeta blanca del QR
    const qrCardW = QR_SIZE + 60
    const qrCardH = QR_SIZE + 60
    const qrCardX = (W - qrCardW) / 2
    const qrCardY = pillY + pillH + 50

    ctx.fillStyle   = '#FFFFFF'
    ctx.shadowColor = 'rgba(44,30,15,0.12)'
    ctx.shadowBlur  = 30
    ctx.shadowOffsetY = 8
    roundRect(ctx, qrCardX, qrCardY, qrCardW, qrCardH, 28)
    ctx.fill()
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur  = 0
    ctx.shadowOffsetY = 0

    // Borde sutil de la tarjeta QR
    ctx.strokeStyle = BRAND.brown100
    ctx.lineWidth   = 1.5
    roundRect(ctx, qrCardX, qrCardY, qrCardW, qrCardH, 28)
    ctx.stroke()

    // QR image
    ctx.drawImage(qrImg, qrCardX + 30, qrCardY + 30, QR_SIZE, QR_SIZE)

    const afterQr = qrCardY + qrCardH + 46

    // ── Separador decorativo ✦ ─────────────────────────────
    ctx.fillStyle  = BRAND.brown300
    ctx.font       = '20px serif'
    ctx.textAlign  = 'center'
    ctx.fillText('✦', W / 2, afterQr)

    ctx.strokeStyle = BRAND.brown100
    ctx.lineWidth   = 1
    drawLine(ctx, W * 0.15, afterQr - 8, W * 0.43, afterQr - 8)
    drawLine(ctx, W * 0.57, afterQr - 8, W * 0.85, afterQr - 8)

    // ── Texto call-to-action ───────────────────────────────
    ctx.fillStyle  = BRAND.brown900
    ctx.font       = 'italic 400 32px Georgia, serif'
    ctx.textAlign  = 'center'
    ctx.fillText('Escaneá y sumá sellos', W / 2, afterQr + 52)

    ctx.fillStyle  = BRAND.brown500
    ctx.font       = '400 22px Georgia, serif'
    ctx.fillText('Completá tu tarjeta y obtené', W / 2, afterQr + 90)

    // Badge de descuento
    const badgeY = afterQr + 112
    const badgeW = 260
    const badgeH = 50
    const badgeX = (W - badgeW) / 2
    const badgeGrad = ctx.createLinearGradient(badgeX, badgeY, badgeX + badgeW, badgeY)
    badgeGrad.addColorStop(0, BRAND.brown500)
    badgeGrad.addColorStop(1, BRAND.gold)
    ctx.fillStyle = badgeGrad
    roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 25)
    ctx.fill()

    ctx.fillStyle = '#FFFFFF'
    ctx.font      = '700 26px Georgia, serif'
    ctx.fillText('20% de descuento', W / 2, badgeY + 34)

    // ── URL en el pie ──────────────────────────────────────
    const urlText = url.replace(/^https?:\/\//, '')
    ctx.fillStyle  = BRAND.brown300
    ctx.font       = '400 18px "Helvetica Neue", Helvetica, Arial, sans-serif'
    ctx.letterSpacing = '0.05em'
    ctx.fillText(urlText, W / 2, H - 60)
    ctx.letterSpacing = '0em'

    // Línea pie
    ctx.strokeStyle = BRAND.brown100
    ctx.lineWidth   = 1
    drawLine(ctx, W * 0.25, H - 78, W * 0.75, H - 78)

    // ── Volcar al canvas de descarga y al preview ──────────
    const downloadCanvas = canvasRef.current
    if (downloadCanvas) {
      downloadCanvas.width  = W
      downloadCanvas.height = H
      downloadCanvas.getContext('2d')!.drawImage(offscreen, 0, 0)
    }

    // Preview escalado — usa el ancho del contenedor padre (el canvas puede estar oculto)
    const preview   = previewRef.current
    const wrapEl    = previewWrapRef.current
    const availW    = wrapEl ? wrapEl.offsetWidth : 500
    const scale     = Math.min(availW / W, 1)
    if (preview) {
      preview.width  = Math.round(W * scale)
      preview.height = Math.round(H * scale)
      const pCtx = preview.getContext('2d')!
      pCtx.scale(scale, scale)
      pCtx.drawImage(offscreen, 0, 0)
    }

    setQrReady(true)
    setRendering(false)
  }

  function handleDownload() {
    const canvas = canvasRef.current
    if (!canvas) return
    const link    = document.createElement('a')
    link.download = 'madedeco-qr-mostrador.png'
    link.href     = canvas.toDataURL('image/png')
    link.click()
  }

  function handleCopy() {
    navigator.clipboard.writeText(siteUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <AdminNav />

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl text-brand-900">QR para mostrador</h1>
          <p className="text-brand-400 text-sm mt-1">
            Descargá la lámina de tu programa de fidelización para exhibir en el local
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ── Preview ─────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-3xl border border-brand-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <p className="font-label text-brand-500">Vista previa</p>
                {qrReady && (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <Icon.CheckCircle className="w-3.5 h-3.5" />
                    Lista para descargar
                  </span>
                )}
              </div>

              {/* Canvas preview */}
              <div
                ref={previewWrapRef}
                className="relative w-full rounded-2xl overflow-hidden bg-cream-100 flex items-center justify-center"
                style={{ minHeight: 400 }}
              >
                {rendering && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-cream-100 z-10">
                    <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-3" />
                    <p className="text-brand-400 text-sm">Generando diseño…</p>
                  </div>
                )}
                <canvas
                  ref={previewRef}
                  className="w-full h-auto rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* ── Acciones y info ─────────────────────────────── */}
          <div className="w-full lg:w-80 space-y-4">

            {/* Download */}
            <div className="bg-white rounded-3xl border border-brand-100 p-6">
              <h2 className="font-serif text-lg text-brand-900 mb-1">Descargar lámina</h2>
              <p className="text-brand-400 text-xs mb-5 leading-relaxed">
                PNG de alta resolución (900×1200 px), lista para imprimir o mostrar en pantalla.
              </p>

              <button
                onClick={handleDownload}
                disabled={!qrReady}
                className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon.ArrowDown className="w-5 h-5" />
                {qrReady ? 'Descargar PNG' : 'Generando…'}
              </button>
            </div>

            {/* URL del sitio */}
            <div className="bg-white rounded-3xl border border-brand-100 p-6">
              <h2 className="font-serif text-lg text-brand-900 mb-1">URL del sitio</h2>
              <p className="text-brand-400 text-xs mb-4 leading-relaxed">
                El QR lleva a los clientes directamente a tu página de registro.
              </p>

              <div className="bg-brand-50 rounded-2xl px-4 py-3 mb-3 break-all">
                <p className="text-brand-700 text-sm font-mono">{siteUrl || '…'}</p>
              </div>

              <button
                onClick={handleCopy}
                className="btn-secondary w-full py-2.5 text-sm flex items-center justify-center gap-2"
              >
                {copied ? (
                  <><Icon.CheckCircle className="w-4 h-4 text-green-500" /> Copiado</>
                ) : (
                  <><Icon.QrCode className="w-4 h-4" /> Copiar enlace</>
                )}
              </button>
            </div>

            {/* Tips */}
            <div className="bg-brand-50 rounded-3xl border border-brand-100 p-6">
              <h2 className="font-serif text-lg text-brand-900 mb-3">Sugerencias de uso</h2>
              <ul className="space-y-2.5 text-brand-600 text-sm">
                {[
                  'Imprimí en papel fotográfico A5 o A4 para mayor calidad.',
                  'Plastificá la lámina para protegerla del uso diario.',
                  'Colocá el QR a la vista en la caja o mostrador.',
                  'También podés mostrarla en una tablet o pantalla.',
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-brand-200 flex items-center justify-center text-brand-700 text-xs font-semibold shrink-0">
                      {i + 1}
                    </span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Canvas oculto para descarga en alta resolución */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────────
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function drawLine(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number, x2: number, y2: number
) {
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload  = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}
