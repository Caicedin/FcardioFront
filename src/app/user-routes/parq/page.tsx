'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

export default function ParqFormPage() {
  const router = useRouter();
  const [profileId, setProfileId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');  const [requiereValoracion, setRequiereValoracion] = useState(false);
  const [respuestas, setRespuestas] = useState<Record<string, boolean>>({});
  const [tieneSiRespuestas, setTieneSiRespuestas] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token no encontrado');

        const userRes = await axios.get('http://localhost:3001/fcardio/api/v1/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userId = userRes.data.userId;

        const profileRes = await axios.get('http://localhost:3001/fcardio/api/v1/medical-profiles', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const perfil = profileRes.data.find((p: any) => p.userId === userId);
        if (!perfil) {
          setDebugInfo({
            message: 'No se encontró perfil médico para este usuario',
            userId,
            perfilesDisponibles: profileRes.data.map((p: any) => ({ id: p.id, userId: p.userId })),
          });
          throw new Error('Perfil médico no encontrado');
        }

        setProfileId(perfil.id);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Error al obtener el perfil médico');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const preguntas = [
    '¿Alguna vez le ha dicho un médico que tiene un problema cardíaco y que solo debe realizar actividad física recomendada por un médico?',
    '¿Siente dolor en el pecho cuando realiza actividad física?',
    '¿Ha tenido dolor en el pecho en el último mes?',
    '¿Sufre de problemas óseos o articulares que se agravan con la actividad física?',
    '¿Toma medicamentos para la presión arterial o el corazón?',
    '¿Conoce alguna otra razón por la cual no debería hacer actividad física?',
  ];  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // No permitir enviar el formulario si hay respuestas "Sí"
    if (tieneSiRespuestas) {
      setRequiereValoracion(true); // Automáticamente marcar que requiere valoración
      setError('No puede continuar con el programa de entrenamiento. Sus respuestas indican que necesita supervisión médica para realizar actividad física.');
      return; // No continuar con el envío del formulario
    }

    try {
      if (!profileId) throw new Error('No se ha podido determinar el ID del perfil médico');

      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };      await axios.post(
        'http://localhost:3001/fcardio/api/v1/parq',
        { profileId, requiereValoracion, respuestas },
        { headers }
      );

      setSuccess('PAR-Q enviado correctamente');

      // Verificar qué sigue
      const evalRes = await axios.get('http://localhost:3001/fcardio/api/v1/evaluaciones-morfofuncionales', { headers });
      const evaluacion = evalRes.data.find((e: any) => e.profileId === profileId);

      router.push('/user-routes/dashboard');

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al guardar el PAR-Q';
      setError(`Error: ${errorMessage}`);
      setDebugInfo({
        errorDetail: err.response?.data || err.message,
        requestData: { profileId, requiereValoracion, respuestas },
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin w-10 h-10 text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 to-yellow-300 flex items-center justify-center p-4">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-center text-orange-600 mb-6">Cuestionario PAR-Q</h1>

        {profileId ? (
          <p className="text-sm text-gray-600 mb-4">ID de perfil médico: {profileId}</p>
        ) : (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">¡Atención!</p>
            <p>No se ha podido identificar un perfil médico asociado a tu cuenta.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {preguntas.map((pregunta, index) => (
            <div key={index}>
              <p className="text-gray-800 font-medium mb-2">{pregunta}</p>              <div className="flex gap-6">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name={`pregunta-${index}`}
                    value="true"
                    onChange={() => {
                      const newRespuestas = { ...respuestas, [`pregunta${index + 1}`]: true };
                      setRespuestas(newRespuestas);
                      // Verificar si hay al menos una respuesta "Sí"
                      const tieneAlgunSi = Object.values(newRespuestas).some(valor => valor === true);
                      setTieneSiRespuestas(tieneAlgunSi);
                    }}
                    required
                  />
                  <span className="ml-2">Sí</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name={`pregunta-${index}`}
                    value="false"
                    onChange={() => {
                      const newRespuestas = { ...respuestas, [`pregunta${index + 1}`]: false };
                      setRespuestas(newRespuestas);
                      // Verificar si hay al menos una respuesta "Sí"
                      const tieneAlgunSi = Object.values(newRespuestas).some(valor => valor === true);
                      setTieneSiRespuestas(tieneAlgunSi);
                    }}
                  />
                  <span className="ml-2">No</span>
                </label>
              </div>
            </div>
          ))}

          <label className="inline-flex items-center mt-4">
            <input
              type="checkbox"
              checked={requiereValoracion}
              onChange={(e) => setRequiereValoracion(e.target.checked)}
            />
            <span className="ml-2">Requiere valoración médica adicional</span>
          </label>          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p>{error}</p>
            </div>
          )}{success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {success}
            </div>          )}          {tieneSiRespuestas && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
              <p className="font-bold">¡Importante!</p>
              <p className="mb-3">Ha respondido "Sí" a al menos una pregunta. Se recomienda consultar con un médico antes de iniciar un programa de actividad física.</p>
              <button
                type="button"
                onClick={() => router.push('/user-routes/dashboard')}
                className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-4 rounded text-sm"
              >
                Volver al Dashboard
              </button>
            </div>
          )}          {!tieneSiRespuestas && (
            <button
              type="submit"
              className={`w-full py-2 rounded transition ${
                tieneSiRespuestas 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-orange-600 hover:bg-orange-700 text-white'
              }`}
              disabled={!profileId || tieneSiRespuestas}
            >
              Enviar PAR-Q
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
