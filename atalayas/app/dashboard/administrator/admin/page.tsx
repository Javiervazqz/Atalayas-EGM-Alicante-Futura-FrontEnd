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
    // ... (El código del fetch se mantiene exactamente igual)
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
          courses: Array.isArray(coursesData) ? coursesData.filter((c: any) => !c.isPublic).length : 0,
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
    { label: 'Empleados', value: stats.employees, icon: <i className="bi bi-people text-secondary"></i> },
    { label: 'Cursos activos', value: stats.courses, icon: <i className="bi bi-journal-bookmark text-primary"></i> },
    { label: 'Documentos', value: stats.documents, icon:  <i className="bi bi-folder2-open text-chart-3"></i> },
    { label: 'Progreso medio', value: `${stats.avgProgress}%`, icon: <i className="bi bi-graph-up-arrow text-chart-4"></i> },
  ];

  return (
    /* bg-background usará el color arena que pusiste en globals.css */
    <div className="flex min-h-screen bg-background" style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <Sidebar role="ADMIN" />

      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <div className="mb-6">
          {/* text-foreground usará el Teal oscuro */}
          <h1 className="text-2xl font-semibold text-foreground tracking-tight mb-1">Atalayas Hub</h1>
          <p className="text-muted-foreground text-sm">Panel de gestión y control de recursos</p>
        </div>

        {/* BANNER: Usa el Primary y Secondary del globals.css */}
        <div className="bg-primary rounded-2xl p-8 mb-8 shadow-md flex items-center gap-8 text-primary-foreground relative overflow-hidden">
          <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-secondary opacity-20 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="text-5xl text-secondary bg-background/10 p-5 rounded-2xl border border-background/20 backdrop-blur-sm z-10">
            <i className="bi bi-buildings"></i>
          </div>
          <div className="z-10">
            <h2 className="text-2xl font-semibold mb-2">¡Hola, Administrador!</h2>
            <p className="text-primary-foreground/80 text-sm mb-5 max-w-2xl leading-relaxed">
              Bienvenido al entorno digital de Atalayas Ciudad Empresarial 2025. Desde aquí podrás coordinar la formación de tu equipo y administrar la documentación corporativa.
            </p>
            <Link href="/dashboard/administrator/admin/courses" className="bg-secondary text-secondary-foreground px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm inline-flex items-center gap-2">
              Gestionar Cursos <i className="bi bi-arrow-right"></i>
            </Link>
          </div>
        </div>

        {/* TARJETAS DE ESTADÍSTICAS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {statCards.map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-medium text-muted-foreground">{stat.label}</div>
                <div className="text-lg bg-muted border border-border p-2 rounded-lg">{stat.icon}</div>
              </div>
              <div className="text-2xl font-semibold text-foreground tracking-tight">
                {loading ? <span className="animate-pulse text-muted-foreground/50">...</span> : stat.value}
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-foreground">Cursos de la empresa</h2>
              <Link href="/dashboard/administrator/admin/courses" className="text-secondary text-sm font-medium hover:underline transition-colors flex items-center gap-1">
                Ver todos <i className="bi bi-arrow-right-short text-lg"></i>
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-14 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-border rounded-xl bg-muted/50">
                <div className="text-3xl text-muted-foreground/50 mb-3"><i className="bi bi-journal-x"></i></div>
                <p className="text-muted-foreground text-sm font-medium mb-4">No hay cursos disponibles</p>
                <Link href="/dashboard/administrator/admin/courses/manage/new" className="bg-secondary text-secondary-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shadow-sm inline-block">
                  Crear primer curso
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {courses.slice(0, 5).map((course) => (
                  <div key={course.id} className="flex items-center justify-between p-3.5 bg-card border border-border rounded-xl hover:border-secondary/50 hover:shadow-sm transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-muted border border-border text-muted-foreground rounded-lg flex items-center justify-center group-hover:text-secondary group-hover:bg-secondary/10 transition-colors">
                        <i className="bi bi-journal-bookmark text-lg"></i>
                      </div>
                      <span className="text-foreground text-sm font-medium">{course.title}</span>
                    </div>
                    <span className={`text-[11px] px-3 py-1 rounded-full font-medium ${course.isPublic ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-muted text-muted-foreground border border-border'}`}>
                      {course.isPublic ? 'Público' : 'Privado'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-base font-semibold text-foreground mb-5">Acciones rápidas</h2>
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: 'Nuevo empleado', icon: <i className="bi bi-person-add"></i>, href: '/dashboard/admin/users/new' },
                { label: 'Nuevo curso', icon: <i className="bi bi-journal-plus"></i>, href: '/dashboard/administrator/admin/courses/new' },
                { label: 'Subir documento', icon: <i className="bi bi-cloud-arrow-up"></i>, href: '/dashboard/admin/documents/new' },
                { label: 'Ver informes', icon: <i className="bi bi-pie-chart"></i> , href: '/dashboard/admin/reports' },
              ].map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-4 p-3.5 bg-muted/50 border border-border rounded-xl hover:bg-card hover:border-secondary/50 hover:shadow-sm transition-all group"
                >
                  <div className="text-lg text-primary group-hover:text-secondary transition-colors">
                    {action.icon}
                  </div>
                  <span className="text-foreground text-sm font-medium transition-colors">{action.label}</span>
                  <i className="bi bi-chevron-right ml-auto text-xs text-muted-foreground group-hover:text-secondary transition-colors"></i>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}