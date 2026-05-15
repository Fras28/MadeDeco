import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminFromCookies } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const isAdmin = await getAdminFromCookies()
  if (!isAdmin) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') ?? ''
    const page   = parseInt(searchParams.get('page') ?? '1')
    const limit  = parseInt(searchParams.get('limit') ?? '20')
    const skip   = (page - 1) * limit

    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { name:  { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { _count: { select: { stampLogs: true } } },
      }),
      prisma.customer.count({ where }),
    ])

    const settings = await prisma.settings.findUnique({ where: { id: 'singleton' } })

    return NextResponse.json({
      customers: customers.map(c => ({
        id:           c.id,
        name:         c.name,
        email:        c.email,
        token:        c.token,
        stamps:       c.stamps,
        discountUsed: c.discountUsed,
        completed:    c.stamps >= (settings?.totalSlots ?? 10),
        createdAt:    c.createdAt,
      })),
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Customers list error:', error)
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 })
  }
}
