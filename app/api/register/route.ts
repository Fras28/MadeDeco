import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json()

    if (!email || !name) {
      return NextResponse.json(
        { error: 'El email y el nombre son requeridos.' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'El email ingresado no es válido.' },
        { status: 400 }
      )
    }

    // Verificar si ya existe
    const existing = await prisma.customer.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (existing) {
      return NextResponse.json({
        success: true,
        token: existing.token,
        isExisting: true,
        message: '¡Ya tenés tu tarjeta! Te redirigimos a ella.',
      })
    }

    // Obtener configuración
    const settings = await prisma.settings.findUnique({
      where: { id: 'singleton' },
    })
    const initialStamps = settings?.initialStamps ?? 2

    const customer = await prisma.customer.create({
      data: {
        email:  email.toLowerCase().trim(),
        name:   name.trim(),
        token:  uuidv4(),
        stamps: initialStamps,
      },
    })

    return NextResponse.json({
      success:    true,
      token:      customer.token,
      isExisting: false,
      message:    '¡Bienvenido/a! Tu tarjeta fue creada exitosamente.',
    })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Error interno. Intentá de nuevo.' },
      { status: 500 }
    )
  }
}
