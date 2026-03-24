'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import Link from 'next/link';
import { API_ROUTES } from '@/lib/utils';

interface Stats {
  companies: number;
  users: number;
  courses: number;
  activeAnnouncements: number;
}

export default function GeneralAdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    companies: 0,
    users: 0,
    courses: 0,
    activeAnnouncements: 0
  });
  const [loading, setLoading] = useState(true);

  const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${getToken()}` };
        // Ajusta estas rutas según tu API real para General Admin
        const [companiesRes, usersRes, coursesRes, announcementsRes] = await Promise.all([
          fetch(API_ROUTES.COMPANIES?.GET_ALL || '', { headers }),
          fetch(API_ROUTES.USERS.GET_ALL, { headers }),
          fetch(API_ROUTES.COURSES.GET_ALL, { headers }),
          fetch(API_ROUTES.ANNOUNCEMENTS?.GET_ALL || '', { headers }),
        ]);

        const companiesData = await companiesRes.json();
        const usersData = await usersRes.json();
        const coursesData = await coursesRes.json();
        const announcementsData = await announcementsRes.json();

        setStats({
          companies: Array.isArray(companiesData) ? companiesData.length : 0,
          users: Array.isArray(usersData) ? usersData.length : 0,
          courses: Array.isArray(coursesData) ? coursesData.length : 0,
          activeAnnouncements: Array.isArray(announcementsData) ? announcementsData.length : 0,
        });
      } catch (err) {
        console.error("Error cargando datos de General Admin:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Mapeo de las tarjetas basado en tu navItems de GENERAL_ADMIN
  const statCards = [
    { label: 'Empresas', value: stats.companies, icon: 'bg-blue-50', dot: 'bg-blue-500', symbol: '🏭' },
    { label: 'Usuarios Totales', value: stats.users, icon: 'bg-indigo-50', dot: 'bg-indigo-500', symbol: '👥' },
    { label: 'Cursos Globales', value: stats.courses, icon: 'bg-violet-50', dot: 'bg-violet-500', symbol: '📚' },
    { label: 'Anuncios Activos', value: stats.activeAnnouncements, icon: 'bg-orange-50', dot: 'bg-orange-500', symbol: '📢' },
  ];

  return (
    <div className="flex min-h-screen bg-[#f5f5f7]" style={{ fontFamily: "'-apple-system', sans-serif" }}>
      {/* IMPORTANTE: Cambiamos el rol a GENERAL_ADMIN para que el Sidebar muestre el menú correcto */}
      <Sidebar role="GENERAL_ADMIN" />

      <main className="flex-1 p-10 overflow-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[#1d1d1f] tracking-tight mb-2">
            Panel de Control General
          </h1>
          <p className="text-[#86868b] text-base">
            Administración global del sistema y servicios
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {statCards.map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${stat.icon}`}>
                <span className="text-xl">{stat.symbol}</span>
              </div>
              <p className="text-[#1d1d1f] text-3xl font-bold tracking-tight mb-1">
                {loading ? '—' : stat.value}
              </p>
              <p className="text-[#86868b] text-sm font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Accesos Rápidos (Aquí incluimos Anuncios y Servicios) */}
          <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-200 lg:col-span-2">
            <h2 className="text-[#1d1d1f] text-lg font-semibold tracking-tight mb-6">Gestión del Sistema</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'Empresas', icon: '🏭', href: '/dashboard/general-admin/companies' },
                { label: 'Usuarios', icon: '👥', href: '/dashboard/general-admin/users' },
                { label: 'Cursos', icon: '📚', href: '/dashboard/general-admin/courses' },
                { label: 'Servicios', icon: '🔧', href: '/dashboard/general-admin/services' },
                { label: 'Anuncios', icon: '📢', href: '/dashboard/general-admin/announcements' },
                { label: 'Configuración', icon: '⚙️', href: '/dashboard/general-admin/settings' },
              ].map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex flex-col items-center gap-3 p-4 bg-[#f5f5f7] border border-transparent rounded-xl hover:bg-white hover:border-gray-200 hover:shadow-md transition-all text-center"
                >
                  <span className="text-2xl">{action.icon}</span>
                  <span className="text-[#1d1d1f] font-medium text-xs">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}