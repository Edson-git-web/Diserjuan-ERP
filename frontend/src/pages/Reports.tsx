import { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import * as XLSX from 'xlsx';
import { Download, PieChart, TrendingUp } from 'lucide-react';

interface ChartData {
  salesTrend: { date: string; total: number }[];
  topProducts: { productName: string; quantitySold: number; totalRevenue: number }[];
}

export default function Reports() {
  const [data, setData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/reports/dashboard-charts');
      setData(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (!data) return;
    
    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.json_to_sheet(data.salesTrend);
    XLSX.utils.book_append_sheet(wb, ws1, "Ventas Diarias");
    
    const ws2 = XLSX.utils.json_to_sheet(data.topProducts);
    XLSX.utils.book_append_sheet(wb, ws2, "Top Productos");

    XLSX.writeFile(wb, "Reporte_Gerencial_Diserjuan.xlsx");
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Calculando métricas BI...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Inteligencia de Negocios (BI)</h2>
                <p className="text-gray-500">Análisis visual de rendimiento y exportación de data maestra.</p>
            </div>
            <button 
                onClick={exportToExcel} 
                className="px-4 py-2 bg-green-700 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-green-800 shadow-lg transition transform active:scale-95"
            >
                <Download size={18}/> Exportar Excel Maestro
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* GRAFICO DE TENDENCIA */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-700 mb-6 flex items-center gap-2">
                    <TrendingUp className="text-blue-600"/> Tendencia de Ventas (7 Días)
                </h3>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data?.salesTrend}>
                            <defs>
                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB"/>
                            <XAxis 
                                dataKey="date" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fill: '#6B7280', fontSize: 12}} 
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fill: '#6B7280', fontSize: 12}} 
                                tickFormatter={(value) => `S/ ${value}`}
                            />
                            <Tooltip 
                                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                                // SOLUCIÓN: Usar 'any' para evitar conflicto de tipos con Recharts
                                formatter={(value: any) => [`S/ ${Number(value).toFixed(2)}`, 'Ventas']}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="total" 
                                stroke="#2563EB" 
                                strokeWidth={3} 
                                fillOpacity={1} 
                                fill="url(#colorTotal)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* GRAFICO TOP PRODUCTOS */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-700 mb-6 flex items-center gap-2">
                    <PieChart className="text-purple-600"/> Top 5 Productos (Ingresos)
                </h3>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data?.topProducts} layout="vertical" margin={{left: 0, right: 30}}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB"/>
                            <XAxis type="number" hide />
                            <YAxis 
                                dataKey="productName" 
                                type="category" 
                                width={120} 
                                tick={{fontSize: 11, fill: '#4B5563'}} 
                                interval={0}
                            />
                            <Tooltip 
                                cursor={{fill: '#F3F4F6'}}
                                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                                // SOLUCIÓN: Usar 'any' y conversión segura a Number
                                formatter={(value: any) => [`S/ ${Number(value).toFixed(2)}`, 'Ingresos']}
                            />
                            <Bar 
                                dataKey="totalRevenue" 
                                fill="#8B5CF6" 
                                radius={[0, 4, 4, 0]} 
                                barSize={24} 
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* TABLA RESUMEN */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-800 mb-4">Detalle de Rendimiento (Ranking)</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Producto</th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Unidades Vendidas</th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Ingresos Totales</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data?.topProducts.map((p, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 text-sm font-medium text-gray-800 flex items-center gap-2">
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${idx < 3 ? 'bg-yellow-500' : 'bg-gray-400'}`}>
                                        {idx + 1}
                                    </span>
                                    {p.productName}
                                </td>
                                <td className="p-4 text-sm text-gray-600 text-right">{p.quantitySold} und.</td>
                                <td className="p-4 text-sm font-bold text-green-600 text-right">S/ {p.totalRevenue.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
}