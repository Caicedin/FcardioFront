'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiLogOut, FiUser, FiMenu } from 'react-icons/fi'

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    fetch('http://localhost:3001/fcardio/api/v1/auth/profile', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setUser(data)

        fetch('http://localhost:3001/fcardio/api/v1/medical-profiles', {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(res => res.json())
          .then(perfiles => {
            const perfil = perfiles.find((p: any) => p.userId === data.userId)
            if (perfil?.id) {
              localStorage.setItem('profileId', perfil.id)
              console.log('✔ profileId actualizado en localStorage:', perfil.id)
            }
          })
          .catch(err => console.error('Error buscando perfil médico:', err))
      })
      .catch(() => {})
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('profileId')
    router.push('/public-routes/login')
  }

  const getInitials = (name: string) => {
    const [first, last] = name?.trim().split(' ')
    return (first?.charAt(0) ?? '') + (last?.charAt(0) ?? '')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-blue-100 shadow-sm border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="flex justify-between items-center min-h-[5.5rem] py-2">
            {/* Logo + saludo */}
            <div className="flex items-center space-x-4">
             <img 
  src="/fcardio-logo.png" 
  alt="Fcardio Logo" 
  className="h-20 w-auto max-w-[300px]" 
/>
              {user && (
                <span className="hidden md:inline text-gray-600 font-medium text-sm">
                  Hola, <span className="text-gray-900">{user.name}</span>
                </span>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <FiMenu className="h-6 w-6" />
              </button>
            </div>

            {/* Desktop navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {user && (
                <button
                  onClick={() => router.push('/user-routes/Profile')}
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                  title="Ver perfil"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-medium flex items-center justify-center">
                    {getInitials(user.name).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">Mi perfil</span>
                </button>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors"
              >
                <FiLogOut className="h-5 w-5" />
                <span className="text-sm font-medium">Salir</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-3 px-4">
            <div className="flex flex-col space-y-3">
              {user && (
                <button
                  onClick={() => {
                    router.push('/user-routes/Profile')
                    setIsMenuOpen(false)
                  }}
                  className="flex items-center space-x-2 text-gray-700 py-2 px-3 rounded hover:bg-gray-100"
                >
                  <FiUser className="h-5 w-5" />
                  <span>Mi perfil</span>
                </button>
              )}
              <button
                onClick={() => {
                  handleLogout()
                  setIsMenuOpen(false)
                }}
                className="flex items-center space-x-2 text-gray-700 py-2 px-3 rounded hover:bg-gray-100"
              >
                <FiLogOut className="h-5 w-5" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  )
}