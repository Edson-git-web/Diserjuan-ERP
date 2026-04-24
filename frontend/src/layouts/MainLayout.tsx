import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Menu, Bell, Search, RefreshCw, WifiOff } from 'lucide-react';
import { Client } from '@stomp/stompjs';
import Swal from 'sweetalert2';

interface MainLayoutProps {
  onLogout: () => void;
  username: string;
  fullName?: string;
  role?: string;
}

export default function MainLayout({ onLogout, username, fullName, role = 'VENDEDOR' }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [connected, setConnected] = useState(false);

  // --- LÓGICA WEBSOCKET GLOBAL ---
  useEffect(() => {
    const client = new Client({
      brokerURL: 'ws://localhost:8080/ws/websocket',
      onConnect: () => {
        setConnected(true);
        client.subscribe('/topic/inventory-updates', (message) => {
          if (message.body === 'ACTUALIZAR_STOCK') {
            window.dispatchEvent(new Event('inventory-updated'));

            const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
            Toast.fire({ icon: 'info', title: 'Inventario actualizado en tiempo real' });
          }
        });
      },
      onDisconnect: () => setConnected(false)
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Sidebar isOpen={sidebarOpen} onLogout={onLogout} role={role} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 hover:text-gray-700">
              <Menu size={24} />
            </button>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
              <input type="text" placeholder="Buscar..." className="pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 bg-gray-50" />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border transition-colors duration-300 ${connected ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
              {connected ? (
                <RefreshCw size={14} className="animate-spin duration-3000" />
              ) : (
                <WifiOff size={14} />
              )}
              <span className="hidden sm:inline">{connected ? 'WS CONECTADO' : 'DESCONECTADO'}</span>
            </div>

            <button className="relative text-gray-500 hover:text-gray-700">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>
            </button>

            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-800">{fullName || username}</p>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{role}</p>
              </div>
              <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold border-2 border-white shadow-sm">
                {(fullName || username).substring(0, 2).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* CONTENIDO DE LA PÁGINA */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}