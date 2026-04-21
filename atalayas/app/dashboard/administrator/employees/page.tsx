'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import PageHeader from '@/components/ui/pageHeader';
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
    ADMIN: 'bg-primary/20 text-primary border border-primary/30',
    EMPLOYEE: 'bg-secondary/20 text-secondary border border-secondary/30',
    PUBLIC: 'bg-muted text-muted-foreground border border-border',
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
      
      <main className="flex-1 overflow-auto flex flex-col relative">
        
        <PageHeader 
          title="Gestión de Usuarios"
          description={currentUser.role === 'GENERAL_ADMIN' ? 'Control total del polígono industrial' : 'Administra los accesos de tu empresa'}
          icon={<i className="bi bi-people-fill"></i>}
          action={
            <Link 
              href="/dashboard/administrator/employees/new" 
              className="bg-secondary hover:opacity-90 text-secondary-foreground font-bold px-6 py-3.5 rounded-xl transition-opacity text-sm shadow-sm flex items-center justify-center gap-2 w-full"
            >
              <i className="bi bi-person-plus-fill text-lg"></i> Nuevo usuario
            </Link>
          }
        />

        <div className="p-6 lg:p-10 flex-1 max-w-7xl mx-auto w-full">
          
          {/* TABLA INTEGRADA CON FILTROS */}
          <div className="bg-card rounded-3xl shadow-sm border border-border overflow-hidden flex flex-col">
            
            {/* Header de la Tabla (Buscador y Filtros) */}
            <div className="p-5 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/20">
              
              {/* Buscador minimalista integrado */}
              <div className="relative w-full sm:max-w-md">
                <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"></i>
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre o correo..."
                  className="w-full bg-background border border-input rounded-xl pl-11 pr-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium placeholder:text-muted-foreground"
                />
              </div>

              {/* Filtro de Empresas (Solo General Admin) */}
              {currentUser.role === 'GENERAL_ADMIN' && (
                <div className="w-full sm:w-auto relative shrink-0">
                  <select 
                    value={selectedCompany} 
                    onChange={(e) => setSelectedCompany(e.target.value)} 
                    className="w-full sm:w-64 appearance-none bg-background border border-input px-4 py-2.5 pr-10 rounded-xl text-sm font-semibold outline-none cursor-pointer text-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  >
                    <option value="ALL">Todas las empresas</option>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <i className="bi bi-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none text-xs font-bold"></i>
                </div>
              )}
            </div>

            {/* Contenido de la Tabla */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest w-[40%]">Usuario</th>
                    <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest w-[25%]">Rol</th>
                    {currentUser.role === 'GENERAL_ADMIN' && <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest w-[25%]">Empresa</th>}
                    <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right w-[10%]">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    [...Array(3)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-6" colSpan={currentUser.role === 'GENERAL_ADMIN' ? 4 : 3}>
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-muted rounded-xl"></div>
                            <div className="space-y-2">
                              <div className="h-4 bg-muted rounded w-32"></div>
                              <div className="h-3 bg-muted rounded w-48"></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : displayedUsers.length > 0 ? (
                    displayedUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-muted/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0 border border-primary/20">
                              {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-foreground truncate">{user.name || 'Sin nombre'}</p>
                              <p className="text-xs font-medium text-muted-foreground truncate mt-0.5">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-[6px] text-[9px] uppercase font-black tracking-widest ${roleColors[user.role] || 'bg-muted text-muted-foreground'}`}>
                            {roleLabels[user.role] || user.role}
                          </span>
                        </td>
                        {currentUser.role === 'GENERAL_ADMIN' && (
                          <td className="px-6 py-4">
                            <span className="text-xs font-semibold text-foreground bg-muted/50 px-2.5 py-1 rounded-md border border-border">
                              {user.Company?.name || 'Sin empresa'}
                            </span>
                          </td>
                        )}
                        <td className="px-6 py-4 text-right">
                          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all ml-auto border border-transparent hover:border-primary/20">
                            <i className="bi bi-pencil-square"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={currentUser.role === 'GENERAL_ADMIN' ? 4 : 3} className="px-6 py-16 text-center">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-2xl text-muted-foreground/50">
                          <i className="bi bi-search"></i>
                        </div>
                        <p className="text-foreground font-bold text-sm mb-1">No se encontraron usuarios</p>
                        <p className="text-muted-foreground text-xs">Prueba con otra búsqueda o cambia los filtros seleccionados.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}