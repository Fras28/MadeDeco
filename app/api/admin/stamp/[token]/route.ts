import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminFromCookies } from '@/lib/auth'

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  const isAdmin = await getAdminFromCookies()
  if (!isAdmin) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const note = body?.note ?? ''

    const customer = await prisma.customer.findUnique({
      where: { token: params.token },
    })

    if (!customer) {
      return NextResponse.json({ error: 'Cliente no encontrado.' }, { status: 404 })
    }

    const settings = await prisma.settings.findUnique({ where: { id: 'singleton' } })
    const totalSlots = settings?.totalSlots ?? 10

    if (customer.stamps >= totalSlots) {
      return NextResponse.json(
        { error: 'La tarjeta ya está completa. Primero usá el descuento.', completed: true },
        { status: 400 }
      )
    }

    const [updatedCustomer] = await prisma.$transaction([
      prisma.customer.update({
        where: { token: params.token },
        data:  { stamps: { increment: 1 } },
      }),
      prisma.stampLog.create({
        data: { customerId: customer.id, note },
      }),
    ])

    const nowCompleted = updatedCustomer.stamps >= totalSlots

    return NextResponse.json({
      success:     true,
      stamps:      updatedCustomer.stamps,
      completed:   nowCompleted,
      message:     nowCompleted
        ? `¡Tarjeta completa! ${customer.name} obtiene ${settings?.discountPercentage ?? 20}% de descuento.`
        : `Sello agregado. ${updatedCustomer.stamps}/${totalSlots} sellos.`,
    })
  } catch (error) {
    console.error('Stamp error:', error)
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 })
  }
}
