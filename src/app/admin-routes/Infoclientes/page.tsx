'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

type Role = {
  id: string
  name: string
}

type User = {
  id: string
  name: string
  lastname: string
  email: string
  sexo: string
  fechaNacimiento: string
  role: Role
  isActive: boolean
  createdAt: string
}

// Extendemos el tipo User para incluir información adicional del usuario
type UserProfile = User & {
  // Información adicional del perfil que se obtendrá de diferentes formularios
  // Por ejemplo:
  altura?: string
  peso?: string
  direccion?: string
  telefono?: string
  evaluacionesMorfo?: any[]
  funcionesCardiacas?: any
  historiaClinica?: Record<string, any>
  parqData?: Record<string, any>
  zonaEntrenamiento?: Record<string, any>
  // Añade aquí más campos según los formularios que tengas
}

export default function InfoClientesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('id');
  const { user: authUser, loading: authLoading } = useAuth('admin');
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // No hacer nada si todavía estamos cargando la autenticación o no hay userId
    if (authLoading || !userId) {
      return;
    }
    
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          console.error('No hay token de autenticación')
          setError('No hay token de autenticación. Por favor inicia sesión nuevamente.')
          setLoading(false)
          router.push('/public-routes/login')
          return
        }

        // 1. Obtener información básica del usuario
        const userResponse = await fetch(`http://localhost:3001/fcardio/api/v1/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!userResponse.ok) {
          throw new Error(`Error al obtener datos del usuario: ${userResponse.status}`);
        }

        const userData = await userResponse.json();
        console.log("Datos básicos del usuario:", userData);

        // Aquí comenzamos a construir el perfil del usuario
        const profile: UserProfile = { ...userData };

        // 2. Intentar obtener datos de los diferentes formularios
        console.log("Obteniendo datos adicionales para el usuario:", userId);
        
        // Historia Clínica
        try {
          console.log("Intentando obtener historia clínica...");
          const historiaClinicaResponse = await fetch(`http://localhost:3001/fcardio/api/v1/historia-clinica/${userId}`, {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log("Respuesta de historia clínica:", historiaClinicaResponse.status);
          
          if (historiaClinicaResponse.ok) {
            const historiaClinicaData = await historiaClinicaResponse.json();
            profile.historiaClinica = historiaClinicaData;
            console.log("Historia clínica cargada:", historiaClinicaData);
          } else {
            console.warn("No se encontró historia clínica:", historiaClinicaResponse.status);
          }
        } catch (err) {
          console.warn("Error al cargar la historia clínica:", err);
        }

        // PAR-Q
        try {
          console.log("Intentando obtener datos PAR-Q...");
          const parqResponse = await fetch(`http://localhost:3001/fcardio/api/v1/parq/${userId}`, {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log("Respuesta de PAR-Q:", parqResponse.status);
          
          if (parqResponse.ok) {
            const parqData = await parqResponse.json();
            profile.parqData = parqData;
            console.log("Datos PAR-Q cargados:", parqData);
          } else {
            console.warn("No se encontró PAR-Q:", parqResponse.status);
          }
        } catch (err) {
          console.warn("Error al cargar el PAR-Q:", err);
        }

        // Evaluaciones Morfofuncionales
        try {
          console.log("Intentando obtener evaluaciones morfofuncionales...");
          const evaluacionesResponse = await fetch(`http://localhost:3001/fcardio/api/v1/evaluaciones-morfo/${userId}`, {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log("Respuesta de evaluaciones morfofuncionales:", evaluacionesResponse.status);
          
          if (evaluacionesResponse.ok) {
            const evaluacionesData = await evaluacionesResponse.json();
            profile.evaluacionesMorfo = evaluacionesData;
            console.log("Evaluaciones morfofuncionales cargadas:", evaluacionesData);
          } else {
            console.warn("No se encontraron evaluaciones morfofuncionales:", evaluacionesResponse.status);
          }
        } catch (err) {
          console.warn("Error al cargar las evaluaciones morfofuncionales:", err);
        }
        
        // Funciones Cardiacas
        try {
          console.log("Intentando obtener funciones cardíacas...");
          const funcionesResponse = await fetch(`http://localhost:3001/fcardio/api/v1/funciones-cardiacas/${userId}`, {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log("Respuesta de funciones cardíacas:", funcionesResponse.status);
          
          if (funcionesResponse.ok) {
            const funcionesData = await funcionesResponse.json();
            profile.funcionesCardiacas = funcionesData;
            console.log("Funciones cardíacas cargadas:", funcionesData);
          } else {
            console.warn("No se encontraron funciones cardíacas:", funcionesResponse.status);
          }
        } catch (err) {
          console.warn("Error al cargar las funciones cardíacas:", err);
        }
        
        // Zonas de Entrenamiento
        try {
          console.log("Intentando obtener zonas de entrenamiento...");
          const zonasResponse = await fetch(`http://localhost:3001/fcardio/api/v1/zonas-entrenamiento/${userId}`, {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log("Respuesta de zonas de entrenamiento:", zonasResponse.status);
          
          if (zonasResponse.ok) {
            const zonasData = await zonasResponse.json();
            profile.zonaEntrenamiento = zonasData;
            console.log("Zonas de entrenamiento cargadas:", zonasData);
          } else {
            console.warn("No se encontraron zonas de entrenamiento:", zonasResponse.status);
          }
        } catch (err) {
          console.warn("Error al cargar las zonas de entrenamiento:", err);
        }

        // Finalmente, establecemos el perfil completo del usuario
        setUserProfile(profile);
      } catch (err) {
        console.error('Error al cargar datos del usuario:', err)
        setError(`Error al cargar los datos: ${err instanceof Error ? err.message : 'Error desconocido'}`)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData();
  }, [authLoading, userId, router]);

  const goBack = () => {
    router.back();
  };
  
  // Función auxiliar para formatear claves
  const formatKey = (key: string): string => {
    return key.replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/_/g, ' ');
  };

  // Función para renderizar valores de cualquier tipo
  const renderValue = (value: any): string => {
    if (value === true) return 'Sí';
    if (value === false) return 'No';
    if (value === null || value === undefined) return 'No especificado';
    return String(value);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <button 
        onClick={goBack} 
        className="mb-6 flex items-center text-blue-600 hover:underline"
      >
        <span className="mr-2">←</span> Volver al dashboard
      </button>
      
      <h1 className="text-3xl font-bold mb-6 border-b pb-4">Información del Cliente</h1>
      
      {authLoading ? (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4" role="alert">
          <p>Verificando autenticación...</p>
        </div>
      ) : !authUser ? (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4" role="alert">
          <p>No has iniciado sesión o no tienes permisos. Serás redirigido al login.</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm">
            Reintentar
          </button>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Cargando datos del cliente...</p>
        </div>
      ) : !userProfile ? (
        <div className="bg-gray-100 border border-gray-300 text-gray-700 px-4 py-8 rounded mb-4 text-center">
          <p className="text-lg">Usuario no encontrado</p>
          <p className="text-sm text-gray-500 mt-2">El usuario solicitado no existe o no se pudo cargar.</p>
        </div>
      ) : (
        <div>
          {/* Información básica del usuario */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Datos Personales</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p><span className="font-medium">Nombre:</span> {userProfile.name} {userProfile.lastname}</p>
                <p><span className="font-medium">Email:</span> {userProfile.email}</p>
                <p><span className="font-medium">Sexo:</span> {userProfile.sexo}</p>
              </div>
              <div>
                <p><span className="font-medium">Fecha de nacimiento:</span> {userProfile.fechaNacimiento}</p>
                <p><span className="font-medium">Rol:</span> {userProfile.role?.name}</p>
                <p><span className="font-medium">Estado:</span> <span className={userProfile.isActive ? 'text-green-600' : 'text-red-600'}>{userProfile.isActive ? 'Activo' : 'Inactivo'}</span></p>
              </div>
            </div>
          </div>

          {/* Historia Clínica */}
          {userProfile.historiaClinica && (
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">Historia Clínica</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(userProfile.historiaClinica).map(([key, value]) => {
                  // No mostrar el id o userId
                  if (key === 'id' || key === 'userId') return null;
                  
                  return (
                    <div key={key} className="border-b pb-1">
                      <span className="font-medium">{formatKey(key)}:</span>{' '}
                      {renderValue(value)}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Evaluaciones Morfofuncionales */}
          {userProfile.evaluacionesMorfo && userProfile.evaluacionesMorfo.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">Evaluaciones Morfofuncionales</h2>
              <div className="space-y-6">
                {userProfile.evaluacionesMorfo.map((evaluacion, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 pt-2 pb-3">
                    <h3 className="font-medium text-lg mb-2">Evaluación #{index + 1}</h3>
                    <div className="grid md:grid-cols-3 gap-3">
                      {Object.entries(evaluacion).map(([key, value]) => {
                        // No mostrar el id o userId
                        if (key === 'id' || key === 'userId') return null;
                        
                        return (
                          <div key={key} className="text-sm">
                            <span className="font-medium">{formatKey(key)}:</span>{' '}
                            {renderValue(value)}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PAR-Q */}
          {userProfile.parqData && (
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">Cuestionario PAR-Q</h2>
              <div className="space-y-3">
                {Object.entries(userProfile.parqData).map(([key, value]) => {
                  // No mostrar el id o userId
                  if (key === 'id' || key === 'userId') return null;
                  
                  return (
                    <div key={key} className="border-b pb-2">
                      <p className="font-medium">{formatKey(key)}:</p>
                      <p className={value === true ? 'text-red-600' : value === false ? 'text-green-600' : ''}>
                        {renderValue(value)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Funciones Cardíacas */}
          {userProfile.funcionesCardiacas && (
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">Funciones Cardíacas</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(userProfile.funcionesCardiacas).map(([key, value]) => {
                  // No mostrar el id o userId
                  if (key === 'id' || key === 'userId') return null;
                  
                  return (
                    <div key={key} className="border-b pb-1">
                      <span className="font-medium">{formatKey(key)}:</span>{' '}
                      {renderValue(value)}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Zonas de entrenamiento */}
          {userProfile.zonaEntrenamiento && (
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">Zonas de Entrenamiento</h2>
              <div className="space-y-2">
                {userProfile.zonaEntrenamiento.fcMax && (
                  <div className="mb-4">
                    <p><span className="font-medium">Frecuencia cardíaca máxima:</span> {userProfile.zonaEntrenamiento.fcMax} lpm</p>
                    {userProfile.zonaEntrenamiento.fcReposo && (
                      <p><span className="font-medium">Frecuencia cardíaca en reposo:</span> {userProfile.zonaEntrenamiento.fcReposo} lpm</p>
                    )}
                  </div>
                )}
                  <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="py-2 px-3 border-b text-left">Zona</th>
                        <th className="py-2 px-3 border-b text-left">% FCM</th>
                        <th className="py-2 px-3 border-b text-left">Rango FC</th>
                        <th className="py-2 px-3 border-b text-left">Descripción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {['1', '2', '3', '4', '5'].map((zonaNum) => {
                        const min = userProfile.zonaEntrenamiento?.[`zona${zonaNum}Min`];
                        const max = userProfile.zonaEntrenamiento?.[`zona${zonaNum}Max`];
                        const descripcion = userProfile.zonaEntrenamiento?.[`zona${zonaNum}Descripcion`];
                        
                        if (!min || !max) return null;
                        
                        return (
                          <tr key={zonaNum} className="hover:bg-gray-50">
                            <td className="py-2 px-3 border-b">{`Zona ${zonaNum}`}</td>
                            <td className="py-2 px-3 border-b">{`${min}% - ${max}%`}</td>
                            <td className="py-2 px-3 border-b">
                              {userProfile.zonaEntrenamiento?.fcMax ? 
                                `${Math.round((userProfile.zonaEntrenamiento.fcMax as number) * (min as number) / 100)} - ${Math.round((userProfile.zonaEntrenamiento.fcMax as number) * (max as number) / 100)} lpm` : 
                                'No calculado'}
                            </td>
                            <td className="py-2 px-3 border-b">{descripcion}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>          )}
        </div>
      )}
    </div>
  );
}
