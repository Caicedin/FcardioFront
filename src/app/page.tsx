'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateTokenAndRedirect = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          // No hay token, redirige al login
          router.replace('/public-routes/login');
          return;
        }
        
        // Verifica si el token es válido haciendo una petición al endpoint de perfil
        const response = await fetch('http://localhost:3001/fcardio/api/v1/auth/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          // Token válido, obtiene la información del usuario
          const userData = await response.json();
          // Redirige según el rol del usuario
          if (userData.role === 'admin') {
            router.replace('/admin-routes/dashboard');
          } else {
            router.replace('/user-routes/dashboard');
          }
        } else {
          // Token inválido o expirado, lo elimina y redirige al login
          localStorage.removeItem('token');
          router.replace('/public-routes/login');
        }
      } catch (error) {
        // Error de conexión o cualquier otro error, lo más seguro es redirigir al login
        console.error('Error al validar el token:', error);
        localStorage.removeItem('token');
        router.replace('/public-routes/login');
      } finally {
        setIsLoading(false);
      }
    };

    validateTokenAndRedirect();
  }, [router]);

  // Muestra un indicador de carga mientras se verifica el token
  return isLoading ? (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600"></div>
    </div>
  ) : null;
}
