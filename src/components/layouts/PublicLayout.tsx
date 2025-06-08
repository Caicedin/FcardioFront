'use client'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-col min-h-screen bg-gray-50">
      <header className="w-full bg-orange-600 p-4 text-white font-bold text-xl">
        FCardio
      </header>
      <div className="flex-grow flex justify-center items-center">
        {children}
      </div>
      <footer className="w-full bg-gray-200 p-2 text-center text-sm text-gray-600">
        © {new Date().getFullYear()} FCardio. Todos los derechos reservados.
      </footer>
    </main>
  )
}
