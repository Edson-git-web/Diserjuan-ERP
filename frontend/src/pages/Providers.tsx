import { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Plus, Edit, Search, Truck, Phone, Mail } from 'lucide-react';

interface Provider {
  id?: number;
  ruc: string;
  businessName: string;
  contactName: string;
  phone: string;
  email: string;
}

export default function Providers() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/providers');
      setProviders(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const openForm = async (provider?: Provider) => {
    const { value: formValues } = await Swal.fire({
      title: provider ? 'Editar Proveedor' : 'Nuevo Proveedor',
      html: `
        <div class="flex flex-col gap-3 text-left">
          <div><label class="text-xs font-bold text-gray-500">RUC</label>
          <input id="swal-ruc" class="swal2-input m-0 w-full" value="${provider?.ruc || ''}"></div>
          
          <div><label class="text-xs font-bold text-gray-500">Razón Social</label>
          <input id="swal-name" class="swal2-input m-0 w-full" value="${provider?.businessName || ''}"></div>
          
          <div><label class="text-xs font-bold text-gray-500">Nombre Contacto</label>
          <input id="swal-contact" class="swal2-input m-0 w-full" value="${provider?.contactName || ''}"></div>

          <div class="grid grid-cols-2 gap-2">
             <div><label class="text-xs font-bold text-gray-500">Teléfono</label>
             <input id="swal-phone" class="swal2-input m-0 w-full" value="${provider?.phone || ''}"></div>
             <div><label class="text-xs font-bold text-gray-500">Email</label>
             <input id="swal-email" class="swal2-input m-0 w-full" value="${provider?.email || ''}"></div>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      confirmButtonColor: '#2563EB',
      preConfirm: () => {
        return {
          ruc: (document.getElementById('swal-ruc') as HTMLInputElement).value,
          businessName: (document.getElementById('swal-name') as HTMLInputElement).value,
          contactName: (document.getElementById('swal-contact') as HTMLInputElement).value,
          phone: (document.getElementById('swal-phone') as HTMLInputElement).value,
          email: (document.getElementById('swal-email') as HTMLInputElement).value,
        };
      }
    });

    if (formValues) {
        try {
            if (provider?.id) {
                await axios.put(`http://localhost:8080/api/providers/${provider.id}`, formValues);
            } else {
                await axios.post('http://localhost:8080/api/providers', formValues);
            }
            Swal.fire('Guardado', 'Proveedor registrado correctamente', 'success');
            fetchProviders();
        } catch (error) {
            Swal.fire('Error', 'No se pudo guardar (RUC duplicado?)', 'error');
        }
    }
  };

  const filtered = providers.filter(p => 
    p.businessName.toLowerCase().includes(filter.toLowerCase()) || 
    p.ruc.includes(filter)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">Proveedores</h2>
            <p className="text-gray-500">Gestión de la cadena de suministro.</p>
        </div>
        <button onClick={() => openForm()} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg transition">
            <Plus size={18}/> Nuevo Proveedor
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Buscar por Razón Social o RUC..." 
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(provider => (
            <div key={provider.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition group">
                <div className="flex justify-between items-start mb-3">
                    <div className="bg-orange-50 text-orange-700 p-2 rounded-lg font-bold text-xs font-mono flex items-center gap-2">
                        <Truck size={14}/> {provider.ruc}
                    </div>
                    <button onClick={() => openForm(provider)} className="text-gray-400 hover:text-blue-600 transition">
                        <Edit size={16} />
                    </button>
                </div>
                <h3 className="font-bold text-gray-800 text-lg mb-1">{provider.businessName}</h3>
                <div className="text-xs text-gray-500 mb-4">Contacto: {provider.contactName}</div>
                
                <div className="space-y-2 text-sm text-gray-600 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                        <Phone size={14} className="text-gray-400"/> {provider.phone || '--'}
                    </div>
                    <div className="flex items-center gap-2 truncate">
                        <Mail size={14} className="text-gray-400"/> {provider.email || '--'}
                    </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}