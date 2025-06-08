'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    fetch('http://localhost:3001/fcardio/api/v1/auth/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(() => {})
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/public-routes/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar con logo, perfil y botón de salir */}
      <div className="w-16 md:w-20 bg-white shadow-lg flex flex-col items-center py-6">
        {/* Logo */}
        <div className="mb-8">
          <div className="flex justify-center items-center bg-orange-600 rounded-full h-12 w-12 text-white text-2xl font-bold">
            F
          </div>
        </div>

        {/* Separador flexible */}
        <div className="flex-grow" />

        {/* Avatar del usuario */}
        {user && (
          <div className="mb-4 flex flex-col items-center">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mb-1">
              {user.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="text-xs text-center text-gray-600 hidden md:block">
              {user.name?.split(' ')[0] || 'Usuario'}
            </div>
          </div>
        )}

        {/* Botón de cerrar sesión */}
        <div className="mb-6">
          <button
            onClick={handleLogout}
            className="p-2 rounded-full hover:bg-red-100 text-red-500"
            title="Cerrar sesión"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </div>
      </div>      {/* Contenido principal */}
      <div className="flex-1">
        <header className="flex justify-between items-center p-4 bg-white shadow">
          <h1 className="font-bold text-lg">Panel Administrador</h1>
        </header>
        <main className="p-4">{children}</main>
      </div>
    </div>
  )
}
