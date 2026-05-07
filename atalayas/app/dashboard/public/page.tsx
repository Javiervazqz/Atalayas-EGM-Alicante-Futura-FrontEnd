'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import { API_ROUTES } from '@/lib/utils';
import Link from 'next/link';

interface Service {
  id: string;
  title: string;
  isPublic: boolean;
  serviceType: 'INFO' | 'BOOKING' | 'ANNOUNCEMENT';
  description?: string;
  mediaUrl?: string;
}

export default function PublicDashboard() {
  const [courses, setCourses] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
        const [coursesRes, servicesRes] = await Promise.all([
          fetch(API_ROUTES.COURSES.GET_ALL, { headers }),
          fetch(API_ROUTES.SERVICES.GET_ALL, { headers })
        ]);
        const coursesData = await coursesRes.json();
        const servicesData = await servicesRes.json();

        setCourses(Array.isArray(coursesData) ? coursesData : []);
        setServices(Array.isArray(servicesData) ? servicesData : []);
      } catch (err) {
        console.error("❌ Error fetch data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Separar anuncios de servicios normales
  const announcements = services.filter(s => s.serviceType === 'ANNOUNCEMENT').slice(0, 3);
  const otherServices = services.filter(s => s.serviceType !== 'ANNOUNCEMENT').slice(0, 6);

  return (
    <div className="flex min-h-screen bg-background font-sans">
      <Sidebar role="PUBLIC" />

      <main className="flex-1 p-8 lg:p-12 overflow-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-foreground tracking-tight mb-2">Bienvenido al polígono</h1>
          <p className="text-muted-foreground text-base">Explora los cursos y servicios disponibles</p>
        </div>

        {/* Cursos públicos */}
        <div className="bg-card border border-border rounded-2xl p-6 lg:p-8 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-foreground">Cursos disponibles</h2>
            <Link href="/dashboard/public/courses" className="text-secondary text-sm font-semibold hover:underline transition-colors">
              Ver todos <i className="bi bi-arrow-right-short text-lg"></i>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1,2,3].map(i => (
                <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-xl bg-muted/30">
              <p className="text-muted-foreground text-sm font-medium">No hay cursos públicos disponibles</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {courses.slice(0,3).map((course) => (
                <Link
                  key={course.id}
                  href={`/dashboard/public/courses/${course.id}`}
                  className="p-5 bg-background border border-border rounded-xl hover:border-secondary hover:shadow-md transition-all group"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-secondary/10 transition-colors">
                    <i className="bi bi-journal-bookmark text-primary group-hover:text-secondary text-lg"></i>
                  </div>
                  <h3 className="text-foreground text-sm font-semibold group-hover:text-secondary transition-colors mb-2">
                    {course.title}
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                    🌐 Curso público
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Servicios disponibles */}
        <div className="bg-card border border-border rounded-2xl p-6 lg:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-foreground">Servicios disponibles</h2>
            <Link href="/dashboard/public/services" className="text-secondary text-sm font-semibold hover:underline transition-colors">
              Ver todos <i className="bi bi-arrow-right-short text-lg"></i>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1,2,3].map(i => (
                <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          ) : services.length === 0 ? (
             <div className="text-center py-12 border border-dashed border-border rounded-xl bg-muted/30">
              <p className="text-muted-foreground text-sm font-medium">No hay servicios públicos disponibles</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {services.slice(0,3).map((service) => (
                <Link
                  key={service.id}
                  href={`/dashboard/public/services/${service.id}`}
                  className="p-5 bg-background border border-border rounded-xl hover:border-secondary hover:shadow-md transition-all group"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-secondary/10 transition-colors">
                    <i className="bi bi-briefcase text-primary group-hover:text-secondary text-lg"></i>
                  </div>
                  <h3 className="text-foreground text-sm font-semibold group-hover:text-secondary transition-colors mb-2">
                    {service.title}
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                    🌐 Servicio público
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        .content-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
        }

        @media (min-width: 1024px) {
          .content-layout {
            grid-template-columns: repeat(12, minmax(0, 1fr));
            gap: 40px;
          }
        }
      `}</style>
    </div>
  );
}