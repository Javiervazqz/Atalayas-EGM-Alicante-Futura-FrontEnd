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
    { label: 'Documentos', href: '/dashboard/documents', icon: '📄' },
    { label: 'Servicios', href: '/dashboard/administrator/services', icon: '🔧' },
    { label: 'Anuncios', href: '/dashboard/administrator/announcements', icon: '📢' },
  ],
  ADMIN: [
    { label: 'Panel', href: '/dashboard/administrator/admin', icon: '⊞' },
    { label: 'Empleados', href: '/dashboard/administrator/employees', icon: '👥' },
    { label: 'Cursos', href: '/dashboard/administrator/courses', icon: '📚' },
    { label: 'Documentos', href: '/dashboard/documents', icon: '📄' },
    { label: 'Servicios', href: '/dashboard/administrator/services', icon: '🔧' }
  ],
  EMPLOYEE: [
    { label: 'Panel', href: '/dashboard/employee', icon: '⊞' },
    { label: 'Mis Cursos', href: '/dashboard/employee/courses', icon: '📚' },
    { label: 'Documentos', href: '/dashboard/documents', icon: '📄' },
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

// Colores actualizados al modo claro (fondos pastel, texto oscuro)
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

  const user = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('user') || '{}')
    : {};

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    // Fondo blanco con un borde lateral gris muy suave
    <aside className={`${collapsed ? 'w-16' : 'w-64'} transition-all duration-300 bg-white border-r border-gray-200 flex flex-col min-h-screen`}>
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1d1d1f] rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            {/* Texto oscuro */}
            <span className="text-[#1d1d1f] font-semibold text-sm">Atalayas</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-400 hover:text-[#1d1d1f] transition-colors p-1 rounded-lg hover:bg-gray-100"
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
                  // Estado activo: Azul de Apple con fondo azul súper clarito
                  ? 'bg-blue-50 text-[#0071e3] font-medium'
                  // Estado inactivo: Gris oscuro, al pasar el ratón se pone casi negro con fondo gris
                  : 'text-[#86868b] hover:text-[#1d1d1f] hover:bg-gray-100'
              }`}
            >
              <span className="text-base shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-gray-200">
        <div className={`flex items-center gap-3 px-3 py-2 rounded-xl ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
            <span className="text-[#0071e3] text-sm font-medium">
              {user.email?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              {/* Email oscuro */}
              <p className="text-[#1d1d1f] text-xs font-medium truncate">{user.email || 'Usuario'}</p>
              <div className="mt-0.5">
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${roleColors[role]}`}>
                  {roleLabels[role]}
                </span>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          // Botón de salir: Gris que se vuelve rojo suave al pasar el ratón
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[#86868b] hover:text-red-600 hover:bg-red-50 transition-all text-sm mt-1 ${collapsed ? 'justify-center' : ''}`}
        >
          <span>⎋</span>
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}