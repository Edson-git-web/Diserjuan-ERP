import { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { ShoppingCart, CheckCircle, AlertTriangle } from 'lucide-react';

interface Product {
  id: number;
  sku: string;
  name: string;
  description: string;
  price: number;
  stock: number;
}

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error("Error cargando productos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // Escuchar el evento global del WebSocket definido en MainLayout
    window.addEventListener('inventory-updated', fetchProducts);
    return () => window.removeEventListener('inventory-updated', fetchProducts);
  }, []);

  const handleSale = async (product: Product) => {
    const { value: quantity } = await Swal.fire({
      title: `Vender ${product.name}`,
      input: 'number',
      inputLabel: `Stock disponible: ${product.stock}`,
      inputPlaceholder: 'Cantidad',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      confirmButtonColor: '#2563EB',
      inputValidator: (val) => {
        if (!val || parseInt(val) <= 0) return 'Cantidad inválida';
        if (parseInt(val) > product.stock) return 'Stock insuficiente';
      }
    });

    if (quantity) {
      try {
        await axios.post('http://localhost:8080/api/sales', {
          items: [{ productId: product.id, quantity: parseInt(quantity) }]
        });
        Swal.fire({ icon: 'success', title: 'Venta Procesada', timer: 1500, showConfirmButton: false });
        // No recargamos manualmente, el WebSocket lo hará
      } catch (error) {
        Swal.fire('Error', 'No se pudo registrar la venta', 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">Inventario General</h2>
            <p className="text-gray-500">Vista en tiempo real del almacén central.</p>
        </div>
        <button onClick={fetchProducts} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
            Actualizar Manual
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">SKU / Producto</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Precio</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
               <tr><td colSpan={5} className="p-8 text-center">Cargando inventario...</td></tr>
            ) : products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900">{product.name}</div>
                  <div className="text-xs text-gray-500 font-mono">{product.sku}</div>
                </td>
                <td className="px-6 py-4 font-medium">S/ {product.price.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${product.stock < 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {product.stock}
                  </span>
                </td>
                <td className="px-6 py-4">
                    {product.stock > 0 ? 
                      <div className="flex items-center gap-1 text-green-600 text-xs font-bold uppercase"><CheckCircle size={14}/> Disp.</div> : 
                      <div className="flex items-center gap-1 text-red-600 text-xs font-bold uppercase"><AlertTriangle size={14}/> Agotado</div>
                    }
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleSale(product)}
                    disabled={product.stock === 0}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition ${
                      product.stock > 0 ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingCart size={14} /> Vender
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}