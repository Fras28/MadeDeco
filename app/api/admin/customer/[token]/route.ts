import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminFromCookies } from '@/lib/auth'

export async function GET(
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
      include: {
        stampLogs: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!customer) {
      return NextResponse.json({ error: 'Cliente no encontrado.' }, { status: 404 })
    }

    const settings = await prisma.settings.findUnique({ where: { id: 'singleton' } })

    return NextResponse.json({
      id:                 customer.id,
      name:               customer.name,
      email:              customer.email,
      token:              customer.token,
      stamps:             customer.stamps,
      discountUsed:       customer.discountUsed,
      totalSlots:         settings?.totalSlots ?? 10,
      discountPercentage: settings?.discountPercentage ?? 20,
      completed:          customer.stamps >= (settings?.totalSlots ?? 10),
      createdAt:          customer.createdAt,
      stampLogs:          customer.stampLogs,
    })
  } catch (error) {
    console.error('Customer fetch error:', error)
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 })
  }
}
