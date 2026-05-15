import { NextRequest, NextResponse } from 'next/server'
import { signAdminToken, getAdminCookieOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json()

    const adminPassword = process.env.ADMIN_PASSWORD ?? 'madedeco2024'

    if (password !== adminPassword) {
      return NextResponse.json(
        { error: 'Contraseña incorrecta.' },
        { status: 401 }
      )
    }

    const token = await signAdminToken()
    const options = getAdminCookieOptions()

    const response = NextResponse.json({ success: true })
    response.cookies.set({
      ...options,
      value: token,
    })

    return response
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 })
  }
}
