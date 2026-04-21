'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface SidebarProps {
  role: 'GENERAL_ADMIN' | 'ADMIN' | 'EMPLOYEE' | 'PUBLIC';
}

const navItems = {
  GENERAL_ADMIN: [
    { label: 'Panel', href: '/dashboard/administrator/general-admin', icon: <i className="bi bi-grid-fill"></i> },
    { label: 'Perfil Empresa', href: '/dashboard/company', icon: <i className="bi bi-building-gear"></i> },
    { label: 'Empresas', href: '/dashboard/administrator/general-admin/companies', icon: <i className="bi bi-buildings-fill"></i> },
    { label: 'Usuarios', href: '/dashboard/administrator/employees', icon: <i className="bi bi-people-fill"></i>},
    { label: 'Cursos', href: '/dashboard/administrator/general-admin/courses', icon: <i className="bi bi-journal-bookmark-fill"></i>  },
    { label: 'Documentos', href: '/dashboard/documents', icon: <i className="bi bi-folder2-open"></i>  },
    { label: 'Servicios', href: '/dashboard/administrator/general-admin/services', icon: <i className="bi bi-briefcase-fill"></i> },
    { label: 'Anuncios', href: '/dashboard/administrator/general-admin/announcements', icon: <i className="bi bi-megaphone-fill"></i> },
    { label: 'Solicitudes', href: '/dashboard/administrator/general-admin/company-request', icon: <i className="bi bi-envelope-paper-fill"></i> },
  ],
  ADMIN: [
    { label: 'Panel', href: '/dashboard/administrator/admin', icon: <i className="bi bi-house-fill"></i> },
    { label: 'Mi Empresa', href: '/dashboard/company', icon: <i className="bi bi-building-fill"></i> },
    { label: 'Empleados', href: '/dashboard/administrator/employees', icon: <i className="bi bi-people-fill"></i>},
    { label: 'Onboarding', href: '/dashboard/administrator/employees/onboarding', icon: <i className="bi bi-person-walking"></i>},
    { label: 'Cursos', href: '/dashboard/administrator/admin/courses', icon: <i className="bi bi-mortarboard-fill"></i>  },
    { label: 'Documentos', href: '/dashboard/documents', icon: <i className="bi bi-file-earmark-text-fill"></i>  },
    { label: 'Servicios', href: '/dashboard/administrator/admin/services', icon: <i className="bi bi-suitcase-lg-fill"></i> }
  ],
  EMPLOYEE: [
    { label: 'Inicio', href: '/dashboard/employee', icon: <i className="bi bi-grid-fill"></i> },
    { label: 'Mis Cursos', href: '/dashboard/employee/courses', icon: <i className="bi bi-journal-bookmark-fill"></i> },
    { label: 'Documentos', href: '/dashboard/documents', icon: <i className="bi bi-folder2-open"></i> },
    { label: 'Servicios', href: '/dashboard/employee/services', icon: <i className="bi bi-briefcase-fill"></i> },
  ],
  PUBLIC: [
    { label: 'Panel', href: '/dashboard/public', icon: <i className="bi bi-grid-fill"></i> },
    { label: 'Cursos', href: '/dashboard/public/courses', icon: <i className="bi bi-journal-bookmark-fill"></i>  },
    { label: 'Servicios', href: '/dashboard/public/services', icon: <i className="bi bi-briefcase-fill"></i> },
  ],
};

const roleLabels = {
  GENERAL_ADMIN: 'Admin General',
  ADMIN: 'Administrador',
  EMPLOYEE: 'Empleado',
  PUBLIC: 'Usuario',
};

