'use client'

import { usePathname } from 'next/navigation'
import PublicLayout from './PublicLayout'
import PrivateLayout from './PrivateLayout'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const publicPaths = ['/login', '/register', '/forgot-password']
  const isPublic = publicPaths.includes(pathname)

  return isPublic ? <PublicLayout>{children}</PublicLayout> : <PrivateLayout>{children}</PrivateLayout>
}
