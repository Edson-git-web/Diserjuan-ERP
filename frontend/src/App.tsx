import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

import Login from './components/Login';
import MainLayout from './layouts/MainLayout';

import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import Customers from './pages/Customers';
import SalesHistory from './pages/SalesHistory';
import CashControl from './pages/CashControl';

import PurchaseEntry from './pages/PurchaseEntry';
import Providers from './pages/Providers';
import Reports from './pages/Reports';
import Inventory from './pages/Inventory';
import ProductManagement from './pages/ProductManagement';
import KardexReport from './pages/KardexReport';
import Users from './pages/Users';

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [username, setUsername] = useState<string>(localStorage.getItem('username') || '');
  const [fullName, setFullName] = useState<string>(localStorage.getItem('fullName') || '');
  const [role, setRole] = useState<string>(localStorage.getItem('role') || 'VENDEDOR');

  const handleLogin = (newToken: string, user: string, userRole: string, name: string) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('username', user);
    localStorage.setItem('role', userRole);
    localStorage.setItem('fullName', name);
    setToken(newToken);
    setUsername(user);
    setFullName(name);
    setRole(userRole.toUpperCase());
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('fullName');
    setToken(null);
    setUsername('');
    setFullName('');
    setRole('VENDEDOR');
    delete axios.defaults.headers.common['Authorization'];
  };

  useEffect(() => {
    if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }, [token]);

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          handleLogout();
          Swal.fire({ icon: 'warning', title: 'Sesión Caducada', text: 'Por seguridad, su sesión ha finalizado.', confirmButtonColor: '#2563EB' });
        } else if (error.response?.status === 403) {
          Swal.fire({ icon: 'error', title: 'Acceso Denegado', text: 'No tienes permiso para realizar esta acción. Se requiere rol de ADMIN.', confirmButtonColor: '#2563EB' });
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  const isAdmin = role === 'ADMIN';

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!token ? <Login onLoginSuccess={handleLogin} /> : <Navigate to="/dashboard" />} />

        {token ? (
          <Route element={<MainLayout onLogout={handleLogout} username={username} fullName={fullName} role={role} />}>
            {/* RUTAS COMPARTIDAS (VENDEDOR Y ADMIN) */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/cash" element={<CashControl />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/history" element={<SalesHistory />} />
            <Route path="/inventory" element={<Inventory />} />

            {/* RUTAS EXCLUSIVAS DE ADMINISTRADOR */}
            {isAdmin && (
              <>
                <Route path="/purchase-entry" element={<PurchaseEntry />} />
                <Route path="/providers" element={<Providers />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/kardex" element={<KardexReport />} />
                <Route path="/products-admin" element={<ProductManagement />} />
                <Route path="/users" element={<Users />} />
              </>
            )}

            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;