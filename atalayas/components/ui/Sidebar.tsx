'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface SidebarProps {
  role: 'GENERAL_ADMIN' | 'ADMIN' | 'EMPLOYEE' | 'PUBLIC';
}

// ... navItems, roleLabels, roleColors se mantienen igual ...
const navItems = {
  GENERAL_ADMIN: [
    { label: 'Panel', href: '/dashboard/administrator/general-admin', icon: <i className="bi bi-house-fill text-blue-500"></i> },
    { label: 'Perfiles Empresas', href: '/dashboard/company', icon: <i className="bi bi-building-fill-gear text-blue-500"></i> },
    { label: 'Empresas', href: '/dashboard/administrator/general-admin/companies', icon: <i className="bi bi-buildings-fill text-blue-500"></i> },
    { label: 'Usuarios', href: '/dashboard/administrator/employees', icon: <i className="bi bi-people-fill text-blue-500"></i>},
    { label: 'Cursos', href: '/dashboard/administrator/general-admin/courses', icon: <i className="bi bi-mortarboard-fill text-blue-500 "></i>  },
    { label: 'Documentos', href: '/dashboard/documents', icon: <i className="bi bi-file-earmark-text-fill text-blue-500"></i>  },
    { label: 'Servicios', href: '/dashboard/administrator/general-admin/services', icon: <i className="bi bi-suitcase-lg-fill text-blue-500"></i> },
    { label: 'Anuncios', href: '/dashboard/administrator/general-admin/announcements', icon: <i className="bi bi-megaphone-fill text-blue-500"></i> },
    { label: 'Solicitudes', href: '/dashboard/administrator/general-admin/company-request', icon: <i className="bi bi-envelope-exclamation-fill text-blue-500"></i> },
  ],
  ADMIN: [
    { label: 'Panel', href: '/dashboard/administrator/admin', icon: <i className="bi bi-house-fill text-[#005596]"></i> },
    { label: 'Mi Empresa', href: '/dashboard/company', icon: <i className="bi bi-building-fill text-[#005596]"></i> },
    { label: 'Empleados', href: '/dashboard/administrator/employees', icon: <i className="bi bi-people-fill text-[#005596]"></i>},
    { label: 'Onboarding', href: '/dashboard/administrator/employees/onboarding', icon: <i className="bi bi-person-walking text-[#005596]"></i>},
    { label: 'Cursos', href: '/dashboard/administrator/admin/courses', icon: <i className="bi bi-mortarboard-fill text-[#005596] "></i>  },
    { label: 'Documentos', href: '/dashboard/documents', icon: <i className="bi bi-file-earmark-text-fill text-[#005596]"></i>  },
    { label: 'Servicios', href: '/dashboard/administrator/admin/services', icon: <i className="bi bi-suitcase-lg-fill text-[#005596]"></i> }
  ],
  EMPLOYEE: [
    { label: 'Inicio', href: '/dashboard/employee', icon: <i className="bi bi-house-fill text-[#005596]"></i> },
    { label: 'Mis Cursos', href: '/dashboard/employee/courses', icon: <i className="bi bi-mortarboard-fill text-[#005596] "></i> },
    { label: 'Documentos', href: '/dashboard/documents', icon: <i className="bi bi-file-earmark-text-fill text-[#005596]"></i> },
    { label: 'Servicios', href: '/dashboard/employee/services', icon: <i className="bi bi-suitcase-lg-fill text-[#005596]"></i> },
  ],
  PUBLIC: [
    { label: 'Panel', href: '/dashboard/public', icon: <i className="bi bi-house-fill text-blue-500"></i> },
    { label: 'Cursos', href: '/dashboard/public/courses', icon: <i className="bi bi-mortarboard-fill text-blue-500 "></i>  },
    { label: 'Servicios', href: '/dashboard/public/services', icon: <i className="bi bi-suitcase-lg-fill text-blue-500"></i> },
  ],
};

const roleLabels = {
  GENERAL_ADMIN: 'Admin General',
  ADMIN: 'Administrador',
  EMPLOYEE: 'Empleado',
  PUBLIC: 'Usuario',
};

