'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

export default function EvaluacionMorfoFormPage() {
  const router = useRouter();
  const [profileId, setProfileId] = useState('');
  const [peso, setPeso] = useState('');
  const [talla, setTalla] = useState('');
  const [porcentajeGrasa, setPorcentajeGrasa] = useState('');
  const [masaMagra, setMasaMagra] = useState('');
  const [edadMetabolica, setEdadMetabolica] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const fetchProfileId = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token no encontrado');

        const headers = { Authorization: `Bearer ${token}` };
        const profileRes = await axios.get('http://localhost:3001/fcardio/api/v1/medical-profiles', { headers });
        const userRes = await axios.get('http://localhost:3001/fcardio/api/v1/auth/profile', { headers });

        const fetchedUserId = userRes.data.userId;
        const perfil = profileRes.data.find((p: any) => p.userId === fetchedUserId);

        if (perfil) {
          setProfileId(perfil.id);
        } else {
          alert('No se encontró un perfil médico. Debes crear uno primero.');
          router.push('/user-routes/registro-inicial');
        }
      } catch (error) {
        console.error('Error obteniendo perfil médico:', error);
      } finally {
        setChecking(false);
      }
    };

    fetchProfileId();
  }, [router]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!peso || !talla) {
      alert('Por favor completa peso y talla.');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      await axios.post(
        'http://localhost:3001/fcardio/api/v1/evaluaciones-morfofuncionales',
        {
          profileId,
          peso: parseFloat(peso),
          talla: parseFloat(talla),
          porcentajeGrasa: porcentajeGrasa ? parseFloat(porcentajeGrasa) : null,
          masaMagra: masaMagra ? parseFloat(masaMagra) : null,
          edadMetabolica: edadMetabolica ? parseInt(edadMetabolica) : null,
        },
        { headers }
      );

      alert('¡Evaluación morfofuncional registrada con éxito!');      // Redirigir a funciones cardíacas después de completar evaluaciones morfofuncionales
      router.push('/user-routes/funciones-cardiacas');

    } catch (error) {
      console.error('Error enviando evaluación:', error);
      alert('Error al guardar la evaluación. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (checking || !profileId) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 to-yellow-300 p-6 flex justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-6 w-full max-w-md space-y-4"
      >        <h1 className="text-2xl font-bold text-orange-600 text-center mb-4">
          Evaluación Morfofuncional Completa
        </h1>

        <div>
          <label className="block text-sm font-semibold mb-1">Peso (kg):</label>
          <input
            type="number"
            step="0.01"
            value={peso}
            onChange={(e) => setPeso(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>        <div>
          <label className="block text-sm font-semibold mb-1">Talla (m):</label>
          <input
            type="number"
            step="0.01"
            value={talla}
            onChange={(e) => setTalla(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Porcentaje de Grasa (%) - Opcional:</label>
          <input
            type="number"
            step="0.1"
            value={porcentajeGrasa}
            onChange={(e) => setPorcentajeGrasa(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Masa Magra (kg) - Opcional:</label>
          <input
            type="number"
            step="0.1"
            value={masaMagra}
            onChange={(e) => setMasaMagra(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Edad Metabólica (años) - Opcional:</label>
          <input
            type="number"
            value={edadMetabolica}
            onChange={(e) => setEdadMetabolica(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded w-full"
        >
          {loading ? 'Guardando...' : 'Guardar Evaluación'}
        </button>
      </form>
    </div>
  );
}
