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

  // 🎨 Actualizado a variables semánticas e iconos de Bootstrap
  const statCards = [
    { label: 'Empleados', value: stats.employees, icon: <i className="bi bi-people"></i>, theme: 'text-secondary bg-secondary/10' },
    { label: 'Cursos activos', value: stats.courses, icon: <i className="bi bi-journal-bookmark"></i>, theme: 'text-primary bg-primary/10' },
    { label: 'Documentos', value: stats.documents, icon: <i className="bi bi-folder2-open"></i>, theme: 'text-foreground bg-muted' },
    { label: 'Progreso medio', value: `${stats.avgProgress}%`, icon: <i className="bi bi-graph-up-arrow"></i>, theme: 'text-primary bg-primary/20 border border-primary/10' },
  ];

  return (
    <div className="flex min-h-screen bg-background font-sans">
      <Sidebar role="GENERAL_ADMIN" />

      <main className="flex-1 p-6 lg:p-10 overflow-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">
            Panel de administración
          </h1>
          <p className="text-muted-foreground text-base">
            Gestiona tu empresa y empleados de un vistazo
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => (
            <div key={stat.label} className="bg-card rounded-3xl p-6 shadow-sm border border-border hover:shadow-md transition-all duration-300">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4 ${stat.theme}`}>
                {stat.icon}
              </div>
              <p className="text-foreground text-3xl font-extrabold tracking-tight mb-1">
                {loading ? <span className="animate-pulse text-muted-foreground/30">—</span> : stat.value}
              </p>
              <p className="text-muted-foreground text-sm font-bold tracking-wide">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Cursos */}
          <div className="bg-card rounded-3xl p-8 shadow-sm border border-border flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-foreground text-xl font-bold tracking-tight">Cursos recientes</h2>
              <Link href="/dashboard/administrator/general-admin/courses" className="text-secondary text-sm font-bold hover:opacity-80 transition-opacity flex items-center gap-1">
                Ver todos <i className="bi bi-arrow-right-short text-xl"></i>
              </Link>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-muted/50 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : courses.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-10 border border-dashed border-border rounded-2xl bg-background/50">
                <div className="text-4xl text-muted-foreground/30 mb-3"><i className="bi bi-journal-x"></i></div>
                <p className="text-muted-foreground text-sm font-medium mb-4">No hay cursos todavía</p>
                <Link href="/dashboard/admin/courses/new" className="inline-block text-primary-foreground text-sm font-bold px-5 py-2.5 bg-primary rounded-xl hover:opacity-90 transition-opacity shadow-sm">
                  Crear primer curso
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {courses.slice(0, 5).map((course) => (
                  <div key={course.id} className="flex items-center gap-4 p-4 rounded-2xl bg-background border border-transparent hover:border-secondary hover:shadow-sm transition-all group cursor-default">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-primary/10 text-primary group-hover:bg-secondary/10 group-hover:text-secondary transition-colors text-lg">
                      <i className="bi bi-journal-bookmark"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground text-sm font-bold truncate mb-0.5 group-hover:text-secondary transition-colors">
                        {course.title}
                      </p>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shrink-0 ${course.isPublic ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      {course.isPublic ? 'Público' : 'Privado'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-card rounded-3xl p-8 shadow-sm border border-border">
            <h2 className="text-foreground text-xl font-bold tracking-tight mb-6">Acciones rápidas</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Nuevo empleado', icon: <i className="bi bi-person-add"></i>, href: '/dashboard/admin/users/new' },
                { label: 'Nuevo curso', icon: <i className="bi bi-journal-plus"></i>, href: '/dashboard/admin/courses/new' },
                { label: 'Subir documento', icon: <i className="bi bi-file-earmark-arrow-up"></i>, href: '/dashboard/admin/documents/new' },
                { label: 'Ver informes', icon: <i className="bi bi-pie-chart"></i>, href: '/dashboard/admin/reports' },
              ].map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex flex-col items-center justify-center gap-3 p-6 bg-background border border-border rounded-2xl hover:border-secondary hover:shadow-md transition-all text-center group active:scale-95"
                >
                  <span className="text-3xl text-primary group-hover:text-secondary transition-colors">{action.icon}</span>
                  <span className="text-foreground font-bold text-sm group-hover:text-secondary transition-colors">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}