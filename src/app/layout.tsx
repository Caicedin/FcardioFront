import './globals.css'
import LayoutSelector from '@/components/Layoutselector'

export const metadata = {
  title: 'FCardio',
  description: 'Sistema de evaluación y rutinas personalizadas',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased bg-white text-gray-800">
        <LayoutSelector>{children}</LayoutSelector>
      </body>
    </html>
  )
}
