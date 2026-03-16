'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/ui/Sidebar';
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
          fetch('http://localhost:3000/users', { headers }),
          fetch('http://localhost:3000/courses', { headers }),
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

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  };

  return (
    <div className="flex min-h-screen bg-[#0f1117]">
      <Sidebar role="ADMIN" />

      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Panel de administración</h1>
          <p className="text-gray-500 text-sm">Gestiona tu empresa y empleados</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat) => (
            <div key={stat.label} className={`rounded-2xl border p-5 ${colorMap[stat.color]}`}>
              <div className="text-2xl mb-3">{stat.icon}</div>
              <div className="text-2xl font-bold text-white mb-1">{loading ? '...' : stat.value}</div>
              <div className="text-xs opacity-70">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Cursos */}
          <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-semibold">Cursos de la empresa</h2>
              <a href="/dashboard/admin/courses" className="text-blue-400 text-sm hover:text-blue-300 transition-colors">
                Ver todos →
              </a>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 text-sm">No hay cursos todavía</p>
                <a href="/dashboard/admin/courses" className="text-blue-400 text-sm mt-2 inline-block hover:text-blue-300">
                  Crear primer curso →
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                {courses.slice(0, 5).map((course) => (
                  <div key={course.id} className="flex items-center justify-between p-3 bg-white/3 rounded-xl hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500/15 rounded-lg flex items-center justify-center">
                        <span className="text-blue-400 text-sm">📚</span>
                      </div>
                      <span className="text-white text-sm font-medium">{course.title}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-lg ${course.isPublic ? 'bg-green-500/15 text-green-400' : 'bg-gray-500/15 text-gray-400'}`}>
                      {course.isPublic ? 'Público' : 'Privado'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-5">Acciones rápidas</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Nuevo empleado', icon: '👤', href: '/dashboard/admin/users/new', color: 'blue' },
                { label: 'Nuevo curso', icon: '📚', href: '/dashboard/admin/courses/new', color: 'indigo' },
                { label: 'Subir documento', icon: '📄', href: '/dashboard/admin/documents/new', color: 'violet' },
                { label: 'Ver informes', icon: '📊', href: '/dashboard/admin/reports', color: 'cyan' },
              ].map((action) => (
                <a
                  key={action.label}
                  href={action.href}
                  className="flex flex-col items-center gap-2 p-4 bg-white/3 border border-white/8 rounded-xl hover:bg-white/6 hover:border-white/15 transition-all text-center"
                >
                  <span className="text-2xl">{action.icon}</span>
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
