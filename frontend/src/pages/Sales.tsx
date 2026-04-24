import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Search, ShoppingCart, Trash2, Plus, Minus, CreditCard, User, X } from 'lucide-react';

interface Product {
  id: number;
  sku: string;
  name: string;
  price: number;
  stock: number;
}

interface CartItem extends Product {
  quantity: number;
}

interface Customer {
  id: number;
  name: string;
  documentNumber: string;
}

export default function Sales() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  
  // ESTADO CLIENTE
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
    const handleUpdate = () => fetchProducts();
    window.addEventListener('inventory-updated', handleUpdate);
    return () => window.removeEventListener('inventory-updated', handleUpdate);
  }, []);

  const fetchProducts = async () => {
    try { const res = await axios.get('http://localhost:8080/api/products'); setProducts(res.data); } catch (e) {}
  };

  const fetchCustomers = async () => {
    try { const res = await axios.get('http://localhost:8080/api/customers'); setCustomers(res.data); } catch (e) {}
  };

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) return Swal.fire({ toast: true, icon: 'warning', title: 'Stock límite alcanzado', showConfirmButton: false, timer: 1000 });
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        if (newQty > item.stock) return item; 
        if (newQty < 1) return item; 
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (!selectedCustomer) {
        return Swal.fire('Cliente Requerido', 'Por favor seleccione un cliente para facturar.', 'warning');
    }

    setLoading(true);
    try {
      const saleRequest = {
        customerId: selectedCustomer.id, // Enviamos el ID del cliente
        items: cart.map(item => ({ productId: item.id, quantity: item.quantity }))
      };

      await axios.post('http://localhost:8080/api/sales', saleRequest);

      Swal.fire({
        icon: 'success',
        title: '¡Venta Exitosa!',
        text: `Cliente: ${selectedCustomer.name} - Total: S/ ${calculateTotal().toFixed(2)}`,
        timer: 3000,
        showConfirmButton: false
      });
      
      setCart([]);
      setSelectedCustomer(null);

    } catch (error) {
      Swal.fire('Error', 'Error al procesar venta', 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6 font-sans">
      {/* CATALOGO */}
      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
            <Search className="text-gray-400"/>
            <input type="text" placeholder="Buscar producto por nombre o SKU..." className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400" onChange={(e) => setSearchTerm(e.target.value)}/>
        </div>
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 lg:grid-cols-3 gap-4 content-start">
          {filteredProducts.map(product => (
            <button key={product.id} onClick={() => product.stock > 0 && addToCart(product)} disabled={product.stock === 0} className={`p-4 rounded-xl border text-left hover:shadow-md transition group ${product.stock === 0 ? 'opacity-50 bg-gray-50' : 'bg-white hover:border-blue-300'}`}>
              <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded border">{product.sku}</span>
                  <span className={`text-xs font-bold ${product.stock === 0 ? 'text-red-500' : 'text-blue-600'}`}>{product.stock} und.</span>
              </div>
              <div className="font-bold text-gray-800 text-sm h-10 line-clamp-2 leading-tight">{product.name}</div>
              <div className="font-bold text-lg text-gray-900 mt-2">S/ {product.price.toFixed(2)}</div>
            </button>
          ))}
        </div>
      </div>

      {/* TICKET */}
      <div className="w-96 flex flex-col bg-white rounded-xl shadow-xl border border-gray-200 h-full z-20">
        
        {/* SELECCION DE CLIENTE */}
        <div className="p-4 bg-slate-800 text-white rounded-t-xl shadow-md">
            <h2 className="font-bold text-xs uppercase tracking-wider mb-3 flex gap-2 items-center text-slate-300"><User size={14}/> Cliente / Facturación</h2>
            {selectedCustomer ? (
                <div className="bg-slate-700 p-3 rounded-lg flex justify-between items-center border border-slate-600">
                    <div>
                        <div className="font-bold text-sm text-white">{selectedCustomer.name}</div>
                        <div className="text-xs text-slate-300 font-mono">{selectedCustomer.documentNumber}</div>
                    </div>
                    <button onClick={() => setSelectedCustomer(null)} className="text-slate-400 hover:text-white transition"><X size={18}/></button>
                </div>
            ) : (
                <div className="relative">
                    <select 
                        className="w-full p-2.5 rounded-lg text-slate-800 text-sm border-0 focus:ring-2 focus:ring-blue-500" 
                        onChange={(e) => {
                            const c = customers.find(c => c.id === parseInt(e.target.value));
                            if(c) setSelectedCustomer(c);
                        }}
                        defaultValue=""
                    >
                        <option value="" disabled>Seleccionar Cliente...</option>
                        {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.documentNumber})</option>)}
                    </select>
                </div>
            )}
        </div>

        {/* LISTA DE ITEMS */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                  <ShoppingCart size={40} className="mb-2"/>
                  <p className="text-sm">Carrito vacío</p>
              </div>
          ) : (
              cart.map(item => (
                <div key={item.id} className="flex justify-between items-center p-2 border-b border-dashed border-gray-200 last:border-0">
                  <div className="flex-1 min-w-0 pr-2">
                      <div className="text-sm font-medium truncate text-gray-800">{item.name}</div>
                      <div className="text-xs text-gray-500">S/ {item.price.toFixed(2)} x {item.quantity}</div>
                  </div>
                  <div className="flex items-center gap-2">
                      <div className="font-bold text-sm text-gray-900 w-16 text-right">S/ {(item.price * item.quantity).toFixed(2)}</div>
                      <div className="flex items-center bg-gray-100 rounded">
                          <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-gray-200 rounded"><Minus size={12}/></button>
                          <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-gray-200 rounded"><Plus size={12}/></button>
                      </div>
                      <button onClick={() => {
                          const newCart = cart.filter(c => c.id !== item.id);
                          setCart(newCart);
                      }} className="text-red-300 hover:text-red-500 transition"><Trash2 size={16}/></button>
                  </div>
                </div>
              ))
          )}
        </div>

        {/* TOTALES Y ACCIÓN */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <div className="flex justify-between items-end mb-4">
            <span className="text-gray-500 font-medium text-sm">Total a Pagar</span>
            <span className="text-3xl font-bold text-slate-800 tracking-tight">S/ {calculateTotal().toFixed(2)}</span>
          </div>
          <button 
            onClick={handleCheckout} 
            disabled={cart.length === 0 || loading} 
            className="w-full py-4 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 disabled:bg-gray-300 disabled:shadow-none transition-all flex justify-center gap-2 items-center"
          >
            {loading ? 'Procesando...' : <><CreditCard size={20}/> PROCESAR VENTA</>}
          </button>
        </div>
      </div>
    </div>
  );
}