import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminFromCookies } from '@/lib/auth'

export async function GET() {
  const isAdmin = await getAdminFromCookies()
  if (!isAdmin) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })

  try {
    const settings = await prisma.settings.findUnique({ where: { id: 'singleton' } })
    if (!settings) {
      // Crear configuración por defecto si no existe
      const created = await prisma.settings.create({
        data: { id: 'singleton', businessName: 'Madedeco', discountPercentage: 20, totalSlots: 10, initialStamps: 2 },
      })
      return NextResponse.json(created)
    }
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Settings GET error:', error)
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const isAdmin = await getAdminFromCookies()
  if (!isAdmin) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })

  try {
    const { businessName, discountPercentage, totalSlots, initialStamps } = await req.json()

    // Validaciones
    if (discountPercentage < 1 || discountPercentage > 100)
      return NextResponse.json({ error: 'El descuento debe estar entre 1% y 100%.' }, { status: 400 })
    if (totalSlots < 3 || totalSlots > 20)
      return NextResponse.json({ error: 'Los slots deben estar entre 3 y 20.' }, { status: 400 })
    if (initialStamps < 0 || initialStamps >= totalSlots)
      return NextResponse.json({ error: 'Los sellos iniciales deben ser menores al total.' }, { status: 400 })

    const settings = await prisma.settings.upsert({
      where:  { id: 'singleton' },
      update: { businessName, discountPercentage, totalSlots, initialStamps },
      create: { id: 'singleton', businessName, discountPercentage, totalSlots, initialStamps },
    })

    return NextResponse.json({ success: true, settings })
  } catch (error) {
    console.error('Settings PUT error:', error)
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 })
  }
}
