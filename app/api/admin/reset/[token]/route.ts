import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminFromCookies } from '@/lib/auth'

export async function POST(
  _req: NextRequest,
  { params }: { params: { token: string } }
) {
  const isAdmin = await getAdminFromCookies()
  if (!isAdmin) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  try {
    const customer = await prisma.customer.findUnique({
      where: { token: params.token },
    })

    if (!customer) {
      return NextResponse.json({ error: 'Cliente no encontrado.' }, { status: 404 })
    }

    const settings = await prisma.settings.findUnique({ where: { id: 'singleton' } })
    const initialStamps = settings?.initialStamps ?? 2

    await prisma.customer.update({
      where: { token: params.token },
      data: {
        stamps:       initialStamps,
        discountUsed: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: `Tarjeta de ${customer.name} reiniciada con ${initialStamps} sellos. Descuento registrado como usado.`,
    })
  } catch (error) {
    console.error('Reset error:', error)
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 })
  }
}
