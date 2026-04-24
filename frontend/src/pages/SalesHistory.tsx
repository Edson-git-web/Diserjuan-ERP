import { useEffect, useState } from 'react';
import axios from 'axios';
import { Download, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';

// DTOs que coinciden con el Backend
interface SaleSummary {
  id: number;
  dateTime: string;
  total: number;
  itemsCount: number;
}

interface SaleDetail {
  id: number;
  dateTime: string;
  total: number;
  items: Array<{
    product: { name: string; sku: string };
    quantity: number;
    price: number;
    subtotal: number;
  }>;
}

export default function SalesHistory() {
  const [sales, setSales] = useState<SaleSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/sales');
      setSales(response.data);
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo cargar el historial', 'error');
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async (saleId: number) => {
    try {
      // 1. Obtener datos completos de la venta (detalle de items)
      const response = await axios.get<SaleDetail>(`http://localhost:8080/api/sales/${saleId}`);
      const sale = response.data;
      const doc = new jsPDF();
      
      // 2. Encabezado del Comprobante
      doc.setFontSize(20);
      doc.text("Diserjuan S.A.C.", 14, 22);
      
      doc.setFontSize(10);
      doc.text("RUC: 20123456789", 14, 28);
      doc.text("Dirección: Lima Norte - Distribución", 14, 33);
      doc.text(`Fecha: ${format(new Date(sale.dateTime), 'dd/MM/yyyy HH:mm')}`, 14, 43);
      doc.text(`Ticket Nro: #${String(sale.id).padStart(6, '0')}`, 14, 48);

      // 3. Tabla de Productos
      autoTable(doc, {
        startY: 55,
        head: [['Producto', 'SKU', 'Cant.', 'Precio', 'Subtotal']],
        body: sale.items.map(item => [
          item.product.name,
          item.product.sku,
          item.quantity,
          `S/ ${item.price.toFixed(2)}`,
          `S/ ${item.subtotal.toFixed(2)}`
        ]),
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] }, // Azul corporativo
        styles: { fontSize: 9 }
      });

      // 4. Totales
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`TOTAL A PAGAR: S/ ${sale.total.toFixed(2)}`, 140, finalY);

      // 5. Pie de página
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(150);
      doc.text("Gracias por su preferencia - Documento No Válido para SUNAT (Demo)", 105, 290, { align: "center" });

      // 6. Descargar archivo
      doc.save(`Ticket_Venta_${sale.id}.pdf`);
      Swal.fire({ toast: true, icon: 'success', title: 'PDF Generado', position: 'top-end', showConfirmButton: false, timer: 2000 });

    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo generar el comprobante', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Historial de Ventas</h2>
        <p className="text-gray-500">Registro histórico y emisión de comprobantes.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">ID Ticket</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Fecha</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Items</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Total</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">Cargando historial...</td></tr>
            ) : sales.map((sale) => (
              <tr key={sale.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-mono text-sm text-gray-600">#{String(sale.id).padStart(6, '0')}</td>
                <td className="px-6 py-4 text-sm text-gray-700 flex items-center gap-2">
                  <Calendar size={14} className="text-gray-400" /> 
                  {format(new Date(sale.dateTime), 'dd/MM/yyyy HH:mm')}
                </td>
                <td className="px-6 py-4 text-sm">{sale.itemsCount} productos</td>
                <td className="px-6 py-4 text-sm font-bold text-right text-gray-900">S/ {sale.total.toFixed(2)}</td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => generatePDF(sale.id)} 
                    className="inline-flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-100 transition"
                  >
                    <Download size={14} /> PDF
                  </button>
                </td>
              </tr>
            ))}
            {sales.length === 0 && !loading && (
              <tr><td colSpan={5} className="p-10 text-center text-gray-400">No hay ventas registradas aún.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}