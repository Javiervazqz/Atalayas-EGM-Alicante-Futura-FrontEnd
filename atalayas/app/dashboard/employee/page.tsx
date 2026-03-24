'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
// 1. Importamos el Sidebar que ya teníamos creado
import Sidebar from '@/components/ui/Sidebar';
// 2. Importamos nuestras rutas centralizadas
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

export default function EmployeeDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  // Nota: Por ahora enrollments está vacío hasta que conectes el endpoint correspondiente
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${getToken()}` };
        // Usamos API_ROUTES en lugar de la URL quemada
        const coursesRes = await fetch(API_ROUTES.COURSES.GET_ALL, { headers });
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

  const completedCourses = enrollments.filter(e => e.progress === 100).length;
  const inProgressCourses = enrollments.filter(e => e.progress > 0 && e.progress < 100).length;

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
          <h1 className="text-3xl font-bold text-[#1d1d1f] tracking-tight mb-2">
            Buenos días
          </h1>
          <p className="text-[#86868b] text-base">
            Consulta tus cursos y tu progreso de formación
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
              <Link href="/dashboard/courses" className="text-[#0071e3] text-sm hover:underline">
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

          {/* Mi progreso */}
          <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-200">
            <h2 className="text-[#1d1d1f] text-lg font-semibold tracking-tight mb-6">Mi progreso</h2>

            {enrollments.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 bg-[#f5f5f7] rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
                  🎯
                </div>
                <p className="text-[#1d1d1f] text-sm font-medium mb-1">Sin matrículas activas</p>
                <p className="text-[#86868b] text-sm mb-5">Empieza un curso para ver tu progreso aquí</p>
                <Link href="/dashboard/employee/courses" className="inline-block text-[#0071e3] text-sm font-medium px-5 py-2 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors">
                  Explorar cursos
                </Link>
              </div>
            ) : (
              <div className="space-y-5">
                {enrollments.map((enrollment) => (
                  <div key={enrollment.id}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[#1d1d1f] text-sm font-medium">{enrollment.Course.title}</span>
                      <span className="text-[#86868b] text-sm">{enrollment.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#f5f5f7] rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${enrollment.progress === 100 ? 'bg-green-500' : 'bg-[#0071e3]'}`}
                        style={{ width: `${enrollment.progress}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}