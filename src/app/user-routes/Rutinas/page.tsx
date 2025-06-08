'use client';

import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import {
  Dumbbell,
  Download,
  RefreshCcw,
  Loader2,
  Info,
  X,
  Calendar,
  Check,
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import moment from 'moment';
import 'moment/locale/es';

moment.locale('es');

type Exercise = {
  name: string;
  series: number;
  repsOrTime: string;
};

type DayPlan = {
  day: string;
  exercises: Exercise[];
  instructions: string;
};

type WeeklySchedule = {
  zone: 'baja' | 'moderada' | 'alta';
  plan: DayPlan[];
};

type RoutineData = {
  weeklySchedules: WeeklySchedule[];
};

const DIAS_SEMANA = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
];

export default function RutinasIAPage() {
  const [rutinas, setRutinas] = useState<RoutineData[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<{
    exercise: Exercise;
    dayPlan: DayPlan;
    zone: string;
  } | null>(null);

  // Wizard: frecuencia y días
  const [frequency, setFrequency] = useState<number>(3);
  const [selectedDays, setSelectedDays] = useState<string[]>([
    'Lunes',
    'Miércoles',
    'Viernes',
  ]);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configStep, setConfigStep] = useState<1 | 2>(1);

  const configModalRef = useRef<HTMLDivElement>(null);
  const detailsModalRef = useRef<HTMLDivElement>(null);

  const zonaColor = {
    baja: 'bg-green-100 border-green-300',
    moderada: 'bg-yellow-100 border-yellow-300',
    alta: 'bg-red-100 border-red-300',
  };
  const zonaTextColor = {
    baja: 'text-green-800',
    moderada: 'text-yellow-800',
    alta: 'text-red-800',
  };
  const zonaBadgeColor = {
    baja: 'bg-green-200 text-green-800',
    moderada: 'bg-yellow-200 text-yellow-800',
    alta: 'bg-red-200 text-red-800',
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        // 1) Obtener userId
        const userRes = await axios.get(
          'http://localhost:3001/fcardio/api/v1/auth/profile',
          { headers }
        );
        const userId = userRes.data.userId;

        // 2) Obtener profileId
        const profileRes = await axios.get(
          'http://localhost:3001/fcardio/api/v1/medical-profiles',
          { headers }
        );
        const perfil = profileRes.data.find((p: any) => p.userId === userId);
        if (!perfil) throw new Error('Perfil no encontrado');
        setProfileId(perfil.id);

        // 3) Obtener rutinas-asignadas
        const rutinasRes = await axios.get(
          'http://localhost:3001/fcardio/api/v1/rutinas-asignadas',
          { headers }
        );
        // filtro por origen IA y por user.id (o userId si existiera)
        const rutinasIA = rutinasRes.data.filter((r: any) =>
          r.origen === 'ia' &&
          ((r.user && r.user.id) === userId || r.userId === userId) &&
          r.rutinaIa
        );

        // 4) Mapear a un único objeto RoutineData
        const weeklySchedulesMap = new Map<string, WeeklySchedule>();
        rutinasIA.forEach((r: any) => {
          const z = r.rutinaIa.zone;
          const pl = Array.isArray(r.rutinaIa.plan) ? r.rutinaIa.plan : [];
          if (z) {
            weeklySchedulesMap.set(z, { zone: z, plan: pl });
          }
        });

        const combined =
          weeklySchedulesMap.size > 0
            ? [{ weeklySchedules: Array.from(weeklySchedulesMap.values()) }]
            : [];
        setRutinas(combined);
      } catch (err) {
        console.error('Error obteniendo rutinas:', err);
        toast.error('Error cargando rutinas IA');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);


  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowConfigModal(false);
        setSelectedExercise(null);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (showConfigModal && configModalRef.current) {
      configModalRef.current.focus();
    }
  }, [showConfigModal, configStep]);


  useEffect(() => {
    if (selectedExercise && detailsModalRef.current) {
      detailsModalRef.current.focus();
    }
  }, [selectedExercise]);

  const handleFrequencyChange = (value: number) => {
    if (value < 1) value = 1;
    if (value > 7) value = 7;
    setFrequency(value);
    if (selectedDays.length > value) {
      setSelectedDays(prev => prev.slice(0, value));
    }
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev => {
      if (prev.includes(day)) {
        return prev.filter(d => d !== day);
      } else if (prev.length < frequency) {
        return [...prev, day];
      }
      return prev;
    });
  };

 
  const openConfigModal = () => {
    setConfigStep(1);
    setShowConfigModal(true);
  };


  const generarRutinas = async () => {
    if (!profileId) return;
    if (selectedDays.length !== frequency) {
      toast.error(`Debes seleccionar exactamente ${frequency} días`);
      return;
    }
    setUpdating(true);
    setShowConfigModal(false);

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const res = await axios.post(
        'http://localhost:3001/fcardio/api/v1/ai/routine/weekly',
        {
          profileId,
          frequencyPerWeek: frequency,
          daysOfWeek: selectedDays,
        },
        { headers }
      );

      const ws = res.data.weeklySchedules || res.data;
      const grouped = Array.isArray(ws) ? ws : [ws];
      setRutinas([{ weeklySchedules: grouped }]);

      toast.success('Rutina IA generada correctamente');
    } catch (err) {
      console.error('Error procesando la rutina con IA:', err);
      toast.error('Error procesando la rutina con IA');
    } finally {
      setUpdating(false);
    }
  };

  const exportarPDF = async () => {
    const doc = new jsPDF();
    const getBase64FromUrl = async (url: string) => {
      const res = await fetch(url);
      const blob = await res.blob();
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
    };
    const logoBase64 = await getBase64FromUrl('/fcardio-logo.png');
    doc.addImage(logoBase64, 'PNG', 10, 10, 30, 30);
    doc.setFontSize(16);
    doc.text('Rutina semanal personalizada', 50, 20);

    const dias: Record<string, any[]> = {};
    rutinas[0]?.weeklySchedules.forEach(zona => {
      zona.plan.forEach(dia => {
        if (!dias[dia.day]) dias[dia.day] = [];
        dia.exercises.forEach(ej => {
          dias[dia.day].push([
            zona.zone,
            ej.name,
            ej.series,
            ej.repsOrTime,
            dia.instructions,
          ]);
        });
      });
    });

    let y = 50;
    Object.entries(dias).forEach(([dia, ejercicios]) => {
      doc.setFontSize(13);
      doc.text(dia.toUpperCase(), 14, y);
      y += 4;
      autoTable(doc, {
        head: [['Zona', 'Ejercicio', 'Series', 'Reps/Tiempo', 'Instrucciones']],
        body: ejercicios,
        startY: y,
        theme: 'grid',
        styles: { fontSize: 9 },
        margin: { left: 14, right: 14 },
      });
      y = (doc as any).lastAutoTable.finalY + 10;
    });

    doc.save('rutina_fcardio.pdf');
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <Toaster position="top-center" richColors />

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-orange-700 flex items-center gap-2">
            <Dumbbell className="w-6 h-6" />
            Rutinas semanales IA
          </h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <button
              onClick={openConfigModal}
              disabled={updating}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition"
            >
              {updating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Procesando…
                </>
              ) : (
                <>
                  <RefreshCcw className="w-4 h-4" />
                  {rutinas.length === 0 ? 'Crear rutina' : 'Actualizar rutina'}
                </>
              )}
            </button>
            <button
              onClick={exportarPDF}
              disabled={rutinas.length === 0}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition"
            >
              <Download className="w-4 h-4" />
              Exportar PDF
            </button>
          </div>
        </div>

        {/* Contenido principal */}
        {loading ? (
          <div className="animate-pulse space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 border-l-4 border-gray-300">
                  <div className="h-6 bg-gray-300 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="grid gap-4 p-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                  {Array(5).fill(0).map((_, j) => (
                    <div key={j} className="space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
                      {[...Array(2)].map((_, k) => (
                        <div key={k} className="h-20 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : rutinas.length === 0 || !rutinas[0].weeklySchedules.length ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4 text-lg">
              No tienes rutinas generadas por IA aún.
            </p>
            <button
              onClick={openConfigModal}
              disabled={updating}
              className="bg-orange-500 hover:bg-orange-600 px-6 py-3 text-white font-semibold rounded transition"
            >
              Generar mi primera rutina con IA
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {rutinas[0].weeklySchedules.map((zona, zi) => (
              <div key={zi} className="bg-white rounded-lg shadow overflow-hidden">
                <div className={`p-4 border-l-4 ${zonaColor[zona.zone].split(' ')[0]} ${zonaTextColor[zona.zone]}`}>
                  <h2 className="text-2xl font-bold capitalize">Zona {zona.zone}</h2>
                  <p className="text-base mt-1">
                    Esta zona corresponde a ejercicios de intensidad {zona.zone}.
                  </p>
                </div>
                <div className="grid gap-4 p-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                  {DIAS_SEMANA.map(dia => {
                    const dp = zona.plan.find(p => p.day === dia);
                    if (!dp) return null;
                    return (
                      <div key={dia} className="border rounded-lg overflow-hidden">
                        <div className="bg-gray-50 p-3 border-b">
                          <h3 className="text-lg font-semibold text-center">{dia}</h3>
                        </div>
                        <div className="p-3 space-y-2">
                          {dp.exercises.map((ej, ei) => (
                            <div
                              key={ei}
                              onClick={() => setSelectedExercise({ exercise: ej, dayPlan: dp, zone: zona.zone })}
                              className={`p-3 rounded-lg border shadow-md cursor-pointer transition transform hover:shadow-lg hover:scale-105 active:scale-95 duration-200 ${zonaColor[zona.zone]} min-h-40 flex flex-col justify-between`}
                            >
                              <h4 className="text-lg font-semibold">{ej.name}</h4>
                              <p className="text-base mt-1">{ej.series} × {ej.repsOrTime}</p>
                              <div className="flex justify-end mt-2">
                                <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 transition">
                                  <Info className="w-3 h-3" /> Detalles
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Paso 1 */}
        {showConfigModal && configStep === 1 && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowConfigModal(false)}
          >
            <div
              ref={configModalRef}
              tabIndex={-1}
              className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-orange-600" />
                  <h2 className="text-xl font-semibold text-gray-800">¿Cuántos días por semana?</h2>
                </div>
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Stepper */}
              <div className="flex items-center justify-center gap-8 mb-4">
                <button
                  onClick={() => handleFrequencyChange(frequency - 1)}
                  disabled={frequency <= 1}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-orange-50 hover:bg-orange-100 text-orange-600 transition disabled:opacity-50"
                >–</button>
                <div className="text-5xl font-bold text-orange-600">{frequency}</div>
                <button
                  onClick={() => handleFrequencyChange(frequency + 1)}
                  disabled={frequency >= 7}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-orange-50 hover:bg-orange-100 text-orange-600 transition disabled:opacity-50"
                >+</button>
              </div>

              {/* Quick chips */}
              <div className="flex justify-center gap-2 mb-4">
                {[1,2,3].map(n => (
                  <button
                    key={n}
                    onClick={() => handleFrequencyChange(n)}
                    className={`px-3 py-1 rounded-full border transition ${frequency===n?'bg-orange-600 text-white border-orange-600':'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'}`}
                  >{n}</button>
                ))}
                <button
                  onClick={() => handleFrequencyChange(4)}
                  className={`px-3 py-1 rounded-full border transition ${frequency>=4?'bg-orange-600 text-white border-orange-600':'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'}`}
                >4+</button>
              </div>

              <p className="text-center text-sm text-gray-500 mb-6">
                Entre 1 y 7 días. Ajusta según tu disponibilidad y recuperación.
              </p>

              {/* Footer */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                >Cancelar</button>
                <button
                  onClick={() => setConfigStep(2)}
                  className="px-5 py-2 rounded-lg bg-orange-600 text-white font-medium hover:bg-orange-700 transition"
                >Siguiente</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Paso 2 */}
        {showConfigModal && configStep === 2 && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowConfigModal(false)}
          >
            <div
              ref={configModalRef}
              tabIndex={-1}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Selecciona los días que quieres entrenar
                </h2>
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-gray-700 mb-2">
                {selectedDays.length} de {frequency} días seleccionados
              </p>

              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {DIAS_SEMANA.map(day => {
                  const isSelected = selectedDays.includes(day);
                  const isDisabled = !isSelected && selectedDays.length >= frequency;
                  return (
                    <button
                      key={day}
                      onClick={() => toggleDay(day)}
                      disabled={isDisabled}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${
                        isSelected ? 'bg-orange-600 text-white border border-orange-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}`}
                    >
                      <Calendar className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                      <span>{day}</span>
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                    </button>
                  );
                })}
              </div>

              {selectedDays.length !== frequency && (
                <p className="text-red-500 text-sm text-center mb-4">
                  Debes seleccionar exactamente {frequency} días para continuar
                </p>
              )}

              <div className="flex justify-between gap-2">
                <button
                  onClick={() => setConfigStep(1)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                >Atrás</button>
                <button
                  onClick={generarRutinas}
                  disabled={updating || selectedDays.length !== frequency}
                  className={`px-5 py-2 rounded-lg text-white transition ${
                    updating ? 'bg-orange-400 cursor-wait' : 'bg-orange-600 hover:bg-orange-700'
                  } ${selectedDays.length !== frequency ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {updating ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : rutinas.length === 0 ? 'Crear rutina' : 'Actualizar rutina'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal detalles de ejercicio */}
        {selectedExercise && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedExercise(null)}
          >
            <div
              ref={detailsModalRef}
              tabIndex={-1}
              className="bg-white rounded-lg max-w-md w-full p-6 shadow-lg"
              onClick={e => e.stopPropagation()}
            >
              <div className={`p-4 border-b ${zonaColor[selectedExercise.zone as keyof typeof zonaColor]}`}>
                <h2 className="text-xl font-semibold">{selectedExercise.exercise.name}</h2>
                <div className="flex gap-2 mt-1">
                  <span className={`text-xs px-2 py-1 rounded-full ${zonaBadgeColor[selectedExercise.zone as keyof typeof zonaBadgeColor]}`}>
                    Zona {selectedExercise.zone}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                    {selectedExercise.dayPlan.day}
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Series</p>
                    <p className="font-semibold">{selectedExercise.exercise.series}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Reps/Tiempo</p>
                    <p className="font-semibold">{selectedExercise.exercise.repsOrTime}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Instrucciones</h3>
                  <p className="text-gray-600 whitespace-pre-line">{selectedExercise.dayPlan.instructions}</p>
                </div>
                {selectedExercise.zone === 'alta' && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3">
                    <p className="text-sm text-yellow-700">
                      <strong>Precaución:</strong> Los ejercicios de alta intensidad deben realizarse con la técnica adecuada. Detente si sientes dolor o malestar.
                    </p>
                  </div>
                )}
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedExercise(null)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700"
                >Cerrar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
