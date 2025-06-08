'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface AuthUser {
  userId: string
  email: string
  name: string
  lastname: string
  role: string
  isActive: boolean
}

export function useAuth(requiredRole?: 'admin' | 'usuario') {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      router.push('/public-routes/login')
      return
    }

    fetch('http://localhost:3001/fcardio/api/v1/auth/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (requiredRole && data.role !== requiredRole) {
          router.push('/public-routes/login')
        } else {
          setUser(data)
        }
      })
      .catch(() => {
        localStorage.removeItem('token')
        router.push('/public-routes/login')
      })
      .finally(() => setLoading(false))
  }, [requiredRole, router])

  return { user, loading }
}
