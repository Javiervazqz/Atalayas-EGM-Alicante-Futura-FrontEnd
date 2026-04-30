'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface SidebarProps {
  role: 'GENERAL_ADMIN' | 'ADMIN' | 'EMPLOYEE' | 'PUBLIC';
}

const navItems = {
  GENERAL_ADMIN: [
<<<<<<< Updated upstream
    { label: 'Panel', href: '/dashboard/general-admin', icon: '⊞' },
    { label: 'Empresas', href: '/dashboard/general-admin/companies', icon: '🏭' },
    { label: 'Usuarios', href: '/dashboard/general-admin/users', icon: '👥' },
    { label: 'Cursos', href: '/dashboard/general-admin/courses', icon: '📚' },
    { label: 'Servicios', href: '/dashboard/general-admin/services', icon: '🔧' },
    { label: 'Anuncios', href: '/dashboard/general-admin/announcements', icon: '📢' },
  ],
  ADMIN: [
    { label: 'Panel', href: '/dashboard/admin', icon: '⊞' },
    { label: 'Empleados', href: '/dashboard/admin/users', icon: '👥' },
    { label: 'Cursos', href: '/dashboard/admin/courses', icon: '📚' },
    { label: 'Documentos', href: '/dashboard/admin/documents', icon: '📄' },
=======
    { label: 'Panel', href: '/dashboard/administrator/general-admin', icon: <i className="bi bi-grid-fill"></i> },
    { label: 'Estadísticas Globales', href: '/dashboard/administrator/general-admin/stats', icon: <i className="bi bi-graph-up-arrow"></i> },
    { label: 'Perfil Empresa', href: '/dashboard/company', icon: <i className="bi bi-building-gear"></i> },
    { label: 'Empresas', href: '/dashboard/administrator/general-admin/companies', icon: <i className="bi bi-buildings-fill"></i> },
    { label: 'Usuarios', href: '/dashboard/administrator/employees', icon: <i className="bi bi-people-fill"></i>},
    { label: 'Cursos', href: '/dashboard/administrator/general-admin/courses/manage', icon: <i className="bi bi-journal-bookmark-fill"></i> },
    { label: 'Documentos', href: '/dashboard/documents', icon: <i className="bi bi-folder-fill"></i> },
    { label: 'Matriculación masiva', href: '/dashboard/administrator/bulk-enroll', icon: <i className="bi bi-person-lines-fill"></i> },
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
    { label: 'Cursos', href: '/dashboard/administrator/admin/courses/manage', icon: <i className="bi bi-mortarboard-fill"></i> },
    { label: 'Documentos', href: '/dashboard/documents', icon: <i className="bi bi-file-earmark-text-fill"></i> },
    { label: 'Matriculación masiva', href: '/dashboard/administrator/bulk-enroll', icon: <i className="bi bi-person-lines-fill"></i> },
    { label: 'Servicios', href: '/dashboard/administrator/admin/services', icon: <i className="bi bi-suitcase-lg-fill"></i> },
    { label: 'Anuncios', href: '/dashboard/administrator/admin/announcements', icon: <i className="bi bi-megaphone-fill"></i> },
    { label: 'Ecosistema', href: '/dashboard/administrator/admin/community', icon: <i className="bi bi-globe-americas"></i>},
    { label: 'Sugerencias', href: '/dashboard/administrator/admin/suggestions', icon: <i className="bi bi-mailbox"></i>},
>>>>>>> Stashed changes
  ],
  EMPLOYEE: [
    { label: 'Panel', href: '/dashboard/employee', icon: '⊞' },
    { label: 'Mis Cursos', href: '/dashboard/employee/courses', icon: '📚' },
    { label: 'Documentos', href: '/dashboard/employee/documents', icon: '📄' },
    { label: 'Servicios', href: '/dashboard/employee/services', icon: '🔧' },
  ],
  PUBLIC: [
    { label: 'Panel', href: '/dashboard/public', icon: '⊞' },
    { label: 'Cursos', href: '/dashboard/public/courses', icon: '📚' },
    { label: 'Servicios', href: '/dashboard/public/services', icon: '🔧' },
  ],
};

const roleLabels = {
  GENERAL_ADMIN: 'Admin General',
  ADMIN: 'Administrador',
  EMPLOYEE: 'Empleado',
  PUBLIC: 'Usuario',
};

const roleColors = {
  GENERAL_ADMIN: 'bg-purple-500/20 text-purple-300',
  ADMIN: 'bg-blue-500/20 text-blue-300',
  EMPLOYEE: 'bg-green-500/20 text-green-300',
  PUBLIC: 'bg-gray-500/20 text-gray-300',
};

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const user = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('user') || '{}')
    : {};

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-64'} transition-all duration-300 bg-[#13151f] border-r border-white/5 flex flex-col min-h-screen`}>
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-white font-semibold text-sm">Atalayas</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems[role].map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${
                isActive
                  ? 'bg-blue-500/15 text-blue-400 font-medium'
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="text-base shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-white/5">
        <div className={`flex items-center gap-3 px-3 py-2 rounded-xl ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center shrink-0">
            <span className="text-blue-400 text-sm font-medium">
              {user.email?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{user.email || 'Usuario'}</p>
              <span className={`text-xs px-1.5 py-0.5 rounded-md ${roleColors[role]}`}>
                {roleLabels[role]}
              </span>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-all text-sm mt-1 ${collapsed ? 'justify-center' : ''}`}
        >
          <span>⎋</span>
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}
