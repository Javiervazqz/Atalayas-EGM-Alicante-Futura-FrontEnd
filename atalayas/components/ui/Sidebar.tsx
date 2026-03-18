'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface SidebarProps {
  role: 'GENERAL_ADMIN' | 'ADMIN' | 'EMPLOYEE' | 'PUBLIC';
}

const navItems = {
  GENERAL_ADMIN: [
    { label: 'Panel', href: '/dashboard/administrator/general-admin', icon: '⊞' },
    { label: 'Empresas', href: '/dashboard/administrator/companies', icon: '🏭' },
    { label: 'Usuarios', href: '/dashboard/administrator/employees', icon: '👥' },
    { label: 'Cursos', href: '/dashboard/administrator/courses', icon: '📚' },
    { label: 'Servicios', href: '/dashboard/administrator/services', icon: '🔧' },
    { label: 'Anuncios', href: '/dashboard/administrator/announcements', icon: '📢' },
  ],
  ADMIN: [
    { label: 'Panel', href: '/dashboard/administrator/admin', icon: '⊞' },
    { label: 'Empleados', href: '/dashboard/administrator/employees', icon: '👥' },
    { label: 'Cursos', href: '/dashboard/administrator/courses', icon: '📚' },
    { label: 'Documentos', href: '/dashboard/administrator/documents', icon: '📄' },
    { label: 'Servicios', href: '/dashboard/administrator/services', icon: '🔧' }
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
    <aside className={`${collapsed ? 'w-16' : 'w-64'} transition-all duration-300 bg-[#13151f] border-r border-white/5 flex flex-col h-screen sticky top-0 left-0`}>
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
              <p className="text-white text-xs font-medium truncate">{user.email ? user.email.split('@')[0].charAt(0).toUpperCase() + user.email.split('@')[0].slice(1).toLowerCase() : 'Usuario'}</p>
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
