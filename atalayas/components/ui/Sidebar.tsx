'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface SidebarProps {
  role: 'GENERAL_ADMIN' | 'ADMIN' | 'EMPLOYEE' | 'PUBLIC';
}

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
    { label: 'Panel', href: '/dashboard/administrator/admin', icon: <i className="bi bi-house-fill text-blue-500"></i> },
    { label: 'Mi Empresa', href: '/dashboard/company', icon: <i className="bi bi-building-fill text-blue-500"></i> },
    { label: 'Empleados', href: '/dashboard/administrator/employees', icon: <i className="bi bi-people-fill text-blue-500"></i>},
    { label: 'Cursos', href: '/dashboard/administrator/admin/courses', icon: <i className="bi bi-mortarboard-fill text-blue-500 "></i>  },
    { label: 'Documentos', href: '/dashboard/documents', icon: <i className="bi bi-file-earmark-text-fill text-blue-500"></i>  },
    { label: 'Servicios', href: '/dashboard/administrator/admin/services', icon: <i className="bi bi-suitcase-lg-fill text-blue-500"></i> }
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
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // 1. Manejo de Responsive
  useEffect(() => {
    // 1. Manejo de redimensionamiento
    const checkResizing = () => {
      const width = window.innerWidth;
      const mobile = width < 768;
      const tablet = width >= 768 && width < 1024
      setIsMobile(mobile);
      setIsTablet(tablet);
      if (mobile || tablet) {
        setCollapsed(true);
      }
      else{
        setCollapsed(false)
      }
    };

    checkResizing();
    window.addEventListener('resize', checkResizing);
    return () => window.removeEventListener('resize', checkResizing);
  }, []);

  // 2. Carga inicial de caché y fetch de solicitudes pendientes
  useEffect(() => {
    const cached = localStorage.getItem('pendingCount');
    if (cached) setPendingCount(parseInt(cached));

    if (role !== 'GENERAL_ADMIN') return;

    const fetchPending = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:3000/company-request', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        const pending = Array.isArray(data) ? data.filter((r: any) => r.status === 'PENDING').length : 0;
        setPendingCount(pending);
        localStorage.setItem('pendingCount', pending.toString());
      } catch (error) {
        console.error('Error fetching pending requests:', error);
      }
    };

    fetchPending();
  }, [role]);

  const user = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('user') || '{}')
    : {};

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-64'} transition-all duration-300 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0 left-0 z-20`}>
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0071e3] rounded-lg flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-[#1d1d1f] font-bold text-lg tracking-tight">Atalayas</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-[#86868b] hover:text-[#1d1d1f] transition-colors p-1 rounded-lg hover:bg-[#f5f5f7]"
        >
          <i className="bi bi-list"></i>
        </button>
      </div>

      {/* Navegación */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems[role]?.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${isActive
                  ? 'bg-[#0071e3]/10 text-[#0071e3]'
                  : 'text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#f5f5f7]'
              }`}
            >
              <span className="text-base shrink-0">{item.icon}</span>
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.label === 'Solicitudes' && pendingCount > 0 && (
                    <span className="bg-orange-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[1.2rem] text-center">
                      {pendingCount}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-gray-100 bg-white">
        <Link href="/dashboard/profile">
          <div className={`flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#f5f5f7] transition-colors cursor-pointer group ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-gray-200 group-hover:border-[#0071e3] transition-colors">
              {user.avatarUrl ? (
                <img
                  src={encodeURI(user.avatarUrl)}
                  alt="Perfil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#0071e3]/10 flex items-center justify-center">
                  <span className="text-[#0071e3] text-sm font-bold">
                    {user.name ? user.name.charAt(0).toUpperCase() : (user.email?.[0]?.toUpperCase() || 'U')}
                  </span>
                </div>
              )}
            </div>

            {!collapsed && (
              <div className="flex-1 min-w-0 flex flex-col items-start gap-0.5">
                <p className="text-[#1d1d1f] text-sm font-bold truncate w-full group-hover:text-[#0071e3] transition-colors">
                  {user.name || (user.email ? user.email.split('@')[0].charAt(0).toUpperCase() + user.email.split('@')[0].slice(1).toLowerCase() : 'Usuario')}
                </p>
                <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded tracking-wider ${roleColors[role]}`}>
                  {roleLabels[role]}
                </span>
              </div>
            )}
          </div>
        </Link>

        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[#86868b] hover:text-red-600 hover:bg-red-50 transition-all text-sm font-medium mt-1 ${collapsed ? 'justify-center' : 'ml-0.5'}`}
        >
          <span className="text-lg"><i className="bi bi-door-closed"></i></span>
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}