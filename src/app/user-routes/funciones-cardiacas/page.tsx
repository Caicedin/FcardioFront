'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import CreatableSelect from 'react-select/creatable';

// Opciones para VAM (Velocidad Aeróbica Máxima) - No usado, mantenemos el input de texto
// const vamOptions = [
//   {
//     label: 'Nivel general',
//     options: [
//       { value: 'VAM <10 km/h', label: 'Bajo (<10 km/h)' },
//       { value: 'VAM 10-12 km/h', label: 'Moderado bajo (10-12 km/h)' },
//       { value: 'VAM 12-14 km/h', label: 'Moderado (12-14 km/h)' },
//       { value: 'VAM 14-16 km/h', label: 'Moderado alto (14-16 km/h)' },
//       { value: 'VAM 16-18 km/h', label: 'Alto (16-18 km/h)' },
//       { value: 'VAM >18 km/h', label: 'Muy alto (>18 km/h)' },
//     ]
//   },
//   {
//     label: 'Nivel deportivo',
//     options: [
//       { value: 'VAM <14 km/h', label: 'Principiante (<14 km/h)' },
//       { value: 'VAM 14-16 km/h', label: 'Recreativo (14-16 km/h)' },
//       { value: 'VAM 16-18 km/h', label: 'Competitivo (16-18 km/h)' },
//       { value: 'VAM 18-20 km/h', label: 'Élite amateur (18-20 km/h)' },
//       { value: 'VAM >20 km/h', label: 'Élite profesional (>20 km/h)' },
//     ]
//   }
// ];

// Opciones para VO2 Max - Categorizado por género y edad
const vo2MaxOptions = [
  {
    label: 'Mujeres menores de 40 años',
    options: [
      { value: 'VO2 max <28 ml/kg/min', label: 'Muy bajo (<28 ml/kg/min)' },
      { value: 'VO2 max 28-34 ml/kg/min', label: 'Bajo (28-34 ml/kg/min)' },
      { value: 'VO2 max 35-43 ml/kg/min', label: 'Moderado (35-43 ml/kg/min)' },
      { value: 'VO2 max 44-48 ml/kg/min', label: 'Bueno (44-48 ml/kg/min)' },
      { value: 'VO2 max >48 ml/kg/min', label: 'Excelente (>48 ml/kg/min)' },
    ]
  },
  {
    label: 'Mujeres 40-60 años',
    options: [
      { value: 'VO2 max <24 ml/kg/min', label: 'Muy bajo (<24 ml/kg/min)' },
      { value: 'VO2 max 24-30 ml/kg/min', label: 'Bajo (24-30 ml/kg/min)' },
      { value: 'VO2 max 31-37 ml/kg/min', label: 'Moderado (31-37 ml/kg/min)' },
      { value: 'VO2 max 38-42 ml/kg/min', label: 'Bueno (38-42 ml/kg/min)' },
      { value: 'VO2 max >42 ml/kg/min', label: 'Excelente (>42 ml/kg/min)' },
    ]
  },
  {
    label: 'Hombres menores de 40 años',
    options: [
      { value: 'VO2 max <38 ml/kg/min', label: 'Muy bajo (<38 ml/kg/min)' },
      { value: 'VO2 max 38-43 ml/kg/min', label: 'Bajo (38-43 ml/kg/min)' },
      { value: 'VO2 max 44-51 ml/kg/min', label: 'Moderado (44-51 ml/kg/min)' },
      { value: 'VO2 max 52-56 ml/kg/min', label: 'Bueno (52-56 ml/kg/min)' },
      { value: 'VO2 max >56 ml/kg/min', label: 'Excelente (>56 ml/kg/min)' },
    ]
  },
  {
    label: 'Hombres 40-60 años',
    options: [
      { value: 'VO2 max <30 ml/kg/min', label: 'Muy bajo (<30 ml/kg/min)' },
      { value: 'VO2 max 30-35 ml/kg/min', label: 'Bajo (30-35 ml/kg/min)' },
      { value: 'VO2 max 36-42 ml/kg/min', label: 'Moderado (36-42 ml/kg/min)' },
      { value: 'VO2 max 43-48 ml/kg/min', label: 'Bueno (43-48 ml/kg/min)' },
      { value: 'VO2 max >48 ml/kg/min', label: 'Excelente (>48 ml/kg/min)' },
    ]
  }
];

