'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Dumbbell, Heart, BarChart2, User, LogOut } from 'lucide-react'

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const isAdminRoute = pathname.startsWith('/admin-routes')

  const menuItems = [
    { icon: <Dumbbell className="w-6 h-6" />, route: '/user-routes/Rutinas', label: 'Rutinas' },
    { icon: <Heart className="w-6 h-6" />, route: '/user-routes/zonas-entrenamiento', label: 'Zonas' },
    { icon: <BarChart2 className="w-6 h-6" />, route: '/user-routes/progreso', label: 'Progreso' },
    { icon: <User className="w-6 h-6" />, route: '/user-routes/Profile', label: 'Perfil' },
  ]

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/public-routes/login')
  }

  return (
    <div className="flex min-h-screen">
      {!isAdminRoute && (
        <aside className="fixed top-0 left-0 h-screen w-24 bg-orange-600 flex flex-col items-center py-4 space-y-6 z-40">
          <button
            onClick={() => router.push('/user-routes/dashboard')}
            className="text-white text-xl font-bold hover:text-yellow-300"
          >
            F
          </button>
          <nav className="flex flex-col space-y-6 mt-4">
            {menuItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => router.push(item.route)}
                className="flex flex-col items-center text-white hover:text-yellow-300 text-xs"
              >
                {item.icon}
                <span className="mt-1">{item.label}</span>
              </button>
            ))}
          </nav>
          <button
            onClick={handleLogout}
            className="mt-auto mb-2 text-pink-200 hover:text-pink-300 flex flex-col items-center text-xs"
          >
            <LogOut className="w-6 h-6" />
            <span className="mt-1">Salir</span>
          </button>
        </aside>
      )}
      <main className={`flex-1 bg-gray-50 ${!isAdminRoute ? 'ml-24' : ''}`}>
        {children}
      </main>
    </div>
  )
}
