import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// POST /api/lookup — checks if an email is already registered
// Returns { found: true, token } or { found: false }
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'El email es requerido.' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: 'El email ingresado no es válido.' },
        { status: 400 }
      )
    }

    const customer = await prisma.customer.findUnique({
      where:  { email: email.toLowerCase().trim() },
      select: { token: true },
    })

    if (customer) {
      return NextResponse.json({ found: true, token: customer.token })
    }

    return NextResponse.json({ found: false })
  } catch (error) {
    console.error('Lookup error:', error)
    return NextResponse.json(
      { error: 'Error interno. Intentá de nuevo.' },
      { status: 500 }
    )
  }
}
