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
    { label: 'Empleados', value: stats.employees, icon: 'bg-blue-50', dot: 'bg-blue-500' },
    { label: 'Cursos activos', value: stats.courses, icon: 'bg-indigo-50', dot: 'bg-indigo-500' },
    { label: 'Documentos', value: stats.documents, icon: 'bg-violet-50', dot: 'bg-violet-500' },
    { label: 'Progreso medio', value: `${stats.avgProgress}%`, icon: 'bg-cyan-50', dot: 'bg-cyan-500' },
  ];

  return (
    <div 
      className="flex min-h-screen bg-[#f5f5f7]" 
      style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" }}
    >
      <Sidebar role="GENERAL_ADMIN" />

      <main className="flex-1 p-10 overflow-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[#1d1d1f] tracking-tight mb-2">
            Panel de administración
          </h1>
          <p className="text-[#86868b] text-base">
            Gestiona tu empresa y empleados
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {statCards.map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${stat.icon}`}>
                <div className={`w-4 h-4 rounded-full ${stat.dot} opacity-80`} />
              </div>
              <p className="text-[#1d1d1f] text-3xl font-bold tracking-tight mb-1">
                {loading ? '—' : stat.value}
              </p>
              <p className="text-[#86868b] text-sm font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Cursos */}
          <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[#1d1d1f] text-lg font-semibold tracking-tight">Cursos de la empresa</h2>
              <Link href="/dashboard/admin/courses" className="text-[#0071e3] text-sm hover:underline">
                Ver todos
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-14 bg-[#f5f5f7] rounded-xl animate-pulse" />
                ))}
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-[#86868b] text-sm mb-3">No hay cursos todavía</p>
                <Link href="/dashboard/admin/courses/new" className="inline-block text-[#0071e3] text-sm font-medium px-4 py-2 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors">
                  Crear primer curso
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {courses.slice(0, 5).map((course) => (
                  <div key={course.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#f5f5f7] hover:bg-gray-200 transition-colors group">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white border border-gray-200 text-lg">
                      📚
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#1d1d1f] text-sm font-medium truncate mb-0.5">
                        {course.title}
                      </p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-md font-medium shrink-0 ${course.isPublic ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-[#86868b]'}`}>
                      {course.isPublic ? 'Público' : 'Privado'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-200">
            <h2 className="text-[#1d1d1f] text-lg font-semibold tracking-tight mb-6">Acciones rápidas</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Nuevo empleado', icon: '👤', href: '/dashboard/admin/users/new' },
                { label: 'Nuevo curso', icon: '📚', href: '/dashboard/admin/courses/new' },
                { label: 'Subir documento', icon: '📄', href: '/dashboard/admin/documents/new' },
                { label: 'Ver informes', icon: '📊', href: '/dashboard/admin/reports' },
              ].map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex flex-col items-center gap-3 p-5 bg-[#f5f5f7] border border-transparent rounded-xl hover:bg-white hover:border-gray-200 hover:shadow-sm transition-all text-center"
                >
                  <span className="text-3xl mb-1">{action.icon}</span>
                  <span className="text-[#1d1d1f] font-medium text-sm">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}