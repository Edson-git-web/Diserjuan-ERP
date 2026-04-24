import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Plus, Save, Package, Trash2 } from 'lucide-react'; // Eliminado 'Search'

interface Product { id: number; sku: string; name: string; stock: number; }
interface Provider { id: number; businessName: string; ruc: string; }
interface PurchaseItem { productId: number; name: string; quantity: number; unitCost: number; }

export default function PurchaseEntry() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Estado del Formulario
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [items, setItems] = useState<PurchaseItem[]>([]);
  
  // Estado del Item temporal
  const [tempProduct, setTempProduct] = useState<string>('');
  const [tempQty, setTempQty] = useState<number>(1);
  const [tempCost, setTempCost] = useState<number>(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
        const [provRes, prodRes] = await Promise.all([
            axios.get('http://localhost:8080/api/providers'),
            axios.get('http://localhost:8080/api/products')
        ]);
        setProviders(provRes.data);
        setProducts(prodRes.data);
    } catch (error) {
        console.error("Error cargando datos maestros:", error);
    }
  };

  const addItem = () => {
    if (!tempProduct || tempQty <= 0 || tempCost <= 0) {
        return Swal.fire('Datos incompletos', 'Seleccione producto, cantidad y costo > 0', 'warning');
    }
    
    const product = products.find(p => p.id === parseInt(tempProduct));
    if (!product) return;

    // Evitar duplicados visuales (opcional: sumar cantidad si ya existe)
    const existingIndex = items.findIndex(i => i.productId === product.id);
    if (existingIndex >= 0) {
        const newItems = [...items];
        newItems[existingIndex].quantity += tempQty;
        // Asumimos que el costo es el mismo o se actualiza, aquí mantenemos el nuevo
        newItems[existingIndex].unitCost = tempCost; 
        setItems(newItems);
    } else {
        setItems([...items, {
            productId: product.id,
            name: product.name,
            quantity: tempQty,
            unitCost: tempCost
        }]);
    }
    
    // Reset inputs
    setTempProduct('');
    setTempQty(1);
    setTempCost(0);
  };

  const handleSubmit = async () => {
    if (!selectedProvider || !invoiceNumber || items.length === 0) {
        return Swal.fire('Error', 'Complete proveedor, Nro Factura y agregue productos', 'error');
    }

    try {
        const payload = {
            providerId: parseInt(selectedProvider),
            invoiceNumber,
            items: items
        };

        await axios.post('http://localhost:8080/api/purchases', payload);
        
        Swal.fire('Éxito', 'Mercadería ingresada y Stock actualizado', 'success');
        
        // Limpiar formulario tras éxito
        setItems([]);
        setInvoiceNumber('');
        setSelectedProvider('');
        
    } catch (error) {
        Swal.fire('Error', 'Falló el registro de compra', 'error');
    }
  };

  const totalAmount = items.reduce((acc, item) => acc + (item.quantity * item.unitCost), 0);

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Ingreso de Mercadería</h2>
                <p className="text-gray-500">Registro de Facturas de Compra y Aumento de Stock.</p>
            </div>
            <button 
                onClick={handleSubmit} 
                disabled={items.length === 0}
                className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg transition-all ${items.length === 0 ? 'bg-gray-300 cursor-not-allowed text-gray-500' : 'bg-green-600 text-white hover:bg-green-700'}`}
            >
                <Save size={20}/> PROCESAR INGRESO
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* FORMULARIO CABECERA */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Datos del Proveedor</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Proveedor</label>
                            <select 
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                                value={selectedProvider} 
                                onChange={e => setSelectedProvider(e.target.value)}
                            >
                                <option value="">Seleccione...</option>
                                {providers.map(p => <option key={p.id} value={p.id}>{p.businessName} ({p.ruc})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Nro. Factura / Guía</label>
                            <input 
                                type="text" 
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                                placeholder="F001-0000123" 
                                value={invoiceNumber} 
                                onChange={e => setInvoiceNumber(e.target.value)} 
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Agregar Item</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Producto</label>
                            <select 
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                                value={tempProduct} 
                                onChange={e => setTempProduct(e.target.value)}
                            >
                                <option value="">Buscar producto...</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Costo Unit. (S/)</label>
                                <input 
                                    type="number" 
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                                    value={tempCost} 
                                    onChange={e => setTempCost(parseFloat(e.target.value))} 
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Cantidad</label>
                                <input 
                                    type="number" 
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                                    value={tempQty} 
                                    onChange={e => setTempQty(parseInt(e.target.value))} 
                                    min="1"
                                />
                            </div>
                        </div>
                        <button 
                            onClick={addItem} 
                            className="w-full py-2 bg-blue-50 text-blue-600 font-bold rounded-lg border border-blue-100 hover:bg-blue-100 transition flex justify-center items-center gap-2"
                        >
                            <Plus size={16}/> Agregar a la Lista
                        </button>
                    </div>
                </div>
            </div>

            {/* DETALLE DE ITEMS */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full">
                <div className="p-4 border-b bg-gray-50 flex justify-between items-center rounded-t-xl">
                    <h3 className="font-bold text-gray-700 flex items-center gap-2"><Package size={18}/> Detalle de Ingreso</h3>
                    <div className="text-xl font-bold text-green-700 bg-green-50 px-3 py-1 rounded border border-green-200">
                        Total: S/ {totalAmount.toFixed(2)}
                    </div>
                </div>
                
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase sticky top-0">
                            <tr>
                                <th className="p-4 bg-gray-50">Producto</th>
                                <th className="p-4 text-center bg-gray-50">Cant.</th>
                                <th className="p-4 text-right bg-gray-50">Costo Unit.</th>
                                <th className="p-4 text-right bg-gray-50">Subtotal</th>
                                <th className="p-4 w-10 bg-gray-50"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {items.length === 0 ? (
                                <tr><td colSpan={5} className="p-10 text-center text-gray-400 italic">No hay items agregados a la factura.</td></tr>
                            ) : items.map((item, idx) => (
                                <tr key={idx} className="hover:bg-blue-50 transition-colors">
                                    <td className="p-4 font-medium text-gray-800">{item.name}</td>
                                    <td className="p-4 text-center">
                                        <span className="bg-gray-100 px-2 py-1 rounded font-bold text-xs">{item.quantity}</span>
                                    </td>
                                    <td className="p-4 text-right text-gray-600">S/ {item.unitCost.toFixed(2)}</td>
                                    <td className="p-4 text-right font-bold text-gray-900">S/ {(item.quantity * item.unitCost).toFixed(2)}</td>
                                    <td className="p-4 text-center">
                                        <button 
                                            onClick={() => setItems(items.filter((_, i) => i !== idx))} 
                                            className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded transition"
                                            title="Eliminar item"
                                        >
                                            <Trash2 size={16}/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
  );
}