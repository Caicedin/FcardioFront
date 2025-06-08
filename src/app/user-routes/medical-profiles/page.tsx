'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

export default function MedicalProfilePage() {
  const router = useRouter()
  const [userId, setUserId] = useState('')
  const [form, setForm] = useState({
    fechaEvaluacion: '',
    clasificacionIa: '',
    justificacionIa: '',
    observacionesGenerales: '',
  })
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

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
      .then(res => res.json())
      .then(data => {
        if (!data?.userId) throw new Error('Usuario no válido')
        setUserId(data.userId)
      })
      .catch(err => {
        console.error(err)
        router.push('/public-routes/login')
      })
      .finally(() => setLoading(false))
  }, [router])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMensaje('')
    setError('')

    const token = localStorage.getItem('token')
    try {
      const res = await fetch('http://localhost:3001/fcardio/api/v1/medical-profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, ...form }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Error al crear el perfil clínico')

      setMensaje('Perfil médico guardado correctamente.')

      // Revisión automática para redirigir al siguiente formulario pendiente
      const headers = { Authorization: `Bearer ${token}` }
      const profileId = data.data.id;
      localStorage.setItem('profileId', profileId);

      const historiaRes = await axios.get('http://localhost:3001/fcardio/api/v1/historias-clinicas', { headers });
      const historia = historiaRes.data.find((h: any) => h.profileId === profileId);


      if (!historia) {
        router.push('/user-routes/historia-clinica')
        return
      }

      const parqRes = await axios.get('http://localhost:3001/fcardio/api/v1/parq', { headers })
      const parq = parqRes.data.find((p: any) => p.profileId === profileId)

      if (!parq) {
        router.push('/user-routes/parq')
        return
      }

      const evalRes = await axios.get('http://localhost:3001/fcardio/api/v1/evaluaciones-morfofuncionales', { headers })
      const evaluacion = evalRes.data.find((e: any) => e.profileId === profileId)

      if (!evaluacion) {
        router.push('/user-routes/evaluaciones-morfo')
        return
      }

      // Si todo está completo, vuelve al dashboard
      router.push('/user-routes/dashboard')

    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading) return <p className="text-center mt-10">Cargando datos del usuario...</p>

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl rounded-xl p-8 w-full max-w-2xl space-y-5"
      >
        <h1 className="text-2xl font-bold text-orange-600 text-center">Crear Perfil Médico</h1>

        <input
          type="date"
          name="fechaEvaluacion"
          value={form.fechaEvaluacion}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded px-4 py-2 bg-blue-50"
        />

        <input
          type="text"
          name="clasificacionIa"
          placeholder="Clasificación IA"
          value={form.clasificacionIa}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded px-4 py-2 bg-blue-50"
        />

        <textarea
          name="justificacionIa"
          placeholder="Justificación IA"
          rows={3}
          value={form.justificacionIa}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded px-4 py-2 bg-blue-50"
        />

        <textarea
          name="observacionesGenerales"
          placeholder="Observaciones generales"
          rows={3}
          value={form.observacionesGenerales}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded px-4 py-2 bg-blue-50"
        />

        <button
          type="submit"
          className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700 transition"
        >
          Guardar Perfil Médico
        </button>

        {mensaje && <p className="text-green-600 text-center">{mensaje}</p>}
        {error && <p className="text-red-600 text-center">{error}</p>}
      </form>
    </div>
  )
}
