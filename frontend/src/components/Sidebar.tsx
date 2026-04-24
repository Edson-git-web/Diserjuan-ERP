import { LayoutDashboard, Package, ShoppingCart, Users, LogOut, FileText, Settings, Briefcase, Truck, ArrowDownCircle, ClipboardList, Wallet, PieChart, ShieldAlert } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps { 
  isOpen: boolean; 
  onLogout: () => void;
  role?: string; 
}

export default function Sidebar({ isOpen, onLogout, role = localStorage.getItem('role') || 'VENDEDOR' }: SidebarProps) {
  const location = useLocation();
  const isAdmin = role.toUpperCase() === 'ADMIN';

  const NavItem = ({ to, icon: Icon, label }: any) => {
    const isActive = location.pathname === to;
    return (
      <Link to={to} className={`flex items-center gap-3 w-full p-3 rounded-lg transition-all duration-200 group ${isActive ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
        <Icon size={20} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'} />
        {isOpen && <span className="font-medium text-sm">{label}</span>}
      </Link>
    );
  };

  return (
    <aside className={`bg-slate-900 text-white flex flex-col transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className="h-16 flex items-center justify-center border-b border-slate-700 bg-slate-950 flex-col py-2">
        {isOpen ? (
          <>
            <h1 className="text-xl font-bold text-white leading-tight">DISERJUAN</h1>
            <span className="text-[10px] uppercase font-bold text-blue-400 tracking-widest flex items-center gap-1 mt-1">
              {isAdmin ? <ShieldAlert size={10}/> : <ShoppingCart size={10}/>} {role}
            </span>
          </>
        ) : (
          <span className="font-bold text-xl text-blue-400">DS</span>
        )}
      </div>
      
      <nav className="flex-1 py-6 space-y-1 px-3 overflow-y-auto scrollbar-hide">
        {/* SECCIÓN PÚBLICA (Todos los roles) */}
        <div className="text-xs font-bold text-slate-500 px-3 py-2 uppercase tracking-wider">{isOpen && 'Comercial'}</div>
        <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
        <NavItem to="/cash" icon={Wallet} label="Control de Caja" />
        <NavItem to="/sales" icon={ShoppingCart} label="Punto de Venta" />
        <NavItem to="/customers" icon={Briefcase} label="Clientes CRM" />
        <NavItem to="/history" icon={FileText} label="Ventas / Facturas" />
        <NavItem to="/inventory" icon={Package} label="Consultar Stock" />
        
        {/* SECCIONES PRIVADAS (Solo ADMIN) */}
        {isAdmin && (
          <>
            <div className="my-2 border-t border-slate-700 opacity-50"></div>
            <div className="text-xs font-bold text-slate-500 px-3 py-2 uppercase tracking-wider">{isOpen && 'Logística'}</div>
            <NavItem to="/purchase-entry" icon={ArrowDownCircle} label="Ingreso Mercadería" />
            <NavItem to="/providers" icon={Truck} label="Proveedores" />
            
            <div className="my-2 border-t border-slate-700 opacity-50"></div>
            <div className="text-xs font-bold text-slate-500 px-3 py-2 uppercase tracking-wider">{isOpen && 'Gerencia'}</div>
            <NavItem to="/reports" icon={PieChart} label="Reportes BI" />
            <NavItem to="/kardex" icon={ClipboardList} label="Kardex / Auditoría" />
            
            <div className="my-2 border-t border-slate-700 opacity-50"></div>
            <div className="text-xs font-bold text-slate-500 px-3 py-2 uppercase tracking-wider">{isOpen && 'Administración'}</div>
            <NavItem to="/products-admin" icon={Settings} label="Gestión Productos" />
            <NavItem to="/users" icon={Users} label="Usuarios y Roles" />
          </>
        )}
      </nav>

      <div className="p-4 border-t border-slate-700 bg-slate-950">
        <button onClick={onLogout} className="flex items-center gap-3 text-slate-400 hover:text-red-400 transition w-full p-2 rounded-lg hover:bg-slate-900">
          <LogOut size={20} />
          {isOpen && <span className="text-sm font-medium">Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
}