import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { token: params.token },
      include: {
        stampLogs: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    })

    if (!customer) {
      return NextResponse.json({ error: 'Tarjeta no encontrada.' }, { status: 404 })
    }

    const settings = await prisma.settings.findUnique({
      where: { id: 'singleton' },
    })

    return NextResponse.json({
      id:                customer.id,
      name:              customer.name,
      email:             customer.email,
      token:             customer.token,
      stamps:            customer.stamps,
      discountUsed:      customer.discountUsed,
      totalSlots:        settings?.totalSlots         ?? 10,
      discountPercentage: settings?.discountPercentage ?? 20,
      completed:         customer.stamps >= (settings?.totalSlots ?? 10),
      stampLogs:         customer.stampLogs.map(l => ({
        id:        l.id,
        createdAt: l.createdAt,
      })),
    })
  } catch (error) {
    console.error('Card fetch error:', error)
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 })
  }
}
