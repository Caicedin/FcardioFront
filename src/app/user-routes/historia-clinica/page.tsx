'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Loader2 } from 'lucide-react'
import CreatableSelect from 'react-select/creatable'

const enfermedadesOptions = [
  { value: 'Ninguna', label: 'Ninguna' },
  { value: 'Hipertensión arterial', label: 'Hipertensión arterial' },
  { value: 'Diabetes tipo 1', label: 'Diabetes tipo 1' },
  { value: 'Diabetes tipo 2', label: 'Diabetes tipo 2' },
  { value: 'Diabetes gestacional', label: 'Diabetes gestacional' },
  { value: 'Dislipidemia', label: 'Dislipidemia (colesterol alto)' },
  { value: 'Obesidad', label: 'Obesidad' },
  { value: 'Enfermedad renal crónica', label: 'Enfermedad renal crónica' },
  { value: 'EPOC', label: 'Enfermedad pulmonar obstructiva crónica (EPOC)' },
  { value: 'Asma', label: 'Asma' },
  { value: 'Cáncer', label: 'Cáncer (especificar tipo)' },
  { value: 'Enfermedades cardiovasculares', label: 'Enfermedades cardiovasculares' },
  { value: 'Artritis reumatoide', label: 'Artritis reumatoide' },
]

// Opciones para el perfil lipídico
const colesterolTotalOptions = [
  { value: 'Ninguna', label: 'Ninguna' },
  { value: 'Colesterol total <200 mg/dL', label: 'Colesterol total <200 mg/dL (Óptimo)' },
  { value: 'Colesterol total 200-239 mg/dL', label: 'Colesterol total 200-239 mg/dL (Límite alto)' },
  { value: 'Colesterol total ≥240 mg/dL', label: 'Colesterol total ≥240 mg/dL (Alto)' },
]

const ldlOptions = [
  { value: 'Ninguna', label: 'Ninguna' },
  { value: 'LDL <100 mg/dL', label: 'LDL <100 mg/dL (Óptimo)' },
  { value: 'LDL 100-129 mg/dL', label: 'LDL 100-129 mg/dL (Casi óptimo)' },
  { value: 'LDL 130-159 mg/dL', label: 'LDL 130-159 mg/dL (Límite alto)' },
  { value: 'LDL 160-189 mg/dL', label: 'LDL 160-189 mg/dL (Alto)' },
  { value: 'LDL ≥190 mg/dL', label: 'LDL ≥190 mg/dL (Muy alto)' },
]

const hdlOptions = [
  { value: 'Ninguna', label: 'Ninguna' },
  { value: 'HDL <40 mg/dL', label: 'HDL <40 mg/dL (Bajo)' },
  { value: 'HDL 40-59 mg/dL', label: 'HDL 40-59 mg/dL (Normal)' },
  { value: 'HDL ≥60 mg/dL', label: 'HDL ≥60 mg/dL (Óptimo)' },
]

const trigliceridosOptions = [
  { value: 'Ninguna', label: 'Ninguna' },
  { value: 'Triglicéridos <150 mg/dL', label: 'Triglicéridos <150 mg/dL (Normal)' },
  { value: 'Triglicéridos 150-199 mg/dL', label: 'Triglicéridos 150-199 mg/dL (Límite alto)' },
  { value: 'Triglicéridos 200-499 mg/dL', label: 'Triglicéridos 200-499 mg/dL (Alto)' },
  { value: 'Triglicéridos ≥500 mg/dL', label: 'Triglicéridos ≥500 mg/dL (Muy alto)' },
]

// Opciones para el perfil glicémico
const glucosaAyunasOptions = [
  { value: 'Ninguna', label: 'Ninguna' },
  { value: 'Glucosa en ayunas <100 mg/dL', label: 'Glucosa en ayunas <100 mg/dL (Normal)' },
  { value: 'Glucosa en ayunas 100-125 mg/dL', label: 'Glucosa en ayunas 100-125 mg/dL (Prediabetes)' },
  { value: 'Glucosa en ayunas ≥126 mg/dL', label: 'Glucosa en ayunas ≥126 mg/dL (Diabetes)' },
]

