import { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
// LIMPIEZA: Eliminados 'AlertCircle' y 'Save' que no se usaban
import { Lock, Unlock, DollarSign } from 'lucide-react';

interface CashShift {
  id: number;
  startTime: string;
  initialBalance: number;
  status: string;
}

export default function CashControl() {
  const [shift, setShift] = useState<CashShift | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/cash/status');
      setShift(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = async () => {
    const { value: amount } = await Swal.fire({
      title: 'Apertura de Caja',
      text: 'Ingrese el monto inicial en efectivo (Sencillo):',
      input: 'number',
      inputAttributes: { min: '0', step: '0.10' },
      showCancelButton: true,
      confirmButtonText: 'Abrir Turno',
      confirmButtonColor: '#16A34A'
    });

    if (amount) {
      try {
        await axios.post('http://localhost:8080/api/cash/open', { amount: parseFloat(amount) });
        Swal.fire('Caja Abierta', 'Ya puede realizar ventas.', 'success');
        checkStatus();
      } catch (e) {
        Swal.fire('Error', 'No se pudo abrir la caja.', 'error');
      }
    }
  };

  const handleClose = async () => {
    if (!shift) return;
    
    const { value: physicalAmount } = await Swal.fire({
      title: 'Cierre de Caja (Arqueo)',
      text: 'Cuente el dinero físico e ingrese el total:',
      input: 'number',
      inputAttributes: { min: '0', step: '0.10' },
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Cerrar Turno',
      confirmButtonColor: '#DC2626'
    });

    if (physicalAmount) {
      try {
        const res = await axios.post('http://localhost:8080/api/cash/close', { 
            shiftId: shift.id, 
            physicalAmount: parseFloat(physicalAmount) 
        });
        
        const diff = res.data.difference;
        const msg = diff === 0 
            ? 'Cuadre Perfecto.' 
            : diff > 0 ? `Sobrante: S/ ${diff}` : `Faltante: S/ ${diff}`;
            
        Swal.fire('Turno Cerrado', `Resultado del Arqueo: ${msg}`, diff < 0 ? 'warning' : 'success');
        checkStatus();
      } catch (e) {
        Swal.fire('Error', 'No se pudo cerrar la caja.', 'error');
      }
    }
  };

  const handleExpense = async () => {
    if (!shift) return;
    const { value: formValues } = await Swal.fire({
        title: 'Registrar Gasto (Egreso)',
        html: 
          '<input id="swal-amt" class="swal2-input" placeholder="Monto" type="number">' +
          '<input id="swal-desc" class="swal2-input" placeholder="Motivo (Ej: Taxi)">',
        focusConfirm: false,
        preConfirm: () => {
          return [
            (document.getElementById('swal-amt') as HTMLInputElement).value,
            (document.getElementById('swal-desc') as HTMLInputElement).value
          ]
        }
    });

    if (formValues) {
        const [amount, desc] = formValues;
        await axios.post('http://localhost:8080/api/cash/expense', {
            shiftId: shift.id,
            amount: parseFloat(amount),
            description: desc
        });
        Swal.fire('Registrado', 'Dinero descontado de caja.', 'success');
    }
  };

  if (loading) return <div>Cargando estado de caja...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">Control de Caja</h2>
            <p className="text-gray-500">Gestión de turnos y efectivo.</p>
        </div>

        {!shift ? (
            <div className="bg-white p-10 rounded-xl border border-gray-200 shadow-sm text-center">
                <div className="inline-flex bg-red-100 p-4 rounded-full text-red-600 mb-4">
                    <Lock size={48} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Caja Cerrada</h3>
                <p className="text-gray-500 mb-6">Debe abrir caja para poder procesar ventas.</p>
                <button onClick={handleOpen} className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold shadow-lg hover:bg-green-700 transition flex items-center gap-2 mx-auto">
                    <Unlock size={20}/> REALIZAR APERTURA
                </button>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-green-200 shadow-sm bg-green-50/30">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-green-700 font-bold">
                            <Unlock size={20}/> TURNO ABIERTO
                        </div>
                        <span className="text-sm text-gray-500">Inicio: {new Date(shift.startTime).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-800 mb-1">
                        S/ {shift.initialBalance.toFixed(2)}
                    </div>
                    <p className="text-xs text-gray-500 uppercase font-bold">Saldo Inicial</p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center gap-3">
                    <button onClick={handleExpense} className="w-full py-2 border-2 border-red-100 text-red-600 font-bold rounded-lg hover:bg-red-50 transition flex justify-center items-center gap-2">
                        <DollarSign size={18}/> Registrar Gasto / Salida
                    </button>
                    <button onClick={handleClose} className="w-full py-3 bg-red-600 text-white font-bold rounded-lg shadow hover:bg-red-700 transition flex justify-center items-center gap-2">
                        <Lock size={18}/> CERRAR CAJA Y ARQUEAR
                    </button>
                </div>
            </div>
        )}
    </div>
  );
}