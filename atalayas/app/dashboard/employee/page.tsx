'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/ui/Sidebar';
import { API_ROUTES } from '@/lib/utils';

interface Course {
  id: string;
  title: string;
  isPublic: boolean;
}

interface Enrollment {
  id: string;
  progress: number;
  Course: Course;
}

interface Service {
  id: string;
  title: string;
  isPublic: boolean;
  serviceType: 'INFO' | 'BOOKING' | 'ANNOUNCEMENT';
  description?: string;
  mediaUrl?: string;
}

interface UserData {
  email?: string;
  name?: string;
}

export default function EmployeeDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [user, setUser] = useState<UserData | null>(null);

  const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    const fetchData = async () => {
      setLoading(true);
      try {
        const headers = { 
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        };

        // Ejecutamos ambas peticiones en paralelo para ganar velocidad
        const [coursesRes, servicesRes] = await Promise.all([
          fetch(API_ROUTES.COURSES.GET_ALL, { headers }),
          fetch(API_ROUTES.SERVICES.GET_ALL, { headers })
        ]);

        const coursesData = await coursesRes.json();
        const servicesData = await servicesRes.json();

        // Validamos que la respuesta sea exitosa y sea un array
        setCourses(Array.isArray(coursesData) ? coursesData : []);
        setServices(Array.isArray(servicesData) ? servicesData : []);

      } catch (err) {
        console.error("Error cargando el Dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const completedCourses = enrollments.filter(e => e.progress === 100).length;
  const inProgressCourses = enrollments.filter(e => e.progress > 0 && e.progress < 100).length;

    const userName = user?.email?.split('@')[0];
    const formattedName = userName 
    ? userName.charAt(0).toUpperCase() + userName.slice(1).toLowerCase() 
    : 'Usuario';
  
  return (
    <div 
      className="flex min-h-screen bg-[#f5f5f7]" 
      style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" }}
    >
      {/* 3. Usamos el componente Sidebar pasándole el rol de empleado */}
      <Sidebar role="EMPLOYEE" />

      <main className="flex-1 p-10 overflow-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl text-[#1d1d1f] tracking-tight mb-2">
            <span className="font-normal text-[#86868b]">¡Bienvenido,</span> 
            <span className="font-bold"> {formattedName}!</span>
          </h1>
          <p className="text-[#86868b] text-base">
            Consulta tus cursos, servicios y tu progreso de formación
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {[
            { label: 'Cursos disponibles', value: courses.length, sub: 'para ti', dot: 'bg-blue-500', iconBg: 'bg-blue-50' },
            { label: 'En progreso', value: inProgressCourses, sub: 'cursos activos', dot: 'bg-orange-500', iconBg: 'bg-orange-50' },
            { label: 'Completados', value: completedCourses, sub: 'cursos terminados', dot: 'bg-green-500', iconBg: 'bg-green-50' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${stat.iconBg}`}>
                <div className={`w-4 h-4 rounded-full ${stat.dot} opacity-80`} />
              </div>
              <p className="text-[#1d1d1f] text-3xl font-bold tracking-tight mb-1">
                {loading ? '—' : stat.value}
              </p>
              <p className="text-[#1d1d1f] text-sm font-medium mb-1">{stat.label}</p>
              <p className="text-[#86868b] text-xs">{stat.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Cursos disponibles */}
          <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[#1d1d1f] text-lg font-semibold tracking-tight">Cursos disponibles</h2>
              <Link href="/dashboard/employee/courses" className="text-[#0071e3] text-sm hover:underline">
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
                <p className="text-[#86868b] text-sm">No hay cursos disponibles</p>
              </div>
            ) : (
              <div className="space-y-2">
                {courses.slice(0, 5).map((course) => (
                  <Link key={course.id} href={`/dashboard/employee/courses/${course.id}`}>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#f5f5f7] hover:bg-gray-200 transition-colors cursor-pointer group">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg ${course.isPublic ? 'bg-green-100' : 'bg-blue-100'}`}>
                        📚
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#1d1d1f] text-sm font-medium truncate mb-0.5">
                          {course.title}
                        </p>
                        <p className={`text-xs ${course.isPublic ? 'text-green-600' : 'text-[#86868b]'}`}>
                          {course.isPublic ? 'Público' : 'Tu empresa'}
                        </p>
                      </div>
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="text-gray-400 group-hover:text-gray-600 transition-colors shrink-0">
                        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

        {/* Sección de Servicios */}
        <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[#1d1d1f] text-lg font-semibold tracking-tight">Servicios disponibles</h2>
            <Link href="/dashboard/employee/services" className="text-[#0071e3] text-sm hover:underline">
              Ver todos
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-14 bg-[#f5f5f7] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-[#86868b] text-sm">No hay servicios disponibles</p>
            </div>
          ) : (
            <div className="space-y-2">
              {services.slice(0, 5).map((service) => {
                // Lógica para iconos y colores según el tipo
                const getServiceDetails = (type: string) => {
                  switch (type) {
                    case 'INFO':
                      return { icon: 'ℹ️', label: 'Información', color: 'bg-blue-50 text-blue-600' };
                    case 'BOOKING':
                      return { icon: '📅', label: 'Reserva', color: 'bg-purple-50 text-purple-600' };
                    case 'ANNOUNCEMENT':
                      return { icon: '📢', label: 'Aviso', color: 'bg-orange-50 text-orange-600' };
                    default:
                      return { icon: '📄', label: 'Servicio', color: 'bg-gray-50 text-gray-600' };
                  }
                };

                const details = getServiceDetails(service.serviceType);

                return (
                  <Link key={service.id} href={`/dashboard/employee/services/${service.id}`}>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#f5f5f7] hover:bg-gray-200 transition-colors cursor-pointer group">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg ${details.color}`}>
                        {details.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-[#1d1d1f] text-sm font-medium truncate mb-0.5">
                          {service.title}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${details.color} bg-white border border-current opacity-80`}>
                            {details.label}
                          </span>
                          <p className={`text-[10px] ${service.isPublic ? 'text-green-600' : 'text-[#86868b]'}`}>
                            {service.isPublic ? 'Público' : 'Empresa'}
                          </p>
                        </div>
                      </div>

                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="text-gray-400 group-hover:text-gray-600 transition-colors shrink-0">
                        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
        </div>
      </main>
    </div>
  );
}