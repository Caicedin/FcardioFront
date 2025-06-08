'use client'

import { usePathname } from 'next/navigation'
import PublicLayout from '@/components/layouts/PublicLayout'
import PrivateLayout from '@/components/layouts/PrivateLayout'

export default function LayoutSelector({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const isPublic =
    pathname.startsWith('/public-routes') ||
    pathname === '/login' ||
    pathname === '/register'

  return isPublic ? (
    <PublicLayout>{children}</PublicLayout>
  ) : (
    <PrivateLayout>{children}</PrivateLayout>
  )
}
