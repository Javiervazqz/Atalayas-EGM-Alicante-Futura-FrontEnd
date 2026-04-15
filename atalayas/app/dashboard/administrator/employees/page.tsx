'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import Link from 'next/link';
import { API_ROUTES } from '@/lib/utils';
import SearchInput from '@/components/ui/Searchbar';

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
              String(u.companyId) === String(storedUser.companyId)
            );
            setUsers(filtered);
          } else {
            setUsers(usersData); 
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

  const displayedUsers = users
    .filter(user => {
      const matchCompany = selectedCompany === 'ALL' || String(user.companyId) === String(selectedCompany);
      const matchSearch = user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          user.email?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCompany && matchSearch;
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
    GENERAL_ADMIN: 'bg-primary text-primary-foreground',
    ADMIN: 'bg-primary/20 text-primary',
    EMPLOYEE: 'bg-secondary/20 text-secondary',
    PUBLIC: 'bg-muted text-muted-foreground',
  };

  const roleLabels: Record<string, string> = {
    GENERAL_ADMIN: 'Admin General',
    ADMIN: 'Admin Empresa',
    EMPLOYEE: 'Empleado',
    PUBLIC: 'Público',
  };

  if (!currentUser) return null;

  return (
    <div className="flex min-h-screen bg-background font-sans">
      <Sidebar role={currentUser.role} />
      <main className="flex-1 p-6 lg:p-10 overflow-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight mb-2">Gestión de Usuarios</h1>
            <p className="text-muted-foreground text-base font-medium">
              {currentUser.role === 'GENERAL_ADMIN' ? 'Control total del polígono industrial' : 'Administra los accesos de tu empresa'}
            </p>
          </div>
          <Link href="/dashboard/administrator/employees/new" className="bg-secondary hover:opacity-90 text-secondary-foreground font-bold px-6 py-3 rounded-xl transition-opacity text-sm shadow-sm flex items-center gap-2 shrink-0">
            <i className="bi bi-person-plus-fill"></i> Nuevo usuario
          </Link>
        </div>

        {/* Barra de Filtros */}
        <div className="bg-card rounded-3xl p-6 shadow-sm border border-border mb-8 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="w-full sm:w-96">
             <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Buscar por nombre o email..." />
          </div>

          {currentUser.role === 'GENERAL_ADMIN' && (
            <select value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)} className="w-full sm:w-64 px-4 py-3 bg-background border border-input focus:border-primary focus:ring-2 focus:ring-ring rounded-xl text-sm font-semibold outline-none cursor-pointer text-foreground transition-all">
              <option value="ALL">Todas las empresas</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}
        </div>

        {/* Tabla */}
        <div className="bg-card rounded-3xl shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-5 text-[11px] font-black text-muted-foreground uppercase tracking-widest">Usuario</th>
                  <th className="px-6 py-5 text-[11px] font-black text-muted-foreground uppercase tracking-widest">Rol</th>
                  {currentUser.role === 'GENERAL_ADMIN' && <th className="px-6 py-5 text-[11px] font-black text-muted-foreground uppercase tracking-widest">Empresa</th>}
                  <th className="px-6 py-5 text-[11px] font-black text-muted-foreground uppercase tracking-widest text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? [...Array(3)].map((_, i) => <tr key={i} className="animate-pulse"><td className="px-6 py-6" colSpan={4}><div className="h-6 bg-muted rounded-lg w-full"></div></td></tr>) : 
                  displayedUsers.length > 0 ? displayedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                          {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">{user.name || 'Sin nombre'}</p>
                          <p className="text-xs font-medium text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-md text-[10px] uppercase font-black tracking-widest ${roleColors[user.role] || 'bg-muted text-muted-foreground'}`}>
                        {roleLabels[user.role] || user.role}
                      </span>
                    </td>
                    {currentUser.role === 'GENERAL_ADMIN' && (
                      <td className="px-6 py-4 text-sm text-foreground font-semibold">
                        {user.Company?.name || '—'}
                      </td>
                    )}
                    <td className="px-6 py-4 text-right">
                      <button className="w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors ml-auto">
                        <i className="bi bi-pencil-square text-lg"></i>
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={currentUser.role === 'GENERAL_ADMIN' ? 4 : 3} className="px-6 py-16 text-center">
                      <div className="text-4xl text-muted-foreground/30 mb-3"><i className="bi bi-search"></i></div>
                      <p className="text-foreground font-bold text-base mb-1">No se encontraron usuarios</p>
                      <p className="text-muted-foreground text-sm">Prueba con otra búsqueda o filtro.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}