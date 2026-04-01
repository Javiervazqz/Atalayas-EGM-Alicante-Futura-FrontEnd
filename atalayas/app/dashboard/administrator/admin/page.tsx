'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import Link from 'next/link';
import { API_ROUTES } from '@/lib/utils';

interface Stats {
  employees: number;
  courses: number;
  documents: number;
  avgProgress: number;
}

interface Course {
  id: string;
  title: string;
  isPublic: boolean;
  _count?: { Enrollment: number };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ employees: 0, courses: 0, documents: 0, avgProgress: 0 });
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${getToken()}` };
        const [usersRes, coursesRes] = await Promise.all([
          fetch(API_ROUTES.USERS.GET_ALL, { headers }),
          fetch(API_ROUTES.COURSES.GET_ALL, { headers }),
        ]);

        const usersData = await usersRes.json();
        const coursesData = await coursesRes.json();

        setCourses(Array.isArray(coursesData) ? coursesData : []);
        setStats({
          employees: Array.isArray(usersData) ? usersData.filter((u: any) => u.role === 'EMPLOYEE').length : 0,
          courses: Array.isArray(coursesData) ? coursesData.length : 0,
          documents: 0,
          avgProgress: 0,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { label: 'Empleados', value: stats.employees, icon: '👥', color: 'blue' },
    { label: 'Cursos activos', value: stats.courses, icon: '📚', color: 'indigo' },
    { label: 'Documentos', value: stats.documents, icon: '📄', color: 'violet' },
    { label: 'Progreso medio', value: `${stats.avgProgress}%`, icon: '📈', color: 'cyan' },
  ];

  // Colores actualizados para el modo claro (fondos pastel, texto oscuro, bordes suaves)
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    violet: 'bg-violet-50 text-violet-700 border-violet-100',
    cyan: 'bg-cyan-50 text-cyan-700 border-cyan-100',
  };

  return (
    // Fondo general gris muy clarito (como en el login)
    <div className="flex min-h-screen bg-[#f5f5f7]" style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" }}>
      <Sidebar role="ADMIN" />

      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="mb-8">
          {/* Texto principal en gris muy oscuro casi negro */}
          <h1 className="text-2xl font-bold text-[#1d1d1f] mb-1">Panel de administración</h1>
          <p className="text-[#86868b] text-sm">Gestiona tu empresa y empleados</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat) => (
            <div key={stat.label} className={`rounded-2xl border p-5 ${colorMap[stat.color]}`}>
              <div className="text-2xl mb-3">{stat.icon}</div>
              <div className="text-2xl font-bold text-[#1d1d1f] mb-1">{loading ? '...' : stat.value}</div>
              <div className="text-xs font-medium opacity-80">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Cursos - Tarjeta blanca con sombra suave */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[#1d1d1f] font-semibold">Cursos de la empresa</h2>
              <Link href="/dashboard/administrator/admin/courses" className="text-[#0071e3] text-sm hover:text-blue-600 transition-colors">
                Ver todos →
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[#86868b] text-sm">No hay cursos todavía</p>
                <Link href="/dashboard/admin/courses/new" className="text-[#0071e3] text-sm mt-2 inline-block hover:text-blue-600">
                  Crear primer curso →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {courses.slice(0, 5).map((course) => (
                  // Elementos de la lista gris clarito que pasan a blanco al pasar el ratón
                  <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white border border-gray-200 shadow-sm rounded-lg flex items-center justify-center">
                        <span className="text-sm">📚</span>
                      </div>
                      <span className="text-[#1d1d1f] text-sm font-medium">{course.title}</span>
                    </div>
                    {/* Badges claros */}
                    <span className={`text-xs px-2 py-1 rounded-lg font-medium ${course.isPublic ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                      {course.isPublic ? 'Público' : 'Privado'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions - Tarjeta blanca */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-[#1d1d1f] font-semibold mb-5">Acciones rápidas</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Nuevo empleado', icon: '👤', href: '/dashboard/admin/users/new' },
                { label: 'Nuevo curso', icon: '📚', href: '/dashboard/administrator/admin/courses/new' },
                { label: 'Subir documento', icon: '📄', href: '/dashboard/admin/documents/new' },
                { label: 'Ver informes', icon: '📊', href: '/dashboard/admin/reports' },
              ].map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex flex-col items-center gap-2 p-4 bg-gray-50 border border-gray-200 rounded-xl hover:bg-white hover:border-gray-300 hover:shadow-sm transition-all text-center"
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