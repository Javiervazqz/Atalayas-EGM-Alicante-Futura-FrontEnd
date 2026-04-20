'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import Link from 'next/link';
import { API_ROUTES } from '@/lib/utils';

// 1. Mapeo de roles a Español
const ROLE_LABELS: Record<string, string> = {
  GENERAL_ADMIN: 'Súper Admin',
  ADMIN: 'Admin Empresa',
  EMPLOYEE: 'Empleado',
  PUBLIC: 'Público',
};

const ROLE_COLORS: Record<string, string> = {
  GENERAL_ADMIN: 'bg-purple-100 text-purple-700',
  ADMIN: 'bg-blue-100 text-blue-700',
  EMPLOYEE: 'bg-gray-100 text-gray-700',
  PUBLIC: 'bg-orange-100 text-orange-700',
};

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
  const [searchQuery, setSearchQuery] = useState('');

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
          if (storedUser.role === 'ADMIN') {
            const filtered = usersData.filter(u => 
              String(u.companyId || '').trim() === String(storedUser.companyId || '').trim()
            );
            setUsers(filtered);
          } else {
            setUsers(usersData);
          }
        }
      } catch (err) {
        console.error("Error cargando empleados:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const displayedUsers = users
    .filter(user => {
      const matchesCompany = selectedCompany === 'ALL' || String(user.companyId) === String(selectedCompany);
      const matchesSearch = 
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        user.email?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCompany && matchesSearch;
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

  if (!currentUser) return null;

  return (
    <div className="flex min-h-screen bg-[#f5f5f7]" style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" }}>
      <Sidebar role={currentUser.role} />
      <main className="flex-1 p-10 overflow-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1d1d1f] tracking-tight mb-2">Gestión de Empleados</h1>
            <p className="text-[#86868b] text-base font-medium">
              {currentUser.role === 'GENERAL_ADMIN' ? 'Control total del polígono industrial' : 'Administra los accesos de tu empresa'}
            </p>
          </div>
          <Link href="/dashboard/administrator/employees/new" className="bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-sm shadow-sm">
            Nuevo empleado
          </Link>
        </div>

        {/* Barra de Filtros */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
            <input 
              type="text" 
              placeholder="Buscar por nombre o email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#f5f5f7] border border-transparent focus:border-[#0071e3] focus:bg-white rounded-xl text-sm outline-none transition-all shadow-inner" 
            />
          </div>

          {currentUser.role === 'GENERAL_ADMIN' && (
            <select 
              value={selectedCompany} 
              onChange={(e) => setSelectedCompany(e.target.value)} 
              className="w-full md:w-64 px-4 py-2.5 bg-[#f5f5f7] border border-transparent rounded-xl text-sm outline-none cursor-pointer font-medium text-[#1d1d1f]"
            >
              <option value="ALL">🏢 Todas las empresas</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-[#86868b] uppercase tracking-widest">Usuario</th>
                <th className="px-8 py-5 text-[10px] font-black text-[#86868b] uppercase tracking-widest">Rol asignado</th>
                {currentUser.role === 'GENERAL_ADMIN' && <th className="px-8 py-5 text-[10px] font-black text-[#86868b] uppercase tracking-widest">Empresa</th>}
                <th className="px-8 py-5 text-[10px] font-black text-[#86868b] uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-8 py-6"><div className="h-4 bg-gray-100 rounded w-full"></div></td>
                  </tr>
                ))
              ) : displayedUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-gray-400 text-sm italic font-medium">
                    No se encontraron empleados vinculados.
                  </td>
                </tr>
              ) : (
                displayedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#f5f5f7]/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-sm font-bold text-[#0071e3] shadow-sm">
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#1d1d1f]">{user.name || 'Sin nombre'}</p>
                          <p className="text-[11px] font-medium text-[#86868b]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${ROLE_COLORS[user.role] || 'bg-gray-100'}`}>
                        {ROLE_LABELS[user.role] || user.role}
                      </span>
                    </td>
                    {currentUser.role === 'GENERAL_ADMIN' && (
                      <td className="px-8 py-5">
                        <p className="text-[13px] font-bold text-[#1d1d1f]">{user.Company?.name || '—'}</p>
                      </td>
                    )}
                    <td className="px-8 py-5 text-right">
                      <button className="text-[#86868b] hover:text-[#0071e3] transition-all p-2 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100">
                        <span className="text-xs font-bold">Editar</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}