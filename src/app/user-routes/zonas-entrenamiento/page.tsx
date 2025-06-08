'use client';

import { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import axios from 'axios';

Chart.register(ArcElement, Tooltip, Legend);

export default function ZonasEntrenamientoPage() {
  const [data, setData] = useState<any>(null);
  const [zonas, setZonas] = useState<any>(null);
  const [observaciones, setObservaciones] = useState('');

  useEffect(() => {
    const fetchZonas = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token no disponible');
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Obtener el userId desde el token
        const userRes = await axios.get('http://localhost:3001/fcardio/api/v1/auth/profile', { headers });
        const userId = userRes.data.userId;

        // 2. Obtener el perfil médico real de este usuario
        const profilesRes = await axios.get('http://localhost:3001/fcardio/api/v1/medical-profiles', { headers });
        const profile = profilesRes.data.find((p: any) => p.userId === userId);
        if (!profile) throw new Error('Perfil médico no encontrado');

        const profileId = profile.id;

        // 3. Obtener zonas
        let zonasRes = await axios.get('http://localhost:3001/fcardio/api/v1/zonas-entrenamiento', { headers });
        let zonas = zonasRes.data.filter((z: any) => z.profileId === profileId);

        // 4. Si no hay zonas, crear una automáticamente
        if (!zonas.length) {
          const createRes = await axios.post(
            'http://localhost:3001/fcardio/api/v1/zonas-entrenamiento',
            {
              profileId,
              observaciones: 'Zonas generadas automáticamente',
            },
            { headers }
          );

          zonas = [createRes.data.data];
        }

        const last = zonas[zonas.length - 1];
        const baja = last.zonaBajaMax - last.zonaBajaMin;
        const moderada = last.zonaModeradaMax - last.zonaModeradaMin;
        const alta = last.zonaAltaMax - last.zonaAltaMin;

        setData({
          labels: ['Zona Baja', 'Zona Moderada', 'Zona Alta'],
          datasets: [
            {
              data: [baja, moderada, alta],
              backgroundColor: ['#34d399', '#facc15', '#f87171'],
              borderColor: '#fff',
              borderWidth: 4,
              hoverOffset: 15,
            },
          ],
        });

        setZonas(last);
        setObservaciones(last.observaciones || 'No hay observaciones registradas');
      } catch (error: any) {
        console.error('Error cargando zonas:', error.message);
      }
    };

    fetchZonas();
  }, []);

  if (!data || !zonas) {
    return <p className="text-center mt-10">Cargando gráfico...</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 to-yellow-300 p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-orange-700 mb-6">Zonas de Entrenamiento</h1>

      <div className="w-72 h-72 mb-6">
        <Doughnut
          data={data}
          options={{
            plugins: {
              tooltip: {
                callbacks: {
                  label: function (context) {
                    const label = context.label || '';
                    const value = context.raw || 0;
                    return `${label}: ${value} bpm de rango`;
                  },
                },
              },
              legend: {
                position: 'bottom',
                labels: {
                  color: '#374151',
                  font: {
                    size: 14,
                    weight: 'bold',
                  },
                },
              },
            },
          }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl text-center text-sm">
        <div className="bg-green-100 rounded shadow p-4">
          <p className="font-semibold text-green-700">Zona Baja</p>
          <p>{zonas.zonaBajaMin} - {zonas.zonaBajaMax} bpm</p>
          <p className="mt-1 text-xs text-gray-600">Ritmo fácil y relajado</p>
        </div>
        <div className="bg-yellow-100 rounded shadow p-4">
          <p className="font-semibold text-yellow-700">Zona Moderada</p>
          <p>{zonas.zonaModeradaMin} - {zonas.zonaModeradaMax} bpm</p>
          <p className="mt-1 text-xs text-gray-600">Ritmo moderado, mejora aeróbica</p>
        </div>
        <div className="bg-red-100 rounded shadow p-4">
          <p className="font-semibold text-red-700">Zona Alta</p>
          <p>{zonas.zonaAltaMin} - {zonas.zonaAltaMax} bpm</p>
          <p className="mt-1 text-xs text-gray-600">Ritmo intenso, alto esfuerzo</p>
        </div>
      </div>

      <div className="mt-8 w-full max-w-2xl bg-white rounded-lg shadow p-4 text-sm text-gray-700">
        <p>
          <span className="font-semibold">Observaciones:</span> {observaciones}
        </p>
      </div>
    </div>
  );
}