const glucosaPostprandialOptions = [
  { value: 'Ninguna', label: 'Ninguna' },
  { value: 'Glucosa 2h postprandial <140 mg/dL', label: 'Glucosa 2h postprandial <140 mg/dL (Normal)' },
  { value: 'Glucosa 2h postprandial 140-199 mg/dL', label: 'Glucosa 2h postprandial 140-199 mg/dL (Prediabetes)' },
  { value: 'Glucosa 2h postprandial ≥200 mg/dL', label: 'Glucosa 2h postprandial ≥200 mg/dL (Diabetes)' },
]

const hemoglobinaGlicosiladaOptions = [
  { value: 'Ninguna', label: 'Ninguna' },
  { value: 'HbA1c <5.7%', label: 'HbA1c <5.7% (Normal)' },
  { value: 'HbA1c 5.7-6.4%', label: 'HbA1c 5.7-6.4% (Prediabetes)' },
  { value: 'HbA1c ≥6.5%', label: 'HbA1c ≥6.5% (Diabetes)' },
]

// Opciones para el perfil hipertensivo
const presionArterialOptions = [
  { value: 'Ninguna', label: 'Ninguna' },
  { value: 'Presión arterial <120/80 mmHg', label: 'Presión arterial <120/80 mmHg (Normal)' },
  { value: 'Presión arterial 120-129/<80 mmHg', label: 'Presión arterial 120-129/<80 mmHg (Elevada)' },
  { value: 'Presión arterial 130-139/80-89 mmHg', label: 'Presión arterial 130-139/80-89 mmHg (Hipertensión Estado 1)' },
  { value: 'Presión arterial ≥140/≥90 mmHg', label: 'Presión arterial ≥140/≥90 mmHg (Hipertensión Estado 2)' },
  { value: 'Presión arterial >180/>120 mmHg', label: 'Presión arterial >180/>120 mmHg (Crisis hipertensiva)' },
]

const frecuenciaCardiacaOptions = [
  { value: 'Ninguna', label: 'Ninguna' },
  { value: 'Frecuencia cardíaca en reposo <60 lpm', label: 'Frecuencia cardíaca en reposo <60 lpm (Bradicardia)' },
  { value: 'Frecuencia cardíaca en reposo 60-100 lpm', label: 'Frecuencia cardíaca en reposo 60-100 lpm (Normal)' },
  { value: 'Frecuencia cardíaca en reposo >100 lpm', label: 'Frecuencia cardíaca en reposo >100 lpm (Taquicardia)' },
]

