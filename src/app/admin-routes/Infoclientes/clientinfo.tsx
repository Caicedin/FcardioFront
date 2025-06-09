'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

type Role = {
  id: string;
  name: string;
};

type User = {
  id: string;
  name: string;
  lastname: string;
  email: string;
  sexo: string;
  fechaNacimiento: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
};

type UserProfile = User & {
  altura?: string;
  peso?: string;
  direccion?: string;
  telefono?: string;
  evaluacionesMorfo?: any[];
  funcionesCardiacas?: any;
  historiaClinica?: Record<string, any>;
  parqData?: Record<string, any>;
  zonaEntrenamiento?: Record<string, any>;
};

export default function ClientInfo() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('id');
  const { user: authUser, loading: authLoading } = useAuth('admin');

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !userId) return;
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No hay token de autenticación. Por favor inicia sesión nuevamente.');
          setLoading(false);
          router.push('/public-routes/login');
          return;
        }
        // 1. Obtener información básica del usuario
        const userResponse = await fetch(`http://localhost:3001/fcardio/api/v1/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!userResponse.ok) throw new Error(`Error al obtener datos del usuario: ${userResponse.status}`);
        const userData = await userResponse.json();
        const profile: UserProfile = { ...userData };
        // No se renderizan datos de formularios adicionales para evitar errores de build/prerender
        setUserProfile(profile);
      } catch (err) {
        setError(`Error al cargar los datos: ${err instanceof Error ? err.message : 'Error desconocido'}`);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [authLoading, userId, router]);

  const goBack = () => router.back();

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <button onClick={goBack} className="mb-6 flex items-center text-blue-600 hover:underline">
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
          <button onClick={() => window.location.reload()} className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm">Reintentar</button>
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
        </div>
      )}
    </div>
  );
}