const roleColors = {
  GENERAL_ADMIN: 'bg-primary text-primary-foreground border-transparent', 
  ADMIN: 'bg-primary/20 text-primary border-primary/30', 
  EMPLOYEE: 'bg-secondary/20 text-secondary border-secondary/30', 
  PUBLIC: 'bg-muted text-muted-foreground border-border', 
};

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null); 
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
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
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
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

  const toggleTheme = () => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    setIsDark(!isDark);
  };

  const currentMenu = navItems[role] || [];
  
  const matchingItems = currentMenu.filter(item => 
    pathname === item.href || pathname.startsWith(`${item.href}/`)
  );

  const activeItem = matchingItems.reduce((prev, curr) => 
    (curr.href.length > prev.href.length ? curr : prev), 
    { href: '' }
  );

  // ── LÓGICA DE LOGO DE EMPRESA Y FALLBACK ──
  const companyData = user?.Company || user?.company;
  const companyLogoUrl = companyData?.logoUrl;
  const companyName = companyData?.name || "Atalayas";
  const defaultLogo = "/images/logo-atalayas.png";
  const displayLogo = companyLogoUrl ? (companyLogoUrl.startsWith('http') ? encodeURI(companyLogoUrl) : companyLogoUrl) : defaultLogo;

  return (
    <aside className={`${collapsed ? 'w-16 lg:w-16' : 'w-60'} transition-all duration-300 bg-card border-r border-border flex flex-col h-screen sticky top-0 left-0 z-20 shrink-0 font-sans`}>
      
      {/* ── RECUADRO BLANCO CON BORDES REDONDEADOS Y LÍNEA FINA ── */}
      <div className={`flex items-center justify-between border-b border-border transition-all duration-300 ${collapsed ? 'h-16 px-0 justify-center' : 'h-24 px-4 gap-3'}`}>
        {!collapsed ? (
          /* Aquí está el recuadro blanco que solicitaste */
          <div className="flex-1 w-full h-14 bg-white rounded-[20px] shadow-sm border border-gray-200/60 dark:border-white/10 flex items-center justify-center overflow-hidden p-2.5">
            <img
              src={displayLogo}
              alt={companyName}
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          /* Versión mínima para cuando se colapsa */
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 border border-gray-200/60 dark:border-white/10 overflow-hidden p-1.5">
              <span className="text-primary font-black text-lg tracking-tighter">
                {companyName.charAt(0).toUpperCase()}
              </span>
          </div>
        )}
        
        {!collapsed && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted flex shrink-0 items-center justify-center"
              title="Colapsar menú"
            >
              <i className="bi bi-text-indent-right text-lg"></i>
            </button>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto no-scrollbar">
        {collapsed && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-10 h-10 mx-auto text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted flex items-center justify-center mb-5"
              title="Expandir menú"
            >
              <i className="bi bi-list text-2xl"></i>
            </button>
        )}

        {currentMenu.map((item) => {
          const isActive = activeItem.href === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-r-xl transition-all font-bold text-[13px] border-l-4 ${
                isActive
                  ? 'bg-primary/5 text-primary border-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60 border-transparent'
              } ${collapsed ? 'justify-center rounded-xl border-none p-3 w-10 h-10 mx-auto' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <span className={`text-[19px] flex shrink-0 items-center justify-center ${collapsed ? '' : 'w-6'}`}>{item.icon}</span>
              {!collapsed && (
                <>
                  <span className="flex-1 truncate tracking-tight">{item.label}</span>
                  {item.label === 'Solicitudes' && pendingCount > 0 && (
                    <span className="bg-destructive text-destructive-foreground text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0">
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
        {mounted && user && (
          <Link href="/dashboard/profile" className="block w-full mb-3">
            <div className={`flex items-center gap-3 p-2 rounded-xl hover:bg-muted/70 transition-colors cursor-pointer group ${collapsed ? 'justify-center p-0' : ''}`}>
              <div className={`w-9 h-9 rounded-full overflow-hidden shrink-0 border-2 border-border group-hover:border-primary transition-colors ${collapsed ? 'w-11 h-11' : ''}`}>
                {user?.avatarUrl ? (
                  <img
                    src={encodeURI(user.avatarUrl)}
                    alt="Perfil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary text-sm font-extrabold">
                      {user?.name ? user.name.charAt(0).toUpperCase() : (user?.email?.[0]?.toUpperCase() || 'U')}
                    </span>
                  </div>
                )}
              </div>

              {!collapsed && (
                <div className="flex-1 min-w-0 flex flex-col items-start justify-center">
                  <p className="text-foreground text-[13px] font-bold truncate w-full group-hover:text-primary transition-colors tracking-tight">
                    {user?.name || (user?.email ? user.email.split('@')[0] : 'Usuario')}
                  </p>
                  <span className={`text-[8.5px] uppercase font-black px-2 py-0.5 mt-0.5 rounded-md border tracking-[0.2em] ${roleColors[role]}`}>
                    {roleLabels[role]}
                  </span>
                </div>
              )}
            </div>
          </Link>
        )}

        <div className={`space-y-1 ${collapsed ? 'flex flex-col gap-1 items-center' : ''}`}>
            <button
              onClick={toggleTheme}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all font-bold text-[13px] ${collapsed ? 'w-10 h-10 justify-center' : ''}`}
              title={collapsed ? (isDark ? "Modo Claro" : "Modo Oscuro") : undefined}
            >
              <span className="text-[19px] flex shrink-0 items-center justify-center w-6">
                <i className={`bi ${isDark ? 'bi-sun-fill text-amber-400' : 'bi-moon-stars-fill text-indigo-400'}`}></i>
              </span>
              {!collapsed && <span className="truncate flex-1 tracking-tight">{isDark ? 'Modo Claro' : 'Modo Oscuro'}</span>}
            </button>

            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all font-bold text-[13px] ${collapsed ? 'w-10 h-10 justify-center' : ''}`}
              title={collapsed ? "Cerrar sesión" : undefined}
            >
              <span className="text-[19px] flex shrink-0 items-center justify-center w-6"><i className="bi bi-box-arrow-right"></i></span>
              {!collapsed && <span className="truncate flex-1 tracking-tight">Cerrar sesión</span>}
            </button>
        </div>
      </div>
    </aside>
  );
}