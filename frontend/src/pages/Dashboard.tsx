import { useEffect, useState } from 'react';
import axios from 'axios';
import { TrendingUp, ShoppingCart, AlertTriangle, Users, ArrowUpRight } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  stock: number;
}

interface DashboardStats {
  todaySales: number;
  todayOrders: number;
  criticalStockCount: number;
  criticalProducts: Product[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Escuchar el evento global del WebSocket (configurado en MainLayout)
    // Esto hace que el dinero suba en vivo sin recargar F5
    window.addEventListener('inventory-updated', fetchStats);
    return () => window.removeEventListener('inventory-updated', fetchStats);
  }, []);

  if (loading) return <div className="p-10 text-center text-gray-500">Cargando métricas...</div>;

  const cards = [
    { 
      title: "Ventas Hoy", 
      value: `S/ ${stats?.todaySales.toFixed(2) || '0.00'}`, 
      color: "text-blue-600", 
      bg: "bg-blue-50", 
      icon: TrendingUp 
    },
    { 
      title: "Pedidos Hoy", 
      value: stats?.todayOrders || 0, 
      color: "text-purple-600", 
      bg: "bg-purple-50", 
      icon: ShoppingCart 
    },
    { 
      title: "Stock Crítico", 
      value: stats?.criticalStockCount || 0, 
      color: "text-red-600", 
      bg: "bg-red-50", 
      icon: AlertTriangle 
    },
    { 
      title: "Vendedores", 
      value: "2", // Dato estático por ahora (Juan y Pedro)
      color: "text-green-600", 
      bg: "bg-green-50", 
      icon: Users 
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Resumen Ejecutivo</h2>
        <p className="text-gray-500">Métricas operativas en tiempo real.</p>
      </div>

      {/* TARJETAS DE MANDO (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div key={index} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{card.title}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">{card.value}</h3>
              </div>
              <div className={`p-3 rounded-lg ${card.bg} ${card.color}`}>
                <card.icon size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-medium text-gray-400">
               <ArrowUpRight size={12} className="text-green-500"/> Actualizado ahora
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* WIDGET DE ALERTAS (Productos por agotarse) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-red-50 flex justify-between items-center">
                <h3 className="font-bold text-red-800 flex items-center gap-2">
                    <AlertTriangle size={18}/> Reposición Urgente
                </h3>
                <span className="text-xs font-bold bg-white text-red-600 px-2 py-1 rounded-full border border-red-100">
                    {stats?.criticalProducts.length} items
                </span>
            </div>
            <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
                {stats?.criticalProducts.length === 0 ? (
                    <div className="p-6 text-center text-gray-400 text-sm">Inventario Saludable ✅</div>
                ) : (
                    stats?.criticalProducts.map(p => (
                        <div key={p.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                            <div><p className="font-medium text-gray-800 text-sm">{p.name}</p></div>
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-bold">{p.stock} und.</span>
                        </div>
                    ))
                )}
            </div>
        </div>
        
        {/* WIDGET DE GRÁFICO (Placeholder) */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center justify-center text-center">
             <div className="bg-blue-50 p-4 rounded-full mb-4">
                <TrendingUp size={32} className="text-blue-500" />
             </div>
             <h3 className="text-lg font-bold text-gray-900">Proyección de Ventas</h3>
             <p className="text-gray-500 max-w-sm mt-2 text-sm">
                 El sistema requiere 7 días de historial transaccional para generar proyecciones de demanda predictiva.
             </p>
        </div>
      </div>
    </div>
  );
}