const roleColors = {
  GENERAL_ADMIN: 'bg-purple-100 text-purple-700',
  ADMIN: 'bg-blue-100 text-blue-700',
  EMPLOYEE: 'bg-green-100 text-green-700',
  PUBLIC: 'bg-gray-100 text-gray-700',
};

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null); // Estado para el usuario

  useEffect(() => {
    // 1. Cargamos el usuario del localStorage solo una vez al montar
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
    
    setMounted(true);

    const checkResizing = () => {
      if (window.innerWidth < 1024) setCollapsed(true);
      else setCollapsed(false);
    };
    checkResizing();
    window.addEventListener('resize', checkResizing);
    return () => window.removeEventListener('resize', checkResizing);
  }, []);

  useEffect(() => {
    if (!mounted || role !== 'GENERAL_ADMIN') return;

    const fetchPending = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:3000/company-request', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        const pending = Array.isArray(data) ? data.filter((r: any) => r.status === 'PENDING').length : 0;
        setPendingCount(pending);
      } catch (error) {
        console.error("Error fetching pending requests", error);
      }
    };
    fetchPending();
  }, [role, mounted]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <>
      {/* Botón flotante móvil */}
      <button
        onClick={() => setCollapsed(false)}
        className={`fixed top-1 left-1 z-50 p-1 bg-[#005596] text-white rounded-lg lg:hidden shadow-lg ${!collapsed ? 'hidden' : 'flex'}`}
      >
        <i className="bi bi-list text-xl h-7"></i>
      </button>

      {/* Overlay */}
      {!collapsed && (
        <div 
          className="fixed inset-0 bg-black/40 z-30 lg:hidden" 
          onClick={() => setCollapsed(true)}
        />
      )}

      <aside 
        className={`
          ${collapsed ? 'w-16 max-lg:-translate-x-full' : 'w-64 max-lg:translate-x-0'} 
          transition-all duration-300 bg-white border-r border-gray-200 flex flex-col h-screen 
          sticky top-0 left-0 z-40 max-lg:fixed
        `}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className={`flex items-center gap-2 ${collapsed ? 'hidden' : 'flex'}`}>
            <div className="rounded-2xl flex items-center justify-center shrink-0 shadow-sm overflow-hidden bg-gray-50 h-12 w-12">
              {/* Solo mostramos la imagen si está montado y tenemos datos */}
              {mounted && user?.company?.logoUrl ? (
                <img src={user.company.logoUrl} className="object-cover h-full w-full" alt="Logo" />
              ) : (
                <div className="h-full w-full bg-gray-100 animate-pulse" />
              )}
            </div>
            <span className="text-[#1d1d1f] font-bold text-lg tracking-tight ml-1 truncate">
              {/* Si no está montado, no mostramos texto para evitar el parpadeo de "Mi Empresa" */}
              {mounted ? (user?.company?.name || 'Mi Empresa') : ''}
            </span>
          </div>
          
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-[#86868b] hover:text-[#1d1d1f] transition-colors p-1 rounded-lg hover:bg-[#f5f5f7]"
          >
            <i className={`bi ${collapsed && mounted && window.innerWidth >= 1024 ? 'bi-chevron-right' : 'bi-list'}`}></i>
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems[role]?.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => { if(window.innerWidth < 1024) setCollapsed(true) }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
                  isActive ? 'bg-[#0071e3]/10 text-[#0071e3]' : 'text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#f5f5f7]'
                }`}
              >
                <span className="text-base shrink-0">{item.icon}</span>
                <span className={`flex-1 ${collapsed ? 'hidden' : 'block'} truncate`}>
                  {item.label}
                </span>
                {!collapsed && item.label === 'Solicitudes' && pendingCount > 0 && (
                  <span className="bg-orange-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[1.2rem] text-center">
                    {pendingCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-100 bg-white">
          <Link href="/dashboard/profile">
            <div className={`flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#f5f5f7] transition-colors cursor-pointer group ${collapsed ? 'justify-center' : ''}`}>
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-gray-200 group-hover:border-[#0071e3] transition-colors">
                {mounted && user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#0071e3]/10 flex items-center justify-center">
                    <span className="text-[#0071e3] text-sm font-bold">
                      {mounted && user?.name ? user.name.charAt(0).toUpperCase() : ''}
                    </span>
                  </div>
                )}
              </div>

              <div className={`flex-1 min-w-0 flex-col items-start gap-0.5 ${collapsed ? 'hidden' : 'flex'}`}>
                <p className="text-[#1d1d1f] text-sm font-bold truncate w-full group-hover:text-[#0071e3] transition-colors">
                  {mounted ? (user?.name || user?.email?.split('@')[0].toUpperCase()) : ''}
                </p>
                {mounted && (
                  <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded tracking-wider ${roleColors[role]}`}>
                    {roleLabels[role]}
                  </span>
                )}
              </div>
            </div>
          </Link>

          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[#86868b] hover:text-red-600 hover:bg-red-50 transition-all text-sm font-medium mt-1 cursor-pointer ${collapsed ? 'justify-center' : 'ml-0.5'}`}
          >
            <span className="text-lg"><i className="bi bi-door-closed"></i></span>
            <span className={`${collapsed ? 'hidden' : 'block'}`}>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}