export default function FuncionCardiacaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profileId, setProfileId] = useState('');  const [funcionCardiaca, setFuncionCardiaca] = useState<any>(null);
  const [form, setForm] = useState({
    fcReposo: '',
    fcMaxTeorica: '',
    fcPostTest: '',
    irc: '',
    vo2max: '',
    vo2pico: '',
    vam: '',
    vamAjustada: '',
  });

  // Estado para almacenar la opción seleccionada de VO2 Max
  const [selectedVo2Max, setSelectedVo2Max] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const userRes = await axios.get('http://localhost:3001/fcardio/api/v1/auth/profile', { headers });
        const userId = userRes.data.userId;

        const profileRes = await axios.get('http://localhost:3001/fcardio/api/v1/medical-profiles', { headers });
        const perfil = profileRes.data.find((p: any) => p.userId === userId);
        if (!perfil) throw new Error('Perfil médico no encontrado');

        setProfileId(perfil.id);

        const fcRes = await axios.get('http://localhost:3001/fcardio/api/v1/funciones-cardiacas', { headers });
        const fcData = fcRes.data.find((f: any) => f.profileId === perfil.id);
        if (fcData) {
          setFuncionCardiaca(fcData);
          setForm({
            fcReposo: fcData.fcReposo || '',
            fcMaxTeorica: fcData.fcMaxTeorica || '',
            fcPostTest: fcData.fcPostTest || '',
            irc: fcData.irc || '',
            vo2max: fcData.vo2max || '',
            vo2pico: fcData.vo2pico || '',            vam: fcData.vam || '',
            vamAjustada: fcData.vamAjustada || '',
          });
          
          // Si hay un valor VO2 Max, buscar la opción correspondiente
          if (fcData.vo2max) {
            let vo2Value = parseFloat(fcData.vo2max);
            let vo2Option = null;
            
            // Función auxiliar para encontrar la categoría adecuada
            const findCategoryByValue = (value: number) => {
              // Aplanar las opciones agrupadas para facilitar la búsqueda
              const allOptions = vo2MaxOptions.flatMap(group => group.options);
              
              // Buscar primero por rangos específicos
              for (let option of allOptions) {
                if (option.value.includes('<') && value < parseInt(option.value.match(/\d+/g)?.[0] || '0')) {
                  return option;
                } else if (option.value.includes('>') && value > parseInt(option.value.match(/\d+/g)?.[0] || '0')) {
                  return option;
                } else if (option.value.includes('-')) {
                  const range = option.value.match(/\d+-\d+/)?.[0].split('-').map(Number);
                  if (range && value >= range[0] && value <= range[1]) {
                    return option;
                  }
                }
              }
              
              return null;
            };
            
            // Intentar encontrar una categoría para el valor
            vo2Option = findCategoryByValue(vo2Value);
            
            // Si no se encuentra, crear una opción personalizada
            if (!vo2Option) {
              vo2Option = {
                value: vo2Value.toString(),
                label: `VO2 Max: ${vo2Value} ml/kg/min (Personalizado)`
              };
            }
            
            setSelectedVo2Max(vo2Option);
          }
        }
      } catch (err) {
        console.error('Error cargando datos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Función para manejar el cambio en el campo VO2 Max
  const handleVo2MaxChange = (selectedOption: any) => {
    setSelectedVo2Max(selectedOption);
    
    // Extraer el valor numérico para el backend
    if (selectedOption) {
      const vo2MaxValue = selectedOption.value;
      
      // Si es un valor personalizado (número), lo usamos directamente
      if (!isNaN(vo2MaxValue)) {
        setForm(prev => ({ ...prev, vo2max: vo2MaxValue }));
      } else {
        // Extraer el valor medio del rango de la opción seleccionada
        const matches = vo2MaxValue.match(/(\d+)-(\d+)/);
        if (matches && matches.length >= 3) {
          // Si tiene formato de rango (ej: "35-43"), calculamos el valor medio
          const minValue = parseInt(matches[1]);
          const maxValue = parseInt(matches[2]);
          const avgValue = ((minValue + maxValue) / 2).toFixed(1);
          setForm(prev => ({ ...prev, vo2max: avgValue }));
        } else {
          // Para valores con formato "< X" o "> X"
          const lessThanMatch = vo2MaxValue.match(/<(\d+)/);
          const greaterThanMatch = vo2MaxValue.match(/>(\d+)/);
          
          if (lessThanMatch && lessThanMatch.length >= 2) {
            // Para "< X", usamos X-1
            const threshold = parseInt(lessThanMatch[1]);
            const value = (threshold - 1).toString();
            setForm(prev => ({ ...prev, vo2max: value }));
          } else if (greaterThanMatch && greaterThanMatch.length >= 2) {
            // Para "> X", usamos X+1
            const threshold = parseInt(greaterThanMatch[1]);
            const value = (threshold + 1).toString();
            setForm(prev => ({ ...prev, vo2max: value }));
          } else {
            // Si no podemos extraer un valor numérico, guardamos la descripción
            setForm(prev => ({ ...prev, vo2max: vo2MaxValue }));
          }
        }
      }
    } else {
      setForm(prev => ({ ...prev, vo2max: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      if (funcionCardiaca) {
        // Actualizar
        await axios.patch(
          `http://localhost:3001/fcardio/api/v1/funciones-cardiacas/${funcionCardiaca.id}`,
          {
            fcReposo: parseInt(form.fcReposo),
            fcMaxTeorica: parseInt(form.fcMaxTeorica),
            fcPostTest: form.fcPostTest ? parseInt(form.fcPostTest) : null,
            irc: form.irc ? parseInt(form.irc) : null,
            vo2max: form.vo2max ? parseFloat(form.vo2max) : null,
            vo2pico: form.vo2pico ? parseFloat(form.vo2pico) : null,
            vam: form.vam ? parseFloat(form.vam) : null,
            vamAjustada: form.vamAjustada ? parseFloat(form.vamAjustada) : null,
          },
          { headers }
        );
        alert('Datos actualizados correctamente');
      } else {
        // Crear
        await axios.post(
          'http://localhost:3001/fcardio/api/v1/funciones-cardiacas',
          {
            profileId,
            fcReposo: parseInt(form.fcReposo),
            fcMaxTeorica: parseInt(form.fcMaxTeorica),
            fcPostTest: form.fcPostTest ? parseInt(form.fcPostTest) : null,
            irc: form.irc ? parseInt(form.irc) : null,
            vo2max: form.vo2max ? parseFloat(form.vo2max) : null,
            vo2pico: form.vo2pico ? parseFloat(form.vo2pico) : null,
            vam: form.vam ? parseFloat(form.vam) : null,
            vamAjustada: form.vamAjustada ? parseFloat(form.vamAjustada) : null,
          },
          { headers }        );
        alert('Datos guardados correctamente');
      }

      // Redirigir al formulario PAR-Q como último paso
      router.push('/user-routes/parq');
    } catch (err) {
      console.error('Error guardando datos:', err);
      alert('Hubo un error al guardar los datos.');
    }
  };

  if (loading) {
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
        className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md space-y-4"
      >
        <h1 className="text-2xl font-bold text-orange-600 text-center mb-4">
          Funciones Cardíacas
        </h1>

        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            name="fcReposo"
            placeholder="FC Reposo"
            value={form.fcReposo}
            onChange={handleChange}
            className="border rounded px-3 py-2"
            required
          />
          <input
            type="number"
            name="fcMaxTeorica"
            placeholder="FC Máx Teórica"
            value={form.fcMaxTeorica}
            onChange={handleChange}
            className="border rounded px-3 py-2"
            required
          />
          <input
            type="number"
            name="fcPostTest"
            placeholder="FC Post Test"
            value={form.fcPostTest}
            onChange={handleChange}
            className="border rounded px-3 py-2"
          />
          <input
            type="number"
            name="irc"
            placeholder="IRC"
            value={form.irc}
            onChange={handleChange}
            className="border rounded px-3 py-2"
          />          <div className="col-span-2">
            <label className="text-xs text-gray-600 mb-1 block">Consumo Máximo de Oxígeno (VO2 Max)</label>
            <CreatableSelect
              placeholder="Selecciona o escribe el valor de VO2 Max"
              options={vo2MaxOptions}
              value={selectedVo2Max}
              onChange={handleVo2MaxChange}
              className="text-sm"
              isClearable
              formatGroupLabel={(data) => (
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{data.label}</span>
                  <span className="bg-orange-100 text-orange-800 text-xs px-2 rounded-full">
                    {data.options.length}
                  </span>
                </div>
              )}
              styles={{
                control: (base) => ({
                  ...base,
                  borderColor: '#e2e8f0',
                  '&:hover': { borderColor: '#cbd5e0' },
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isSelected ? '#ed8936' : state.isFocused ? '#feebc8' : base.backgroundColor,
                  color: state.isSelected ? 'white' : 'inherit',
                  '&:hover': { backgroundColor: state.isSelected ? '#dd6b20' : '#feebc8' },
                }),
              }}
              theme={(theme) => ({
                ...theme,
                colors: {
                  ...theme.colors,
                  primary: '#ed8936',
                  primary25: '#feebc8',
                },
              })}
            />
          </div>          <input
            type="number"
            name="vo2pico"
            placeholder="VO2 Pico"
            value={form.vo2pico}
            onChange={handleChange}
            className="border rounded px-3 py-2"
          />
          <input
            type="number"
            name="vam"
            placeholder="VAM"
            value={form.vam}
            onChange={handleChange}
            className="border rounded px-3 py-2"
          />
          <input
            type="number"
            name="vamAjustada"
            placeholder="VAM Ajustada"
            value={form.vamAjustada}
            onChange={handleChange}
            className="border rounded px-3 py-2"
          /></div>

        <button
          type="submit"
          className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded transition"
        >
          {funcionCardiaca ? 'Actualizar' : 'Guardar'}
        </button>
      </form>
    </div>
  );
}
