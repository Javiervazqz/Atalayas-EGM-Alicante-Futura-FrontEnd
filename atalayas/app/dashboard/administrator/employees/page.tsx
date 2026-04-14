'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import Link from 'next/link';
import { API_ROUTES } from '@/lib/utils';

interface Company {
  id: string;
  name: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  companyId: string | null;
  createdAt: string;
  Company?: Company;
}

export default function EmployeesPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedCompany, setSelectedCompany] = useState<string>('ALL');

  const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  useEffect(() => {
    const storedUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
    setCurrentUser(storedUser);

    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${getToken()}` };
        const usersRes = await fetch(API_ROUTES.USERS.GET_ALL, { headers });
        const usersData = await usersRes.json();
        
        try {
          const compRes = await fetch(API_ROUTES.COMPANIES.GET_ALL, { headers });
          if (compRes.ok) {
            const compData = await compRes.json();
            setCompanies(Array.isArray(compData) ? compData : []);
          }
        } catch (e) { console.log("Error cargando empresas"); }

        if (Array.isArray(usersData)) {
          // Filtro de seguridad para Admins: solo ven su empresa
          if (storedUser.role === 'ADMIN') {
            const filtered = usersData.filter(u => 
              String(u.companyId) === String(storedUser.companyId)
            );
            setUsers(filtered);
          } else {
            setUsers(usersData); // General Admin ve todo
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // FILTRO POR EMPRESA + ORDEN POR ROLES (Jerarquía)
  const displayedUsers = users
    .filter(user => {
      if (selectedCompany === 'ALL') return true;
      return String(user.companyId) === String(selectedCompany);
    })
    .sort((a, b) => {
      const rolesOrder: Record<string, number> = {
        'GENERAL_ADMIN': 1,
        'ADMIN': 2,
        'EMPLOYEE': 3,
        'PUBLIC': 4
      };
      return (rolesOrder[a.role] || 99) - (rolesOrder[b.role] || 99);
    });

  const roleColors: Record<string, string> = {
    GENERAL_ADMIN: 'bg-purple-100 text-purple-700',
    ADMIN: 'bg-blue-100 text-blue-700',
    EMPLOYEE: 'bg-gray-100 text-gray-700',
    PUBLIC: 'bg-orange-100 text-orange-700',
  };

  if (!currentUser) return null;

  return (
    <div className="flex min-h-screen bg-[#f5f5f7]" style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" }}>
      <Sidebar role={currentUser.role} />
      <main className="flex-1 p-10 overflow-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1d1d1f] tracking-tight mb-2">Gestión de Empleados</h1>
            <p className="text-[#86868b] text-base">
              {currentUser.role === 'GENERAL_ADMIN' ? 'Control total del polígono industrial' : 'Administra los accesos de tu empresa'}
            </p>
          </div>
          <Link href="/dashboard/administrator/employees/new" className="bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium px-5 py-2.5 rounded-xl transition-colors text-sm shadow-sm">
            + Nuevo empleado
          </Link>
        </div>

        {/* Barra de Filtros */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input type="text" placeholder="Buscar por nombre o email..." className="w-full pl-10 pr-4 py-2.5 bg-[#f5f5f7] border border-transparent focus:border-[#0071e3] focus:bg-white rounded-xl text-sm outline-none transition-all" />
          </div>

          {currentUser.role === 'GENERAL_ADMIN' && (
            <select value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)} className="w-full md:w-64 px-4 py-2.5 bg-[#f5f5f7] border border-transparent rounded-xl text-sm outline-none cursor-pointer">
              <option value="ALL">Todas las empresas</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}
        </div>

        {/* Tabla Estilo Apple */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-semibold text-[#86868b] uppercase tracking-wider">Usuario</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#86868b] uppercase tracking-wider">Rol</th>
                {currentUser.role === 'GENERAL_ADMIN' && <th className="px-6 py-4 text-xs font-semibold text-[#86868b] uppercase tracking-wider">Empresa</th>}
                <th className="px-6 py-4 text-xs font-semibold text-[#86868b] uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? [...Array(3)].map((_, i) => <tr key={i} className="animate-pulse"><td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-full"></div></td></tr>) : 
                displayedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-[#1d1d1f]">
                        {user.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#1d1d1f]">{user.name || 'Sin nombre'}</p>
                        <p className="text-xs text-[#86868b]">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold tracking-tight ${roleColors[user.role] || 'bg-gray-100'}`}>
                      {user.role}
                    </span>
                  </td>
                  {currentUser.role === 'GENERAL_ADMIN' && (
                    <td className="px-6 py-4 text-sm text-[#1d1d1f] font-medium">
                      {user.Company?.name || '—'}
                    </td>
                  )}
                  <td className="px-6 py-4 text-right">
                    <button className="text-[#86868b] hover:text-[#0071e3] transition-colors p-2 rounded-lg hover:bg-blue-50">✎</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}