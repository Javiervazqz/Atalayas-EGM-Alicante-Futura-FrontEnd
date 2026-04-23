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
    { label: 'Cursos', href: '/dashboard/administrator/general-admin/courses', icon: <i className="bi bi-journal-bookmark-fill"></i> },
    { label: 'Documentos', href: '/dashboard/documents', icon: <i className="bi bi-folder2-open"></i> },
    { label: 'Servicios', href: '/dashboard/administrator/general-admin/services', icon: <i className="bi bi-briefcase-fill"></i> },
    { label: 'Anuncios', href: '/dashboard/administrator/general-admin/announcements', icon: <i className="bi bi-megaphone-fill"></i> },
    { label: 'Ecosistema', href: '/dashboard/administrator/general-admin/community', icon: <i className="bi bi-globe-americas"></i>},
    { label: 'Solicitudes', href: '/dashboard/administrator/general-admin/company-request', icon: <i className="bi bi-envelope-open-fill "></i> },
    { label: 'Sugerencias', href: '/dashboard/administrator/general-admin/suggestions', icon: <i className="bi bi-mailbox2"></i>},
  ],
  ADMIN: [
    { label: 'Panel', href: '/dashboard/administrator/admin', icon: <i className="bi bi-house-fill"></i> },
    { label: 'Mi Empresa', href: '/dashboard/administrator/admin/company', icon: <i className="bi bi-building-fill"></i> },
    { label: 'Empleados', href: '/dashboard/administrator/employees', icon: <i className="bi bi-people-fill"></i>},
    { label: 'Onboarding', href: '/dashboard/administrator/employees/onboarding', icon: <i className="bi bi-person-walking"></i>},
    { label: 'Cursos', href: '/dashboard/administrator/admin/courses', icon: <i className="bi bi-mortarboard-fill"></i> },
    { label: 'Documentos', href: '/dashboard/documents', icon: <i className="bi bi-file-earmark-text-fill"></i> },
    { label: 'Servicios', href: '/dashboard/administrator/admin/services', icon: <i className="bi bi-suitcase-lg-fill"></i> },
    { label: 'Anuncios', href: '/dashboard/administrator/admin/announcements', icon: <i className="bi bi-megaphone-fill"></i> },
    { label: 'Ecosistema', href: '/dashboard/administrator/admin/community', icon: <i className="bi bi-globe-americas"></i>},
    { label: 'Sugerencias', href: '/dashboard/administrator/admin/suggestions', icon: <i className="bi bi-mailbox"></i>},
  ],
  EMPLOYEE: [
    { label: 'Panel', href: '/dashboard/employee', icon: <i className="bi bi-grid-fill"></i> },
    { label: 'Mis Cursos', href: '/dashboard/employee/courses', icon: <i className="bi bi-journal-bookmark-fill"></i> },
    { label: 'Documentos', href: '/dashboard/documents', icon: <i className="bi bi-folder-fill"></i> },
    { label: 'Servicios', href: '/dashboard/employee/services', icon: <i className="bi bi-briefcase-fill"></i> },
    { label: 'Anuncios', href: '/dashboard/employee/announcements', icon: <i className="bi bi-megaphone-fill "></i> },
    { label: 'Ecosistema', href: '/dashboard/employee/community', icon: <i className="bi bi-globe-americas"></i>},
    { label: 'Sugerencias', href: '/dashboard/employee/suggestions', icon: <i className="bi bi-mailbox2"></i>},
  ],
  PUBLIC: [
    { label: 'Panel', href: '/dashboard/public', icon: <i className="bi bi-grid-fill"></i> },
    { label: 'Cursos', href: '/dashboard/public/courses', icon: <i className="bi bi-journal-bookmark-fill"></i> },
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  
  const [user, setUser] = useState<any>(null);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [pendingSuggestionsCount, setPendingSuggestionsCount] = useState(0);

  useEffect(() => {
    // Cargar Usuario
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
    
    // Cargar Tema desde Cookie (para sincronizar con Welcome)
    const savedTheme = document.cookie.split('; ').find(row => row.startsWith('theme='))?.split('=')[1];
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const initialTheme = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDark(initialTheme);
    
    if (initialTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    setMounted(true);

    const checkResizing = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener('resize', checkResizing);
    return () => window.removeEventListener('resize', checkResizing);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const updateCounts = () => {
      setPendingSuggestionsCount(Number(localStorage.getItem('count_suggestions')) || 0);
      setPendingRequestsCount(Number(localStorage.getItem('count_requests')) || 0);
    };
    window.addEventListener('local-storage-update', updateCounts);
    updateCounts();
    return () => window.removeEventListener('local-storage-update', updateCounts);
  }, [mounted]);

  const toggleTheme = () => {
    const root = document.documentElement;
    const newTheme = !isDark;
    
    if (newTheme) {
      root.classList.add('dark');
      document.cookie = "theme=dark; path=/; max-age=31536000";
    } else {
      root.classList.remove('dark');
      document.cookie = "theme=light; path=/; max-age=31536000";
    }
    setIsDark(newTheme);
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  // FUNCIÓN DE ACTIVACIÓN MEJORADA
  const checkActive = (href: string) => {
    // 1. Coincidencia exacta (Prioridad máxima)
    if (pathname === href) return true;

    // 2. Excepción para los Paneles de cada rol
    // Evitamos que /admin/company active el botón de /admin
    const isBasePanel = href.endsWith('/admin') || 
                        href.endsWith('/general-admin') || 
                        href.endsWith('/employee') || 
                        href.endsWith('/public');
    
    if (isBasePanel) return pathname === href;

    // 3. Excepción para Onboarding (evita activar Empleados)
    if (href === '/dashboard/administrator/employees' && pathname.includes('/onboarding')) {
      return false;
    }

    // 4. Coincidencia de sub-rutas para el resto de items (Cursos, Servicios, etc.)
    return href !== '/dashboard' && pathname.startsWith(href + '/');
  };

  if (!mounted) return null;

  const currentMenu = navItems[role] || [];
  const companyData = user?.Company || user?.company;
  const displayLogo = user.company?.logoUrl || "/images/logo-atalayas.png";

  return (
    <>
      {!mobileOpen && (
        <button 
          onClick={() => setMobileOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-9999 w-12 h-12 bg-white dark:bg-card border border-border shadow-xl rounded-2xl flex items-center justify-center text-primary transition-all active:scale-90"
        >
          <i className="bi bi-list text-2xl"></i>
        </button>
      )}

      <div 
        className={`fixed inset-0 bg-background/60 backdrop-blur-sm z-10000 lg:hidden transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileOpen(false)}
      />

      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen bg-card border-r border-border flex flex-col transition-all duration-300 z-10001
        ${mobileOpen ? 'translate-x-0 w-70' : '-translate-x-full lg:translate-x-0'}
        ${collapsed ? 'lg:w-20' : 'lg:w-64'}
      `}>
        
        <div className={`flex items-center justify-between border-b border-border transition-all duration-300 ${collapsed ? 'h-20 px-0 justify-center' : 'h-24 px-4 gap-3'}`}>
          <div className={`
            bg-white rounded-[18px] shadow-sm border border-gray-200/60 dark:border-white/10 flex items-center justify-center overflow-hidden transition-all
            ${collapsed ? 'w-12 h-12 p-1.5' : 'flex-1 h-14 p-2.5'}
          `}>
            <img src={displayLogo} alt="Logo" className="max-w-full max-h-full object-contain" />
          </div>
          
          {!collapsed && (
            <button onClick={() => setCollapsed(true)} className="hidden lg:flex text-muted-foreground p-2 rounded-lg hover:bg-muted transition-colors">
              <i className="bi bi-text-indent-right text-lg"></i>
            </button>
          )}

          <button onClick={() => setMobileOpen(false)} className="lg:hidden text-muted-foreground p-2 mr-2">
            <i className="bi bi-x-lg text-xl"></i>
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto no-scrollbar">
          {collapsed && (
              <button onClick={() => setCollapsed(false)} className="hidden lg:flex w-12 h-12 mx-auto text-muted-foreground rounded-xl hover:bg-muted items-center justify-center mb-4">
                <i className="bi bi-text-indent-left text-xl"></i>
              </button>
          )}

          {currentMenu.map((item) => {
            const isActive = checkActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-[13px] relative group
                  ${isActive ? 'bg-primary/10 text-primary shadow-sm' : 'text-muted-foreground hover:bg-muted/80'}
                  ${collapsed ? 'justify-center w-12 h-12 mx-auto px-0' : ''}
                `}
              >
                <span className={`text-xl transition-transform group-hover:scale-110 ${isActive ? 'text-primary' : ''}`}>
                  {item.icon}
                </span>
                {!collapsed && <span className="flex-1 truncate tracking-tight">{item.label}</span>}

                {item.label === 'Solicitudes' && pendingRequestsCount > 0 && !collapsed && (
                   <span className="bg-destructive text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{pendingRequestsCount}</span>
                )}
                {item.label === 'Sugerencias' && pendingSuggestionsCount > 0 && !collapsed && (
                   <span className="bg-destructive text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{pendingSuggestionsCount}</span>
                )}
                {collapsed && (pendingRequestsCount > 0 || pendingSuggestionsCount > 0) && (
                   <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-card"></span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border bg-card space-y-2">
          <Link href="/dashboard/profile" onClick={() => setMobileOpen(false)} className="block w-full mb-2">
            <div className={`flex items-center gap-3 p-2 rounded-2xl hover:bg-muted/70 transition-all ${collapsed ? 'justify-center p-0' : ''}`}>
               <div className={`rounded-full overflow-hidden shrink-0 border-2 border-border ${collapsed ? 'w-10 h-10' : 'w-9 h-9'}`}>
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Perfil" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary text-xs font-black">{user?.name?.charAt(0)}</span>
                    </div>
                  )}
               </div>
               {!collapsed && (
                 <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold truncate text-foreground">{user?.name}</p>
                    <span className={`text-[8px] uppercase font-black px-1.5 py-0.5 rounded border ${roleColors[role]}`}>{roleLabels[role]}</span>
                 </div>
               )}
            </div>
          </Link>

          <div className="space-y-1">
            <button 
              onClick={toggleTheme} 
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-muted font-bold text-[13px] transition-all ${collapsed ? 'justify-center' : ''}`}
            >
              <span className="text-lg w-6 flex justify-center">
                <i className={`bi ${isDark ? 'bi-sun-fill text-amber-400' : 'bi-moon-stars-fill text-indigo-400'}`}></i>
              </span>
              {!collapsed && <span>{isDark ? 'Modo Claro' : 'Modo Oscuro'}</span>}
            </button>

            <button 
              onClick={handleLogout} 
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 font-bold text-[13px] transition-all ${collapsed ? 'justify-center' : ''}`}
            >
              <span className="text-lg w-6 flex justify-center">
                <i className="bi bi-box-arrow-right"></i>
              </span>
              {!collapsed && <span>Cerrar sesión</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}