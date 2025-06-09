'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

export default function RegistroInicialPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [notificado, setNotificado] = useState(false);
  const [missing, setMissing] = useState({
    medical: true,
    historia: true,
    parq: true,
    morfo: true,
    funcionesCardiacas: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const userRes = await axios.get('http://localhost:3001/fcardio/api/v1/auth/profile', { headers });
        const userId = userRes.data.userId;

        // Verificar perfil médico
        let profileRes = await axios.get('http://localhost:3001/fcardio/api/v1/medical-profiles', { headers });
        let profile = profileRes.data.find((p: any) => p.userId === userId);

        if (!profile) {
          try {
            const createRes = await axios.post(
              'http://localhost:3001/fcardio/api/v1/medical-profiles',
              { userId, fechaEvaluacion: new Date().toISOString() },
              { headers }
            );
            profile = createRes.data.data;
            console.log('Perfil médico creado automáticamente:', profile);
          } catch (err: any) {
            if (err.response?.status === 409) {
              console.warn('Perfil médico ya existía. Intentando obtener de nuevo...');
              profileRes = await axios.get('http://localhost:3001/fcardio/api/v1/medical-profiles', { headers });
              profile = profileRes.data.find((p: any) => p.userId === userId);
              if (!profile) throw new Error('Perfil médico no encontrado tras conflicto 409');
            } else {
              throw err;
            }
          }
        }

        const profileId = profile.id;
        setMissing((prev) => ({ ...prev, medical: false }));

        const historiaRes = await axios.get('http://localhost:3001/fcardio/api/v1/historias-clinicas', { headers });
        const historia = historiaRes.data.find((h: any) => h.profileId === profileId);
        if (historia) setMissing((prev) => ({ ...prev, historia: false }));

        const parqRes = await axios.get('http://localhost:3001/fcardio/api/v1/parq', { headers });
        const parq = parqRes.data.find((p: any) => p.profileId === profileId);
        if (parq) setMissing((prev) => ({ ...prev, parq: false }));

        const evalRes = await axios.get('http://localhost:3001/fcardio/api/v1/evaluaciones-morfofuncionales', { headers });
        const evaluacion = evalRes.data.find((e: any) => e.profileId === profileId);
        if (evaluacion) setMissing((prev) => ({ ...prev, morfo: false }));

        const fcRes = await axios.get('http://localhost:3001/fcardio/api/v1/funciones-cardiacas', { headers });
        const fc = fcRes.data.find((f: any) => f.profileId === profileId);
        if (fc) setMissing((prev) => ({ ...prev, funcionesCardiacas: false }));
      } catch (err) {
        console.error('Error cargando estado de formularios:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  useEffect(() => {
    const allCompleted =
      !missing.historia &&
      !missing.morfo &&
      !missing.funcionesCardiacas &&
      !missing.parq;

    if (!loading && allCompleted && !notificado) {
      Swal.fire({
        icon: 'success',
        title: '¡Bien hecho!',
        text: 'Has completado todos los formularios iniciales.',
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: 'swal-confirm-custom',
        },
      }).then(() => {
        router.push('/user-routes/dashboard');
      });
      setNotificado(true);
    }
  }, [loading, missing, notificado, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
      </div>
    );
  }
  const allCompleted =
    !missing.historia &&
    !missing.morfo &&
    !missing.funcionesCardiacas &&
    !missing.parq;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 to-yellow-300 p-6 flex flex-col items-center">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-orange-600 text-center mb-6">Registro Inicial</h1>

        {allCompleted ? (
          <div className="text-center text-green-700 font-medium">
            ¡Has completado todos los formularios iniciales!
            <button
              onClick={() => router.push('/user-routes/dashboard')}
              className="block mt-4 text-orange-600 underline"
            >
              Volver al Dashboard
            </button>
          </div>        ) : (
          <>
            {missing.historia && (
              <button
                onClick={() => router.push('/user-routes/historia-clinica')}
                className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded w-full mb-4"
              >
                Completar Historia Clínica
              </button>
            )}

            {!missing.historia && missing.morfo && (
              <button
                onClick={() => router.push('/user-routes/evaluaciones-morfo')}
                className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded w-full mb-4"
              >
                Completar Evaluación Morfofuncional
              </button>
            )}

            {!missing.historia && !missing.morfo && missing.funcionesCardiacas && (
              <button
                onClick={() => router.push('/user-routes/funciones-cardiacas')}
                className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded w-full mb-4"
              >
                Completar Funciones Cardíacas
              </button>
            )}

            {!missing.historia && !missing.morfo && !missing.funcionesCardiacas && missing.parq && (
              <button
                onClick={() => router.push('/user-routes/parq')}
                className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded w-full mb-4"
              >
                Completar Cuestionario PAR-Q
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
