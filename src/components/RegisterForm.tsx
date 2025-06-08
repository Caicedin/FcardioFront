'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterForm() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    lastname: '',
    email: '',
    password: '',
    sexo: '',
    fechaNacimiento: '',
  })
  const [error, setError] = useState('')
  const [fadeIn, setFadeIn] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => setFadeIn(true), 100)
    return () => clearTimeout(timeout)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const res = await fetch('http://localhost:3001/fcardio/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Error al registrar')
      }

      router.push('/public-routes/login')
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className={`bg-white shadow-xl rounded-2xl p-8 w-full max-w-md space-y-4 transform transition-all duration-500 ${
          fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-wide text-orange-600">FCardio</h1>
          <p className="text-sm text-gray-400 mt-1">Crea tu cuenta</p>
        </div>

        <input
          type="text"
          name="name"
          placeholder="Nombre"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-blue-50"
        />

        <input
          type="text"
          name="lastname"
          placeholder="Apellido"
          value={form.lastname}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-blue-50"
        />

        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-blue-50"
        />

        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-blue-50"
        />

        <select
          name="sexo"
          value={form.sexo}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded px-4 py-2 bg-blue-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="">Selecciona tu sexo</option>
          <option value="M">Masculino</option>
          <option value="F">Femenino</option>
        </select>

        <input
          type="date"
          name="fechaNacimiento"
          value={form.fechaNacimiento}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-blue-50"
        />

        <button
          type="submit"
          className="w-full bg-orange-600 text-white py-2 rounded-md hover:bg-orange-700 transition"
        >
          Registrarme
        </button>

        {error && <p className="text-center text-red-500 text-sm">{error}</p>}

        <p className="text-sm text-center">
          ¿Ya tienes cuenta?{' '}
          <a href="/public-routes/login" className="text-orange-600 hover:underline">
            Inicia sesión
          </a>
        </p>
      </form>
    </div>
  )
}
