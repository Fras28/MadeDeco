import { getAdminFromCookies } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminNav from '@/components/AdminNav'

export const metadata = {
  title: 'Admin – Madedeco Fidelización',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // La página de login (/admin) se maneja por separado;
  // las subpáginas son protegidas por el middleware.
  return (
    <div className="min-h-screen bg-cream-100">
      {children}
    </div>
  )
}
