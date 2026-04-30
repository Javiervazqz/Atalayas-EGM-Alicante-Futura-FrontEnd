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
  jobRole?: string;
  companyId: string | null;
  createdAt: string;
  Company?: Company;
}

const ROLE_LABELS: Record<string, string> = {
  GENERAL_ADMIN: 'Súper Admin',
  ADMIN: 'Admin Empresa',
  EMPLOYEE: 'Empleado',
  PUBLIC: 'Público',
};

const ROLE_COLORS: Record<string, string> = {
  GENERAL_ADMIN: 'bg-purple-100 text-purple-700 border border-purple-200',
  ADMIN: 'bg-blue-100 text-blue-700 border border-blue-200',
  EMPLOYEE: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  PUBLIC: 'bg-orange-100 text-orange-700 border border-orange-200',
};

export default function EmployeesPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedCompany, setSelectedCompany] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Estado para el modal de eliminación
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${getToken()}` };
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      setCurrentUser(storedUser);

      const [usersRes, compRes] = await Promise.all([
        fetch(API_ROUTES.USERS.GET_ALL, { headers }),
        fetch(API_ROUTES.COMPANIES.GET_ALL, { headers }).catch(() => null)
      ]);

      const usersData = await usersRes.json();

      if (compRes && compRes.ok) {
        const compData = await compRes.json();
        setCompanies(Array.isArray(compData) ? compData : []);
      }

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
      console.error("Error cargando datos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_ROUTES.USERS.GET_ALL}/${userToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` }
      });

      if (res.ok) {
        setUsers(users.filter(u => u.id !== userToDelete.id));
        setUserToDelete(null);
      } else {
        alert("No se pudo eliminar el usuario.");
      }
    } catch (err) {
      console.error("Error al eliminar:", err);
    } finally {
      setDeleting(false);
    }
  };

  const displayedUsers = users
    .filter(user => {
      const matchCompany = selectedCompany === 'ALL' || String(user.companyId) === String(selectedCompany);
      const matchSearch =
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCompany && matchSearch;
    })
    .sort((a, b) => {
      const rolesOrder: Record<string, number> = { 'GENERAL_ADMIN': 1, 'ADMIN': 2, 'EMPLOYEE': 3, 'PUBLIC': 4 };
      return (rolesOrder[a.role] || 99) - (rolesOrder[b.role] || 99);
    });

  if (!currentUser) return null;

  return (
    <div className="flex min-h-screen bg-background font-sans text-foreground">
      <Sidebar role={currentUser.role} />

      <main className="flex-1 overflow-auto flex flex-col relative">
        <PageHeader
          title={currentUser.role === 'GENERAL_ADMIN' ? "Gestión Global de Usuarios" : "Panel de Empleados"}
          description={currentUser.role === 'GENERAL_ADMIN' ? "Control total de perfiles y empresas" : "Administra los miembros de tu organización"}
          icon={<i className="bi bi-people-fill"></i>}
          action={
            <div className="flex gap-2">
              {currentUser.role !== 'GENERAL_ADMIN' && (
                <Link
                  href="/dashboard/administrator/employees/moreNew"
                  className="bg-background border border-input hover:bg-muted text-foreground font-bold px-4 py-2.5 rounded-xl transition-all text-xs flex items-center gap-2"
                >
                  <i className="bi bi-file-earmark-arrow-up"></i> Carga Masiva
                </Link>
              )}
              <Link
                href="/dashboard/administrator/employees/new"
                className="bg-secondary hover:opacity-90 text-secondary-foreground font-bold px-6 py-2.5 rounded-xl transition-opacity text-xs shadow-sm flex items-center gap-2"
              >
                <i className="bi bi-person-plus-fill"></i> Nuevo Usuario
              </Link>
            </div>
          }
        />

        <div className="p-6 lg:p-10 flex-1 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
          <div className="bg-card rounded-3xl shadow-sm border border-border overflow-hidden flex flex-col">

            {/* FILTROS INTEGRADOS */}
            <div className="p-5 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/20">
              <div className="relative w-full sm:max-w-md">
                <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"></i>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre o email..."
                  className="w-full bg-background border border-input rounded-xl pl-11 pr-4 py-2.5 text-sm outline-none focus:border-primary transition-all font-medium"
                />
              </div>

              {currentUser.role === 'GENERAL_ADMIN' && (
                <div className="w-full sm:w-auto relative">
                  <select
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                    className="w-full sm:w-64 appearance-none bg-background border border-input px-4 py-2.5 pr-10 rounded-xl text-sm font-semibold outline-none cursor-pointer focus:border-primary transition-all"
                  >
                    <option value="ALL">Todas las empresas</option>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <i className="bi bi-building absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"></i>
                </div>
              )}
            </div>

            {/* TABLA REORDENADA */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Usuario</th>

                    {/* Columna Empresa condicional */}
                    {currentUser.role === 'GENERAL_ADMIN' && (
                      <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Empresa</th>
                    )}

                    <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Rol</th>

                    {/* Columna Puesto */}
                    <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Puesto</th>

                    <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-5" colSpan={currentUser.role === 'GENERAL_ADMIN' ? 5 : 4}>
                          <div className="h-4 bg-muted rounded w-full"></div>
                        </td>
                      </tr>
                    ))
                  ) : displayedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/30 transition-colors group">
                      {/* 1. Usuario */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-bold text-primary border border-primary/20 shrink-0">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-foreground truncate">{user.name}</p>
                            <p className="text-xs font-medium text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* 2. Empresa (Solo GENERAL_ADMIN) */}
                      {currentUser.role === 'GENERAL_ADMIN' && (
                        <td className="px-6 py-4">
                          <span className="text-[11px] font-bold text-foreground bg-muted px-2.5 py-1 rounded-md border border-border">
                            {user.Company?.name || 'Independiente'}
                          </span>
                        </td>
                      )}

                      {/* 3. Rol */}
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <span className={`px-3 py-1 rounded-lg text-[9px] uppercase font-black tracking-widest ${ROLE_COLORS[user.role]}`}>
                            {ROLE_LABELS[user.role] || user.role}
                          </span>
                        </div>
                      </td>

                      {/* 4. Puesto */}
                      <td className="px-6 py-4">
                        <span className="text-[11px] font-bold text-foreground/80 uppercase tracking-tight">
                          {user.jobRole || <span className="text-muted-foreground/30 italic font-normal">Sin asignar</span>}
                        </span>
                      </td>

                      {/* 5. Acciones */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Link
                            href={`/dashboard/administrator/employees/${user.id}`}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all border border-transparent hover:border-primary/10"
                          >
                            <i className="bi bi-pencil-square"></i>
                          </Link>
                          <button
                            onClick={() => setUserToDelete(user)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-all border border-transparent"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL DE ELIMINACIÓN */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-sm rounded-[2rem] p-8 shadow-2xl border border-border animate-in zoom-in-95 duration-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
                <i className="bi bi-exclamation-octagon"></i>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">¿Eliminar usuario?</h3>
              <p className="text-muted-foreground text-sm mb-8">
                Estás a punto de borrar a <strong>{userToDelete.name}</strong>. Esta acción no se puede deshacer.
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-full py-3 bg-red-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {deleting ? 'Eliminando...' : 'Confirmar Eliminación'}
                </button>
                <button
                  onClick={() => setUserToDelete(null)}
                  className="w-full py-3 bg-muted text-foreground rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-border transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}