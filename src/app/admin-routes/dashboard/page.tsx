'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import UserCreationForm from '@/components/UserCreationForm'
import Notification from '@/components/Notification'

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

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth('admin');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info',
    message: string
  } | null>(null);

  // Función para mostrar una notificación
  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
  };

  // Función para cerrar la notificación
  const dismissNotification = () => {
    setNotification(null);
  };

  // Función para cargar usuarios
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('No hay token de autenticación')
        setError('No hay token de autenticación. Por favor inicia sesión nuevamente.')
        setLoading(false)
        router.push('/public-routes/login')
        return
      }

      console.log('Intentando obtener usuarios con token:', token.substring(0, 10) + '...')
      
      const response = await fetch('http://localhost:3001/fcardio/api/v1/users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        cache: 'no-store'
      })

      console.log('Respuesta HTTP:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error HTTP:', response.status, errorText)
        throw new Error(`Error HTTP: ${response.status} - ${errorText || response.statusText}`)
      }

      const responseText = await response.text();
      console.log('Texto de respuesta:', responseText) 
      
      let data;
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        console.error('Error al parsear JSON:', e)
        throw new Error('La respuesta no es un JSON válido')
      }
      
      console.log('Datos recibidos:', data) // Para depuración
      
      // Mostramos todos los usuarios sin filtrar
      if (Array.isArray(data)) {
        // Validamos que los usuarios tengan los campos requeridos
        const validUsers = data.filter((u: User) => {
          if (!u || !u.role) {
            console.warn('Usuario con datos incompletos:', u)
            return false
          }
          return true
        })
        console.log('Usuarios válidos:', validUsers) // Para depuración
        setUsers(validUsers)
      } else {
        console.error('La respuesta no es un array:', data)
        setError('Formato de respuesta incorrecto')
        setUsers([])
      }
    } catch (err) {
      console.error('Error al cargar usuarios:', err)
      setError(`Error al cargar los datos de los usuarios: ${err instanceof Error ? err.message : 'Error desconocido'}`)
      setUsers([])
    } finally {
      setLoading(false)
    }
  };
  // Función para crear un nuevo usuario
  const handleCreateUser = async (userData: {
    name: string
    lastname: string
    email: string
    password: string
    sexo: string
    fechaNacimiento: string
    role: string
  }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No hay token de autenticación');
        return;
      }
      
      // Enviar la solicitud al servidor
      const response = await fetch('http://localhost:3001/fcardio/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear el usuario');
      }
      
      const data = await response.json();
      showNotification('success', `Usuario creado correctamente: ${data.email}`);
      
      // Actualizar la lista de usuarios
      fetchUsers();
    } catch (err) {
      console.error('Error al crear el usuario:', err);
      showNotification('error', `Error al crear el usuario: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    }
  };

  // Función para eliminar un usuario
  const handleDeleteUser = async (userId: string) => {
    // Confirmación antes de eliminar
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No hay token de autenticación');
        return;
      }
      
      // Enviar la solicitud al servidor
      const response = await fetch(`http://localhost:3001/fcardio/api/v1/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar el usuario');
      }
      
      // Mostrar notificación de éxito
      showNotification('success', 'Usuario eliminado correctamente');
      
      // Actualizar la lista de usuarios
      fetchUsers();
    } catch (err) {
      console.error('Error al eliminar el usuario:', err);
      showNotification('error', `Error al eliminar el usuario: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    }
  };

  useEffect(() => {
    // No hacer nada si todavía estamos cargando la autenticación
    if (authLoading) {
      return;
    }
    
    fetchUsers();
  }, [authLoading]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Todos los Usuarios</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Crear Usuario
        </button>
      </div>
      
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
          <p className="text-gray-600">Cargando datos de usuarios...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-gray-100 border border-gray-300 text-gray-700 px-4 py-8 rounded mb-4 text-center">
          <p className="text-lg">No hay usuarios registrados.</p>
          <p className="text-sm text-gray-500 mt-2">Los usuarios aparecerán aquí una vez que se registren en el sistema.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">          <div className="mb-4 text-green-700 bg-green-100 p-3 rounded">
            <p>Se encontraron {users.length} usuarios registrados</p>
          </div>
          <table className="w-full table-auto border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Nombre</th>
                <th className="p-2 border">Correo</th>
                <th className="p-2 border">Sexo</th>
                <th className="p-2 border">Rol</th>
                <th className="p-2 border">Nacimiento</th>
                <th className="p-2 border">Estado</th>
                <th className="p-2 border">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="p-2 border">{user.name} {user.lastname}</td>
                  <td className="p-2 border">{user.email}</td>
                  <td className="p-2 border">{user.sexo}</td>
                  <td className="p-2 border">{user.role.name}</td>
                  <td className="p-2 border">{user.fechaNacimiento}</td>
                  <td className="p-2 border">
                    <span className={`px-2 py-1 rounded-full text-sm ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="p-2 border">
                    <div className="flex space-x-3 justify-center">
                      <button
                        onClick={() => router.push(`/admin-routes/Infoclientes?id=${user.id}`)}
                        className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 flex items-center"
                        title="Ver detalles del usuario"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Ver
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 flex items-center"
                        title="Eliminar usuario"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Eliminar
                      </button>                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Modal para crear usuario */}
      <UserCreationForm 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateUser}
      />

      {/* Notificación */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          duration={5000}
          onDismiss={dismissNotification}
        />
      )}
    </div>
  );
}
