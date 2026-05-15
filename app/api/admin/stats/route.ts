import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminFromCookies } from '@/lib/auth'

export async function GET() {
  const isAdmin = await getAdminFromCookies()
  if (!isAdmin) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  try {
    const settings = await prisma.settings.findUnique({ where: { id: 'singleton' } })
    const totalSlots = settings?.totalSlots ?? 10

    const [
      totalCustomers,
      completedCards,
      totalStamps,
      recentStamps,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({ where: { stamps: { gte: totalSlots } } }),
      prisma.stampLog.count(),
      prisma.stampLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { customer: { select: { name: true, email: true } } },
      }),
    ])

    return NextResponse.json({
      totalCustomers,
      completedCards,
      totalStamps,
      discountPercentage: settings?.discountPercentage ?? 20,
      recentStamps: recentStamps.map(s => ({
        id:           s.id,
        customerName: s.customer.name,
        createdAt:    s.createdAt,
      })),
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 })
  }
}