export default function HistoriaClinicaPage() {  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profileId, setProfileId] = useState('')
  const [historia, setHistoria] = useState<any>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    enfermedadesPrevias: '',
    perfilLipidico: {
      colesterolTotal: '',
      ldl: '',
      hdl: '',
      trigliceridos: ''
    },
    perfilGlicemico: {
      glucosaAyunas: '',
      glucosaPostprandial: '',
      hemoglobinaGlicosilada: ''
    },
    perfilHipertensivo: {
      presionArterial: '',
      frecuenciaCardiaca: ''
    },
    historialDeportivo: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) throw new Error('Token no encontrado')

        const headers = { Authorization: `Bearer ${token}` }

        const userRes = await axios.get('http://localhost:3001/fcardio/api/v1/auth/profile', { headers })
        const userId = userRes.data.userId

        const profileRes = await axios.get('http://localhost:3001/fcardio/api/v1/medical-profiles', { headers })
        const perfil = profileRes.data.find((p: any) => p.userId === userId)
        if (!perfil) throw new Error('Perfil médico no encontrado')

        setProfileId(perfil.id)

        const historiaRes = await axios.get('http://localhost:3001/fcardio/api/v1/historias-clinicas', { headers })
        const historiaExistente = historiaRes.data.find((h: any) => h.profileId === perfil.id)
        if (historiaExistente) {
          setHistoria(historiaExistente)
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar datos')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  // Función para manejar el cambio en los campos del perfil lipídico
  const handleLipidoChange = (field: string, selectedOption: any) => {
    setForm(prev => ({
      ...prev,
      perfilLipidico: {
        ...prev.perfilLipidico,
        [field]: selectedOption ? selectedOption.value : ''
      }
    }))
  }

  // Función para manejar el cambio en los campos del perfil glicémico
  const handleGlicemicoChange = (field: string, selectedOption: any) => {
    setForm(prev => ({
      ...prev,
      perfilGlicemico: {
        ...prev.perfilGlicemico,
        [field]: selectedOption ? selectedOption.value : ''
      }
    }))
  }

  // Función para manejar el cambio en los campos del perfil hipertensivo
  const handleHipertensivoChange = (field: string, selectedOption: any) => {
    setForm(prev => ({
      ...prev,
      perfilHipertensivo: {
        ...prev.perfilHipertensivo,
        [field]: selectedOption ? selectedOption.value : ''
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      // Formatear el perfil lipídico como un string para enviar al backend
      const perfilLipidicoString = Object.values(form.perfilLipidico)
        .filter(value => value) // Filtrar valores vacíos
        .join(', ');
      
      // Formatear el perfil glicémico como un string para enviar al backend
      const perfilGlicemicoString = Object.values(form.perfilGlicemico)
        .filter(value => value) // Filtrar valores vacíos
        .join(', ');
      
      // Formatear el perfil hipertensivo como un string para enviar al backend
      const perfilHipertensivoString = Object.values(form.perfilHipertensivo)
        .filter(value => value) // Filtrar valores vacíos
        .join(', ');        const res = await axios.post('http://localhost:3001/fcardio/api/v1/historias-clinicas', {
        profileId,
        enfermedadesPrevias: form.enfermedadesPrevias,
        perfilLipidico: perfilLipidicoString,
        perfilGlicemico: perfilGlicemicoString,
        perfilHipertensivo: perfilHipertensivoString,
        historialDeportivo: form.historialDeportivo,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      
      setSuccess('Historia clínica guardada correctamente')
      setHistoria(res.data.data)

      const headers = { Authorization: `Bearer ${token}` }

      // Revisar primero si hay evaluación morfofuncional
      const evalRes = await axios.get('http://localhost:3001/fcardio/api/v1/evaluaciones-morfofuncionales', { headers })
      const evaluacion = evalRes.data.find((e: any) => e.profileId === profileId)
      if (!evaluacion) {
        router.push('/user-routes/evaluaciones-morfo')
        return
      }
      
      // Luego revisar funciones cardíacas
      const fcRes = await axios.get('http://localhost:3001/fcardio/api/v1/funciones-cardiacas', { headers })
      const fc = fcRes.data.find((f: any) => f.profileId === profileId)
      if (!fc) {
        router.push('/user-routes/funciones-cardiacas')
        return
      }
      
      // PAR-Q debe ser el último formulario
      const parqRes = await axios.get('http://localhost:3001/fcardio/api/v1/parq', { headers })
      const parq = parqRes.data.find((p: any) => p.profileId === profileId)
      if (!parq) {
        router.push('/user-routes/parq')
        return
      }

      router.push('/user-routes/dashboard')

    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar historia clínica')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin w-10 h-10 text-orange-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 to-yellow-300 flex justify-center items-center px-4 py-12">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-orange-600 text-center">Historia Clínica</h1>

        {historia ? (
          <div className="space-y-3 text-sm text-gray-700">
            <p><strong>Enfermedades Previas:</strong> {historia.enfermedadesPrevias}</p>            <p><strong>Perfil Lipídico:</strong> {historia.perfilLipidico}</p>
            <p><strong>Perfil Glicémico:</strong> {historia.perfilGlicemico}</p>
            <p><strong>Perfil Hipertensivo:</strong> {historia.perfilHipertensivo}</p>
            <p><strong>Historial Deportivo:</strong> {historia.historialDeportivo}</p>
            <p className="text-green-600 font-semibold mt-4">✔ Ya completaste este formulario</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Select para enfermedades previas */}            <div>
              <label className="font-semibold text-sm text-gray-700 mb-1 block">Enfermedades Previas</label>
              <CreatableSelect
                isMulti
                placeholder="Selecciona o escribe enfermedades"
                options={enfermedadesOptions}
                onChange={(selectedOptions) =>
                  setForm((prev) => ({
                    ...prev,
                    enfermedadesPrevias: selectedOptions.map((opt) => opt.value).join(', '),
                  }))
                }
                className="text-sm"
              />
            </div>

            {/* Selects para el Perfil Lipídico */}
            <div className="space-y-3">
              <label className="font-semibold text-sm text-gray-700 mb-1 block">Perfil Lipídico</label>
              
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Colesterol Total</label>
                <CreatableSelect
                  placeholder="Selecciona o escribe nivel de colesterol total"
                  options={colesterolTotalOptions}
                  onChange={(selectedOption) => handleLipidoChange('colesterolTotal', selectedOption)}
                  className="text-sm"
                  isClearable
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-600 mb-1 block">LDL (Colesterol malo)</label>
                <CreatableSelect
                  placeholder="Selecciona o escribe nivel de LDL"
                  options={ldlOptions}
                  onChange={(selectedOption) => handleLipidoChange('ldl', selectedOption)}
                  className="text-sm"
                  isClearable
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-600 mb-1 block">HDL (Colesterol bueno)</label>
                <CreatableSelect
                  placeholder="Selecciona o escribe nivel de HDL"
                  options={hdlOptions}
                  onChange={(selectedOption) => handleLipidoChange('hdl', selectedOption)}
                  className="text-sm"
                  isClearable
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Triglicéridos</label>
                <CreatableSelect
                  placeholder="Selecciona o escribe nivel de triglicéridos"
                  options={trigliceridosOptions}
                  onChange={(selectedOption) => handleLipidoChange('trigliceridos', selectedOption)}
                  className="text-sm"
                  isClearable
                />
              </div>
            </div>

            {/* Selects para el Perfil Glicémico */}
            <div className="space-y-3">
              <label className="font-semibold text-sm text-gray-700 mb-1 block">Perfil Glicémico</label>
              
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Glucosa en Ayunas</label>
                <CreatableSelect
                  placeholder="Selecciona o escribe nivel de glucosa en ayunas"
                  options={glucosaAyunasOptions}
                  onChange={(selectedOption) => handleGlicemicoChange('glucosaAyunas', selectedOption)}
                  className="text-sm"
                  isClearable
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Glucosa Postprandial (2h)</label>
                <CreatableSelect
                  placeholder="Selecciona o escribe nivel de glucosa postprandial"
                  options={glucosaPostprandialOptions}
                  onChange={(selectedOption) => handleGlicemicoChange('glucosaPostprandial', selectedOption)}
                  className="text-sm"
                  isClearable
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Hemoglobina Glicosilada (HbA1c)</label>
                <CreatableSelect
                  placeholder="Selecciona o escribe nivel de HbA1c"
                  options={hemoglobinaGlicosiladaOptions}
                  onChange={(selectedOption) => handleGlicemicoChange('hemoglobinaGlicosilada', selectedOption)}
                  className="text-sm"
                  isClearable
                />
              </div>
            </div>

            {/* Selects para el Perfil Hipertensivo */}
            <div className="space-y-3">
              <label className="font-semibold text-sm text-gray-700 mb-1 block">Perfil Hipertensivo</label>
              
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Presión Arterial</label>
                <CreatableSelect
                  placeholder="Selecciona o escribe nivel de presión arterial"
                  options={presionArterialOptions}
                  onChange={(selectedOption) => handleHipertensivoChange('presionArterial', selectedOption)}
                  className="text-sm"
                  isClearable
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Frecuencia Cardíaca</label>
                <CreatableSelect
                  placeholder="Selecciona o escribe frecuencia cardíaca en reposo"
                  options={frecuenciaCardiacaOptions}
                  onChange={(selectedOption) => handleHipertensivoChange('frecuenciaCardiaca', selectedOption)}
                  className="text-sm"
                  isClearable
                />
              </div>            </div>

            <textarea name="historialDeportivo" placeholder="Historial Deportivo" rows={2} value={form.historialDeportivo} onChange={handleChange} className="w-full border px-4 py-2 rounded bg-blue-50" />

            <button type="submit" className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700">
              Guardar Historia Clínica
            </button>
          </form>
        )}

        {error && <p className="text-red-600 text-center">{error}</p>}
        {success && <p className="text-green-600 text-center">{success}</p>}
      </div>
    </div>
  )
}
