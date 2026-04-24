import { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Edit, Trash2, Plus, Search } from 'lucide-react';

interface Product {
  id?: number;
  sku: string;
  name: string;
  description: string;
  price: number;
  stock: number;
}

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo cargar el catálogo', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openProductForm = async (product?: Product) => {
    const isEdit = !!product;
    
    const { value: formValues } = await Swal.fire({
      title: isEdit ? 'Editar Producto' : 'Nuevo Producto',
      html: `
        <div class="flex flex-col gap-3 text-left">
          <div>
            <label class="text-xs font-bold text-gray-500">SKU</label>
            <input id="swal-sku" class="swal2-input m-0 w-full" placeholder="Ej: LAP-001" value="${product?.sku || ''}">
          </div>
          <div>
            <label class="text-xs font-bold text-gray-500">Nombre</label>
            <input id="swal-name" class="swal2-input m-0 w-full" value="${product?.name || ''}">
          </div>
          <div>
            <label class="text-xs font-bold text-gray-500">Descripción</label>
            <input id="swal-desc" class="swal2-input m-0 w-full" value="${product?.description || ''}">
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="text-xs font-bold text-gray-500">Precio</label>
              <input id="swal-price" type="number" step="0.01" class="swal2-input m-0 w-full" value="${product?.price || ''}">
            </div>
            <div>
              <label class="text-xs font-bold text-gray-500">Stock</label>
              <input id="swal-stock" type="number" class="swal2-input m-0 w-full" value="${product?.stock || ''}">
            </div>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      confirmButtonColor: '#2563EB',
      preConfirm: () => {
        return {
          sku: (document.getElementById('swal-sku') as HTMLInputElement).value,
          name: (document.getElementById('swal-name') as HTMLInputElement).value,
          description: (document.getElementById('swal-desc') as HTMLInputElement).value,
          price: parseFloat((document.getElementById('swal-price') as HTMLInputElement).value),
          stock: parseInt((document.getElementById('swal-stock') as HTMLInputElement).value)
        };
      }
    });

    if (formValues) {
      if (!formValues.sku || !formValues.name || formValues.price < 0 || formValues.stock < 0) {
        return Swal.fire('Error', 'Datos inválidos', 'warning');
      }

      try {
        if (isEdit && product?.id) {
          await axios.put(`http://localhost:8080/api/products/${product.id}`, formValues);
          Swal.fire('Actualizado', 'Producto modificado', 'success');
        } else {
          await axios.post('http://localhost:8080/api/products', formValues);
          Swal.fire('Creado', 'Producto agregado', 'success');
        }
        fetchProducts();
      } catch (error) {
        Swal.fire('Error', 'No se pudo guardar. SKU duplicado?', 'error');
      }
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: '¿Eliminar?',
      text: "No podrás revertir esto. Si tiene ventas, fallará.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:8080/api/products/${id}`);
        Swal.fire('Eliminado', 'Producto borrado.', 'success');
        fetchProducts();
      } catch (error) {
        Swal.fire('Error', 'No se puede eliminar (Tiene ventas asociadas).', 'error');
      }
    }
  };

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(filter.toLowerCase()) || 
    p.sku.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Maestro de Productos</h2>
        <button onClick={() => openProductForm()} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg transition">
          <Plus size={18}/> Nuevo
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Buscar..." 
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">SKU</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Producto</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Precio</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center">Stock</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center">Cargando...</td></tr>
            ) : filtered.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-mono text-xs text-gray-500">{product.sku}</td>
                <td className="px-6 py-4 font-bold text-gray-800">{product.name}</td>
                <td className="px-6 py-4 text-gray-900">S/ {product.price.toFixed(2)}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${product.stock < 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    {product.stock}
                  </span>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button onClick={() => openProductForm(product)} className="text-blue-600 hover:bg-blue-50 p-2 rounded"><Edit size={16}/></button>
                  <button onClick={() => handleDelete(product.id!)} className="text-red-600 hover:bg-red-50 p-2 rounded"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}