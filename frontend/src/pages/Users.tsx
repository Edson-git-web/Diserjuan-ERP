import { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Plus, User, UserCheck, Key } from 'lucide-react'; // Eliminado Shield

interface UserData {
  id?: number;
  username: string;
  fullName: string;
  role: string;
  password?: string; // Solo para envío
}

export default function Users() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openUserForm = async (user?: UserData) => {
    const isEdit = !!user;
    
    const { value: formValues } = await Swal.fire({
      title: isEdit ? 'Editar Usuario' : 'Nuevo Usuario',
      html: `
        <div class="flex flex-col gap-3 text-left">
          <div>
            <label class="text-xs font-bold text-gray-500">Nombre Completo</label>
            <input id="swal-fullname" class="swal2-input m-0 w-full" placeholder="Juan Perez" value="${user?.fullName || ''}">
          </div>
          <div>
            <label class="text-xs font-bold text-gray-500">Usuario (Login)</label>
            <input id="swal-username" class="swal2-input m-0 w-full" placeholder="juan" value="${user?.username || ''}" ${isEdit ? 'disabled' : ''}>
          </div>
          <div>
            <label class="text-xs font-bold text-gray-500">Rol</label>
            <select id="swal-role" class="swal2-input m-0 w-full">
                <option value="VENDEDOR" ${user?.role === 'VENDEDOR' ? 'selected' : ''}>Vendedor</option>
                <option value="ADMIN" ${user?.role === 'ADMIN' ? 'selected' : ''}>Administrador</option>
            </select>
          </div>
          <div>
            <label class="text-xs font-bold text-gray-500">Contraseña ${isEdit ? '(Dejar en blanco para no cambiar)' : ''}</label>
            <input id="swal-pass" type="password" class="swal2-input m-0 w-full" placeholder="******">
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      confirmButtonColor: '#2563EB',
      preConfirm: () => {
        return {
          fullName: (document.getElementById('swal-fullname') as HTMLInputElement).value,
          username: (document.getElementById('swal-username') as HTMLInputElement).value,
          role: (document.getElementById('swal-role') as HTMLSelectElement).value,
          password: (document.getElementById('swal-pass') as HTMLInputElement).value
        };
      }
    });

    if (formValues) {
        // Validaciones
        if (!formValues.fullName || !formValues.username || (!isEdit && !formValues.password)) {
            return Swal.fire('Error', 'Complete los campos obligatorios', 'warning');
        }

        try {
            if (isEdit && user?.id) {
                await axios.put(`http://localhost:8080/api/users/${user.id}`, formValues);
            } else {
                await axios.post('http://localhost:8080/api/users', formValues);
            }
            Swal.fire('Éxito', 'Usuario guardado correctamente', 'success');
            fetchUsers();
        } catch (error) {
            Swal.fire('Error', 'No se pudo guardar (¿Usuario duplicado?)', 'error');
        }
    }
  };

  // USO DE VARIABLE LOADING
  if (loading) return <div className="p-10 text-center text-gray-500">Cargando personal...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h2>
            <p className="text-gray-500">Administración de credenciales y roles de acceso.</p>
        </div>
        <button onClick={() => openUserForm()} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg transition">
            <Plus size={18}/> Nuevo Usuario
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(u => (
            <div key={u.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition relative overflow-hidden group">
                <div className={`absolute top-0 right-0 p-2 ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'} rounded-bl-xl font-bold text-xs`}>
                    {u.role}
                </div>
                
                <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md ${u.role === 'ADMIN' ? 'bg-purple-600' : 'bg-blue-600'}`}>
                        {u.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800">{u.fullName}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1"><User size={12}/> {u.username}</p>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                    <div className="text-xs text-green-600 font-bold flex items-center gap-1">
                        <UserCheck size={14}/> Activo
                    </div>
                    <button 
                        onClick={() => openUserForm(u)}
                        className="text-gray-400 hover:text-blue-600 flex items-center gap-1 text-sm font-medium transition"
                    >
                        <Key size={14}/> Modificar Clave
                    </button>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}