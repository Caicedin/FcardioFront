'use client'

import { useEffect, useState } from 'react'
import { Loader2, ArrowLeft, UserCircle, Activity, HeartPulse, FileText, ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { DescargarAnalisisIA } from '@/components/Pdf/DescargarAnalisisIA'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [medicalProfile, setMedicalProfile] = useState<any>(null)
  const [historiaClinica, setHistoriaClinica] = useState<any>(null)
  const [parq, setParq] = useState<any>(null)
  const [evaluacionMorfo, setEvaluacionMorfo] = useState<any>(null)
  const [funcionCardiaca, setFuncionCardiaca] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
        const headers = { Authorization: `Bearer ${token}` }

        const userRes = await axios.get('http://localhost:3001/fcardio/api/v1/auth/profile', { headers })
        const userData = userRes.data
        setUser(userData)
        const userId = userData.userId

        const profileRes = await axios.get('http://localhost:3001/fcardio/api/v1/medical-profiles', { headers })
        const perfil = profileRes.data.find((p: any) => String(p.userId).trim() === String(userId).trim())
        if (perfil) {
          setMedicalProfile(perfil)

          const historiaRes = await axios.get('http://localhost:3001/fcardio/api/v1/historias-clinicas', { headers })
          const historia = historiaRes.data.find((h: any) => String(h.profileId).trim() === String(perfil.id).trim())
          setHistoriaClinica(historia || null)

          const parqRes = await axios.get('http://localhost:3001/fcardio/api/v1/parq', { headers })
          const parqItem = parqRes.data.find((p: any) => String(p.profileId).trim() === String(perfil.id).trim())
          setParq(parqItem || null)

          const evalRes = await axios.get('http://localhost:3001/fcardio/api/v1/evaluaciones-morfofuncionales', { headers })
          const evalItem = evalRes.data.find((e: any) => String(e.profileId).trim() === String(perfil.id).trim())
          setEvaluacionMorfo(evalItem || null)

          const fcRes = await axios.get('http://localhost:3001/fcardio/api/v1/funciones-cardiacas', { headers })
          const fcData = fcRes.data.find((f: any) => String(f.profileId).trim() === String(perfil.id).trim())
          setFuncionCardiaca(fcData || null)
        }
      } catch (error) {
        console.error('Error al cargar perfil:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin w-10 h-10 text-orange-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <div className="w-full max-w-3xl space-y-8">

        <button
          onClick={() => router.back()}
          className="flex items-center text-orange-600 font-semibold hover:text-orange-800 transition"
        >
          <ArrowLeft className="mr-2" size={20} /> Volver
        </button>

        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center space-y-2">
          <UserCircle className="w-20 h-20 text-orange-400" />
          <h1 className="text-xl font-semibold text-gray-800">{user?.name} {user?.lastname}</h1>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>

        <section className="space-y-6">

          <InfoCard
            title="Perfil Médico"
            icon={<Activity className="w-5 h-5 text-orange-400" />}
            content={medicalProfile ? (
              <>
                <InfoItem label="Fecha de Evaluación" value={medicalProfile.fechaEvaluacion} />
                <InfoItem label="Clasificación IA" value={medicalProfile.clasificacionIa || 'N/A'} />
                <DescargarAnalisisIA
  datos={{
    clasificacionIa: medicalProfile.clasificacionIa,
    justificacionIa: Array.isArray(medicalProfile.justificacionIa)
      ? medicalProfile.justificacionIa
      : JSON.parse(medicalProfile.justificacionIa || '[]'),
    observacionesGenerales: Array.isArray(medicalProfile.observacionesGenerales)
      ? medicalProfile.observacionesGenerales
      : JSON.parse(medicalProfile.observacionesGenerales || '[]'),
  }}
/>

              </>
            ) : <EmptyMessage />}
          />

          <InfoCard
            title="Historia Clínica"
            icon={<FileText className="w-5 h-5 text-orange-400" />}
            content={historiaClinica ? (
              <>
                <InfoItem label="Enfermedades Previas" value={historiaClinica.enfermedadesPrevias} />
                <InfoItem label="Perfil Lipídico" value={historiaClinica.perfilLipidico} />
                <InfoItem label="Perfil Glicémico" value={historiaClinica.perfilGlicemico} />
                <InfoItem label="Perfil Hipertensivo" value={historiaClinica.perfilHipertensivo} />
                <InfoItem label="Perfil Morfológico" value={historiaClinica.perfilMorfologico} />
                <InfoItem label="Historial Deportivo" value={historiaClinica.historialDeportivo} />
              </>
            ) : <EmptyMessage />}
          />

          <InfoCard
            title="Cuestionario PAR-Q"
            icon={<ShieldCheck className="w-5 h-5 text-orange-400" />}
            content={parq ? (
              <>
                {Object.entries(parq.respuestas).map(([pregunta, respuesta]) => (
                  <InfoItem key={pregunta} label={`Pregunta ${pregunta.replace('pregunta', '')}`} value={respuesta ? 'Sí' : 'No'} />
                ))}
                <InfoItem label="¿Requiere valoración médica?" value={parq.requiereValoracion ? 'Sí' : 'No'} />
              </>
            ) : <EmptyMessage />}
          />

          <InfoCard
            title="Evaluación Morfofuncional"
            icon={<HeartPulse className="w-5 h-5 text-orange-400" />}
            content={evaluacionMorfo ? (
              <>
                <InfoItem label="Peso" value={`${evaluacionMorfo.peso} kg`} />
                <InfoItem label="Talla" value={`${evaluacionMorfo.talla} m`} />
                <InfoItem label="IMC" value={evaluacionMorfo.imc} />
                <InfoItem label="Porcentaje de Grasa" value={evaluacionMorfo.porcentajeGrasa || 'N/A'} />
                <InfoItem label="Masa Magra" value={evaluacionMorfo.masaMagra || 'N/A'} />
                <InfoItem label="Edad Metabólica" value={evaluacionMorfo.edadMetabolica || 'N/A'} />

                {(evaluacionMorfo.porcentajeGrasa == null ||
                  evaluacionMorfo.masaMagra == null ||
                  evaluacionMorfo.edadMetabolica == null) && (
                  <button
                    onClick={() => router.push('/user-routes/evaluaciones-morfo')}
                    className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded transition"
                  >
                    Completar información
                  </button>
                )}
              </>
            ) : <EmptyMessage />}
          />

          <InfoCard
            title="Funciones Cardíacas"
            icon={<HeartPulse className="w-5 h-5 text-orange-400" />}
            content={funcionCardiaca ? (
              <>
                <InfoItem label="FC Reposo" value={`${funcionCardiaca.fcReposo} bpm`} />
                <InfoItem label="FC Máx Teórica" value={`${funcionCardiaca.fcMaxTeorica} bpm`} />
                <InfoItem label="FC Post Test" value={funcionCardiaca.fcPostTest || 'N/A'} />
                <InfoItem label="IRC" value={funcionCardiaca.irc || 'N/A'} />
                <InfoItem label="VO2 Max" value={funcionCardiaca.vo2max || 'N/A'} />
                <InfoItem label="VO2 Pico" value={funcionCardiaca.vo2pico || 'N/A'} />
                <InfoItem label="VAM" value={funcionCardiaca.vam || 'N/A'} />
                <InfoItem label="VAM Ajustada" value={funcionCardiaca.vamAjustada || 'N/A'} />
              </>
            ) : <EmptyMessage />}
          />

        </section>
      </div>
    </div>
  )
}

function InfoCard({ title, icon, content }: any) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center mb-4">
        {icon}
        <h2 className="ml-2 text-sm uppercase font-semibold text-gray-500">{title}</h2>
      </div>
      <div className="space-y-1 text-sm text-gray-700">
        {content}
      </div>
    </div>
  )
}

function InfoItem({ label, value }: any) {
  return (
    <p>
      <span className="font-medium text-gray-600">{label}:</span> {value}
    </p>
  )
}

function EmptyMessage() {
  return <p className="text-gray-400 italic">No hay datos registrados.</p>
}
