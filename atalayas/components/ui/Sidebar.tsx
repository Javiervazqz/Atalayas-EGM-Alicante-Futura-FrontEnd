'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface SidebarProps {
  role: 'GENERAL_ADMIN' | 'ADMIN' | 'EMPLOYEE' | 'PUBLIC';
}

const navItems = {
  GENERAL_ADMIN: [
    { label: 'Panel', href: '/dashboard/administrator/general-admin', icon: <i className="bi bi-grid"></i> },
    { label: 'Perfiles Empresas', href: '/dashboard/company', icon: <i className="bi bi-building-gear"></i> },
    { label: 'Empresas', href: '/dashboard/administrator/general-admin/companies', icon: <i className="bi bi-buildings"></i> },
    { label: 'Usuarios', href: '/dashboard/administrator/employees', icon: <i className="bi bi-people"></i>},
    { label: 'Cursos', href: '/dashboard/administrator/general-admin/courses', icon: <i className="bi bi-journal-bookmark"></i>  },
    { label: 'Documentos', href: '/dashboard/documents', icon: <i className="bi bi-folder2-open"></i>  },
    { label: 'Servicios', href: '/dashboard/administrator/general-admin/services', icon: <i className="bi bi-briefcase"></i> },
    { label: 'Anuncios', href: '/dashboard/administrator/general-admin/announcements', icon: <i className="bi bi-megaphone"></i> },
    { label: 'Solicitudes', href: '/dashboard/administrator/general-admin/company-request', icon: <i className="bi bi-envelope-paper"></i> },
  ],
  ADMIN: [
    { label: 'Panel', href: '/dashboard/administrator/admin', icon: <i className="bi bi-grid"></i> },
    { label: 'Mi Empresa', href: '/dashboard/company', icon: <i className="bi bi-building"></i> },
    { label: 'Empleados', href: '/dashboard/administrator/employees', icon: <i className="bi bi-people"></i>},
    { label: 'Cursos', href: '/dashboard/administrator/admin/courses', icon: <i className="bi bi-journal-bookmark"></i>  },
    { label: 'Documentos', href: '/dashboard/documents', icon: <i className="bi bi-folder2-open"></i>  },
    { label: 'Servicios', href: '/dashboard/administrator/admin/services', icon: <i className="bi bi-briefcase"></i> }
  ],
  EMPLOYEE: [
    { label: 'Inicio', href: '/dashboard/employee', icon: <i className="bi bi-grid"></i> },
    { label: 'Mis Cursos', href: '/dashboard/employee/courses', icon: <i className="bi bi-journal-bookmark"></i> },
    { label: 'Documentos', href: '/dashboard/documents', icon: <i className="bi bi-folder2-open"></i> },
    { label: 'Servicios', href: '/dashboard/employee/services', icon: <i className="bi bi-briefcase"></i> },
  ],
  PUBLIC: [
    { label: 'Panel', href: '/dashboard/public', icon: <i className="bi bi-grid"></i> },
    { label: 'Cursos', href: '/dashboard/public/courses', icon: <i className="bi bi-journal-bookmark"></i>  },
    { label: 'Servicios', href: '/dashboard/public/services', icon: <i className="bi bi-briefcase"></i> },
  ],
};

const roleLabels = {
  GENERAL_ADMIN: 'Admin General',
  ADMIN: 'Administrador',
  EMPLOYEE: 'Empleado',
  PUBLIC: 'Usuario',
};

// 🎨 CORRECCIÓN: Todos los roles usan ahora colores del sistema
const roleColors = {
  GENERAL_ADMIN: 'bg-primary text-primary-foreground border-transparent', // El más alto, con color sólido
  ADMIN: 'bg-primary/20 text-primary border-primary/30', // Color secundario fuerte
  EMPLOYEE: 'bg-secondary/20 text-secondary border-secondary/30', // Naranja para el usuario estándar
  PUBLIC: 'bg-muted text-muted-foreground border-border', // Gris para el público
};

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const checkResizing = () => {
      const width = window.innerWidth;
      const mobile = width < 768;
      const tablet = width >= 768 && width < 1024;
      setIsMobile(mobile);
      setIsTablet(tablet);
      if (mobile || tablet) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };

    checkResizing();
    window.addEventListener('resize', checkResizing);
    return () => window.removeEventListener('resize', checkResizing);
  }, []);

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
    <aside className={`${collapsed ? 'w-16' : 'w-64'} transition-all duration-300 bg-card border-r border-border flex flex-col h-screen sticky top-0 left-0 z-20 font-sans`}>
      <div className="flex items-center justify-between p-5 border-b border-border">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-primary-foreground font-bold text-sm">A</span>
            </div>
            <span className="text-foreground font-bold text-lg tracking-tight">Atalayas</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-muted-foreground hover:text-secondary transition-colors p-1.5 rounded-lg hover:bg-secondary/10"
        >
          <i className="bi bi-list text-lg"></i>
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {navItems[role]?.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium group ${isActive
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <span className={`text-lg shrink-0 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-secondary'}`}>
                {item.icon}
              </span>
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.label === 'Solicitudes' && pendingCount > 0 && (
                    <span className="bg-secondary text-secondary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[1.2rem] text-center shadow-sm">
                      {pendingCount}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border bg-card">
        <Link href="/dashboard/profile">
          <div className={`flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-muted transition-colors cursor-pointer group ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border-2 border-border group-hover:border-secondary transition-colors">
              {user.avatarUrl ? (
                <img
                  src={encodeURI(user.avatarUrl)}
                  alt="Perfil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary text-sm font-bold">
                    {user.name ? user.name.charAt(0).toUpperCase() : (user.email?.[0]?.toUpperCase() || 'U')}
                  </span>
                </div>
              )}
            </div>

            {!collapsed && (
              <div className="flex-1 min-w-0 flex flex-col items-start gap-0.5">
                <p className="text-foreground text-sm font-semibold truncate w-full group-hover:text-secondary transition-colors">
                  {user.name || (user.email ? user.email.split('@')[0].charAt(0).toUpperCase() + user.email.split('@')[0].slice(1).toLowerCase() : 'Usuario')}
                </p>
                <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border tracking-wider ${roleColors[role]}`}>
                  {roleLabels[role]}
                </span>
              </div>
            )}
          </div>
        </Link>

        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all text-sm font-medium mt-2 ${collapsed ? 'justify-center' : ''}`}
        >
          <span className="text-lg"><i className="bi bi-box-arrow-right"></i></span>
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}