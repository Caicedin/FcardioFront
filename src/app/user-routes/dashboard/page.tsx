'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Loader2, Brain, ListChecks, RefreshCw } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [allCompleted, setAllCompleted] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [nombreUsuario, setNombreUsuario] = useState('Usuario');
  const [showIA, setShowIA] = useState(false);
  const [clasificacionIA, setClasificacionIA] = useState('');
  const [justificacionIA, setJustificacionIA] = useState<string[]>([]);
  const [observaciones, setObservaciones] = useState<string[]>([]);
  const [iaLoading, setIaLoading] = useState(false);

  useEffect(() => {
    const checkCompletion = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const userRes = await axios.get('http://localhost:3001/fcardio/api/v1/auth/profile', { headers });
        const userId = userRes.data.userId;

        const nombreRaw = userRes.data.name || '';
        const apellidoRaw = userRes.data.lastname || '';
        const nombreCompleto = `${nombreRaw} ${apellidoRaw}`
          .toLowerCase()
          .replace(/\b\w/g, l => l.toUpperCase());
        setNombreUsuario(nombreCompleto);

        const profileRes = await axios.get('http://localhost:3001/fcardio/api/v1/medical-profiles', { headers });
        const perfil = profileRes.data.find((p: any) => p.userId === userId);
        if (!perfil) return;
        setProfileId(perfil.id);

        // Verifica si ya hay análisis guardado
        if (perfil.clasificacionIa && perfil.justificacionIa && perfil.observacionesGenerales) {
          setClasificacionIA(perfil.clasificacionIa);
          setJustificacionIA(Array.isArray(perfil.justificacionIa)
            ? perfil.justificacionIa
            : JSON.parse(perfil.justificacionIa));
          setObservaciones(Array.isArray(perfil.observacionesGenerales)
            ? perfil.observacionesGenerales
            : JSON.parse(perfil.observacionesGenerales));
          setShowIA(true);
        }

        // Verificación de formularios
        const historiaRes = await axios.get('http://localhost:3001/fcardio/api/v1/historias-clinicas', { headers });
        const historia = historiaRes.data.find((h: any) => h.profileId === perfil.id);

        const parqRes = await axios.get('http://localhost:3001/fcardio/api/v1/parq', { headers });
        const parqItem = parqRes.data.find((p: any) => p.profileId === perfil.id);

        const evalRes = await axios.get('http://localhost:3001/fcardio/api/v1/evaluaciones-morfofuncionales', { headers });
        const evaluacion = evalRes.data.find((e: any) => e.profileId === perfil.id);

        const completado = perfil && historia && parqItem && evaluacion;
        setAllCompleted(completado);
      } catch (err) {
        console.error('Error verificando formularios:', err);
      } finally {
        setLoading(false);
      }
    };

    checkCompletion();
  }, []);

  const analizarConIA = async () => {
    if (!profileId) return;
    setIaLoading(true);
    try {
      const resClasificacion = await axios.post('http://localhost:3001/fcardio/api/v1/ai/classify', { profileId });
      const resObservaciones = await axios.post('http://localhost:3001/fcardio/api/v1/ai/observations', { profileId });

      setClasificacionIA(resClasificacion.data.clasificacionIa);
      setJustificacionIA(resClasificacion.data.justificacionIa);
      setObservaciones(resObservaciones.data.observacionesGenerales);
      setShowIA(true);
      toast.success('Análisis IA actualizado correctamente');
    } catch (err) {
      toast.error('Error al analizar con IA');
      console.error(err);
    } finally {
      setIaLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <Toaster position="top-center" richColors />
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-4xl space-y-8">
        {/* Header del dashboard */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-gray-800">👋 Hola, {nombreUsuario}</h2>
          <p className="text-gray-500">🩺 Estado general de tu salud</p>
        </div>

        {/* Botón de análisis IA o redirección a formularios */}
        {allCompleted ? (
          <>
            {!showIA && (
              <div className="flex justify-center">
                <button
                  onClick={analizarConIA}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded flex items-center gap-2"
                  disabled={iaLoading}
                >
                  {iaLoading ? (
                    <>
                      <Loader2 className="animate-spin w-5 h-5" />
                      Analizando...
                    </>
                  ) : (
                    <>
                      <Brain className="w-5 h-5" />
                      Analiza tu salud con IA
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Resultado IA */}
            <AnimatePresence>
              {showIA && (
                <motion.div
                  key="ia-card"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="bg-gray-50 border rounded-lg p-6 space-y-4 shadow"
                >
                  <h3 className="text-lg font-bold text-blue-700 flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    Resultado IA
                  </h3>

                  <p className="text-2xl font-bold text-green-700">
                    Clasificación: {clasificacionIA}
                  </p>

                  <ul className="list-disc ml-6 text-sm text-gray-700 space-y-1">
                    {justificacionIA.map((j, idx) => (
                      <li key={idx}>{j}</li>
                    ))}
                  </ul>

                  <h4 className="text-md font-semibold text-gray-800 mt-4 flex items-center gap-2">
                    <ListChecks className="w-4 h-4" /> Observaciones Generales:
                  </h4>

                  <ul className="list-disc ml-6 text-sm text-gray-600 space-y-1">
                    {observaciones.map((o, idx) => (
                      <li key={idx}>{o}</li>
                    ))}
                  </ul>

                  {/* Botón para actualizar análisis */}
                  <div className="flex justify-end">
                    {iaLoading ? (
  <div className="flex items-center gap-2 mt-4 text-gray-500 text-sm">
    <Loader2 className="w-4 h-4 animate-spin" />
    Actualizando análisis IA...
  </div>
) : (
  <button
    onClick={analizarConIA}
    className="mt-4 flex items-center gap-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
  >
    <RefreshCw className="w-4 h-4" />
    Actualizar análisis
  </button>
)}

                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <div className="text-center">
            <button
              onClick={() => router.push('/user-routes/registro-inicial')}
              className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded"
            >
              Completar Registro Inicial
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
