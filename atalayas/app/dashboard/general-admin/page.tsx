'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/ui/Sidebar';

export default function GeneralAdminDashboard() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${getToken()}` };
        const coursesRes = await fetch('http://localhost:3000/courses', { headers });
        const coursesData = await coursesRes.json();
        setCourses(Array.isArray(coursesData) ? coursesData : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const publicCourses = courses.filter(c => c.isPublic).length;
  const privateCourses = courses.filter(c => !c.isPublic).length;

  return (
    <div className="flex min-h-screen bg-[#0f1117]">
      <Sidebar role="GENERAL_ADMIN" />

      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-xs px-2 py-1 bg-purple-500/15 text-purple-400 rounded-lg">Admin General</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Panel general</h1>
          <p className="text-gray-500 text-sm">Gestión global del polígono industrial</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total cursos', value: courses.length, icon: '📚', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
            { label: 'Cursos públicos', value: publicCourses, icon: '🌐', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
            { label: 'Cursos privados', value: privateCourses, icon: '🔒', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
            { label: 'Empresas', value: '—', icon: '🏭', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-2xl border p-5 ${stat.color}`}>
              <div className="text-2xl mb-3">{stat.icon}</div>
              <div className="text-2xl font-bold text-white mb-1">{loading ? '...' : stat.value}</div>
              <div className="text-xs opacity-70">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Todos los cursos */}
          <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-semibold">Todos los cursos</h2>
              <a href="/dashboard/general-admin/courses" className="text-blue-400 text-sm hover:text-blue-300 transition-colors">
                Gestionar →
              </a>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : courses.length === 0 ? (
              <p className="text-gray-600 text-sm text-center py-8">No hay cursos todavía</p>
            ) : (
              <div className="space-y-2">
                {courses.slice(0, 6).map((course) => (
                  <div key={course.id} className="flex items-center justify-between p-3 bg-white/3 rounded-xl hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-blue-500/10 rounded-lg flex items-center justify-center">
                        <span className="text-blue-400 text-xs">📚</span>
                      </div>
                      <span className="text-white text-sm">{course.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-md ${course.isPublic ? 'bg-green-500/15 text-green-400' : 'bg-gray-500/10 text-gray-500'}`}>
                        {course.isPublic ? 'Público' : 'Privado'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Acciones rápidas */}
          <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-5">Acciones rápidas</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Nueva empresa', icon: '🏭', href: '/dashboard/general-admin/companies/new' },
                { label: 'Nuevo curso', icon: '📚', href: '/dashboard/general-admin/courses/new' },
                { label: 'Nuevo servicio', icon: '🔧', href: '/dashboard/general-admin/services/new' },
                { label: 'Nuevo anuncio', icon: '📢', href: '/dashboard/general-admin/announcements/new' },
                { label: 'Nuevo admin', icon: '👤', href: '/dashboard/general-admin/users/new' },
                { label: 'Ver informes', icon: '📊', href: '/dashboard/general-admin/reports' },
              ].map((action) => (
                <a
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-3 p-3 bg-white/3 border border-white/8 rounded-xl hover:bg-white/6 hover:border-white/15 transition-all"
                >
                  <span className="text-lg">{action.icon}</span>
                  <span className="text-gray-400 text-xs font-medium">{action.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
