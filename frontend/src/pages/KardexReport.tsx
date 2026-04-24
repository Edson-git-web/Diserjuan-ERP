import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, ArrowUpCircle, ArrowDownCircle, History } from 'lucide-react';
import { format } from 'date-fns';

interface Product { id: number; sku: string; name: string; }
interface Movement {
  id: number;
  dateTime: string;
  type: string;
  quantity: number;
  unitPrice: number;
  balanceBefore: number;
  balanceAfter: number;
  reference: string;
}

export default function KardexReport() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:8080/api/products')
      .then(res => setProducts(res.data));
  }, []);

  const fetchKardex = async (productId: string) => {
    if (!productId) return;
    setLoading(true);
    try {
        const res = await axios.get(`http://localhost:8080/api/kardex/product/${productId}`);
        setMovements(res.data);
    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  const getMovementLabel = (type: string) => {
    switch(type) {
        case 'IN_PURCHASE': return { label: 'Compra', color: 'text-green-600', bg: 'bg-green-100', icon: ArrowUpCircle };
        case 'IN_ADJUSTMENT': return { label: 'Ajuste (+)', color: 'text-blue-600', bg: 'bg-blue-100', icon: ArrowUpCircle };
        case 'OUT_SALE': return { label: 'Venta', color: 'text-red-600', bg: 'bg-red-100', icon: ArrowDownCircle };
        case 'OUT_ADJUSTMENT': return { label: 'Merma', color: 'text-orange-600', bg: 'bg-orange-100', icon: ArrowDownCircle };
        default: return { label: type, color: 'text-gray-600', bg: 'bg-gray-100', icon: History };
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">Kardex Valorizado</h2>
            <p className="text-gray-500">Auditoría detallada de movimientos por producto.</p>
        </div>

        {/* FILTROS */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-end gap-4">
            <div className="flex-1">
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Seleccionar Producto</label>
                <div className="relative">
                    <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                    <select 
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                        value={selectedProduct}
                        onChange={(e) => {
                            setSelectedProduct(e.target.value);
                            fetchKardex(e.target.value);
                        }}
                    >
                        <option value="">-- Buscar SKU o Nombre --</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>)}
                    </select>
                </div>
            </div>
        </div>

        {/* TABLA DE MOVIMIENTOS */}
        {selectedProduct && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Fecha</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Tipo Movimiento</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Referencia</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Cant.</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Valor Unit.</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center bg-blue-50">Saldo Final</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={6} className="p-10 text-center">Cargando auditoría...</td></tr>
                        ) : movements.length === 0 ? (
                            <tr><td colSpan={6} className="p-10 text-center text-gray-400">Sin movimientos registrados desde la implementación del Kardex.</td></tr>
                        ) : movements.map((mov) => {
                            const style = getMovementLabel(mov.type);
                            return (
                                <tr key={mov.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                                        {format(new Date(mov.dateTime), 'dd/MM/yyyy HH:mm')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${style.bg} ${style.color}`}>
                                            <style.icon size={12} /> {style.label}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{mov.reference}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-right">{mov.quantity}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 text-right">S/ {mov.unitPrice.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-center bg-blue-50/50 text-slate-800 border-l border-blue-100">
                                        {mov.balanceAfter}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        )}
    </div>
  );
}