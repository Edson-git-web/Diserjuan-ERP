import { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Plus, Edit, Search, MapPin, Phone } from 'lucide-react';

interface Customer {
  id?: number;
  documentNumber: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const openForm = async (customer?: Customer) => {
    const { value: formValues } = await Swal.fire({
      title: customer ? 'Editar Cliente' : 'Nuevo Cliente',
      html: `
        <div class="flex flex-col gap-3 text-left">
          <div><label class="text-xs font-bold text-gray-500">RUC / DNI</label>
          <input id="swal-doc" class="swal2-input m-0 w-full" value="${customer?.documentNumber || ''}"></div>
          
          <div><label class="text-xs font-bold text-gray-500">Razón Social / Nombre</label>
          <input id="swal-name" class="swal2-input m-0 w-full" value="${customer?.name || ''}"></div>
          
          <div class="grid grid-cols-2 gap-2">
             <div><label class="text-xs font-bold text-gray-500">Teléfono</label>
             <input id="swal-phone" class="swal2-input m-0 w-full" value="${customer?.phone || ''}"></div>
             <div><label class="text-xs font-bold text-gray-500">Email</label>
             <input id="swal-email" class="swal2-input m-0 w-full" value="${customer?.email || ''}"></div>
          </div>

          <div><label class="text-xs font-bold text-gray-500">Dirección Fiscal</label>
          <input id="swal-address" class="swal2-input m-0 w-full" value="${customer?.address || ''}"></div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      confirmButtonColor: '#2563EB',
      preConfirm: () => {
        return {
          documentNumber: (document.getElementById('swal-doc') as HTMLInputElement).value,
          name: (document.getElementById('swal-name') as HTMLInputElement).value,
          phone: (document.getElementById('swal-phone') as HTMLInputElement).value,
          email: (document.getElementById('swal-email') as HTMLInputElement).value,
          address: (document.getElementById('swal-address') as HTMLInputElement).value,
        };
      }
    });

    if (formValues) {
        try {
            if (customer?.id) {
                await axios.put(`http://localhost:8080/api/customers/${customer.id}`, formValues);
            } else {
                await axios.post('http://localhost:8080/api/customers', formValues);
            }
            Swal.fire('Guardado', 'Cliente registrado correctamente', 'success');
            fetchCustomers();
        } catch (error) {
            Swal.fire('Error', 'No se pudo guardar el cliente', 'error');
        }
    }
  };

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(filter.toLowerCase()) || 
    c.documentNumber.includes(filter)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">Cartera de Clientes</h2>
            <p className="text-gray-500">Gestión de clientes B2B y Contactos.</p>
        </div>
        <button onClick={() => openForm()} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg transition">
            <Plus size={18}/> Nuevo Cliente
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Buscar por RUC, DNI o Nombre..." 
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(customer => (
            <div key={customer.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition group">
                <div className="flex justify-between items-start mb-3">
                    <div className="bg-blue-50 text-blue-600 p-2 rounded-lg font-bold text-xs font-mono">
                        {customer.documentNumber}
                    </div>
                    <button onClick={() => openForm(customer)} className="text-gray-400 hover:text-blue-600 transition">
                        <Edit size={16} />
                    </button>
                </div>
                <h3 className="font-bold text-gray-800 text-lg mb-1">{customer.name}</h3>
                <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <Phone size={14}/> {customer.phone || 'Sin teléfono'}
                    </div>
                    <div className="flex items-center gap-2 truncate">
                        <MapPin size={14}/> {customer.address || 'Sin dirección'}
                    </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}