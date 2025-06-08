'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [fadeIn, setFadeIn] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => setFadeIn(true), 100)
    return () => clearTimeout(timeout)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const res = await fetch('http://localhost:3001/fcardio/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Error al iniciar sesión')

      localStorage.setItem('token', data.access_token)

      const profile = await fetch('http://localhost:3001/fcardio/api/v1/auth/profile', {
        headers: { Authorization: `Bearer ${data.access_token}` },
      })

      const user = await profile.json()
      router.push(user.role === 'admin' ? '/admin-routes/dashboard' : '/user-routes/dashboard')
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={handleLogin}
        className={`bg-white shadow-xl rounded-2xl p-8 w-full max-w-md space-y-5 transform transition-all duration-500 ${
          fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-wide text-orange-600">FCardio</h1>
          <p className="text-sm text-gray-400 mt-1">Bienvenido de vuelta</p>
        </div>

        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-blue-50"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-blue-50"
          required
        />

        <button
          type="submit"
          className="w-full bg-orange-600 text-white py-2 rounded-md hover:bg-orange-700 transition"
        >
          Entrar
        </button>

        {error && <p className="text-center text-red-500 text-sm">{error}</p>}

        <p className="text-sm text-center">
          ¿No tienes cuenta?{' '}
          <a href="/public-routes/register" className="text-orange-600 hover:underline">
            Regístrate
          </a>
        </p>
      </form>
    </div>
  )
}
