'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import { API_ROUTES } from '@/lib/utils';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';


export default function EmployeeCoursesPage() {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState<'TODOS' | 'BASICO' | 'ESPECIALIZADO'>('TODOS');
    const [userName, setUserName] = useState('');
      const searchParams = useSearchParams();
  const fromTaskId = searchParams.get('fromTask');

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                setUserName(user.name?.split(' ')[0] || 'Usuario');
            } catch (err) { console.error(err); }
        }

        const fetchCourses = async () => {
            try {
                const res = await fetch(API_ROUTES.COURSES.GET_ALL, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                const data = await res.json();
                const sortedDataCourses = data.sort((a: any, b: any) => {
            // Quitamos espacios en blanco al principio/final para comparar limpio
            const titleA = a.title.trim().toLowerCase();
            const titleB = b.title.trim().toLowerCase();

            return titleA.localeCompare(titleB, undefined, {
              numeric: true,
              sensitivity: "base",
            });
          });
                setCourses(Array.isArray(sortedDataCourses) ? data : (data.courses || []));
            } catch (err) { console.error(err); } 
            finally { setLoading(false); }
        };
        fetchCourses();
    }, []);

    useEffect(() => {
    const autoConfirmTask = async () => {
      if (fromTaskId) {
        try {
          const token = localStorage.getItem("token");
          await fetch(API_ROUTES.ONBOARDING.TOGGLE, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ taskId: fromTaskId, done: true }),
          });
          console.log("Tarea de onboarding completada automáticamente");
        } catch (err) {
          console.error("Error al autocompletar:", err);
        }
      }
    };

    autoConfirmTask();
  }, [fromTaskId]);

    const filtered = courses.filter(c => {
        if (selectedTab === 'TODOS') return true;
        return selectedTab === 'BASICO' 
            ? c.category?.toUpperCase() !== 'ESPECIALIZADO'
            : c.category?.toUpperCase() === 'ESPECIALIZADO';
    });

    return (
        <div className="flex min-h-screen bg-[#f5f5f7]" style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" }}>
            <Sidebar role="EMPLOYEE" />

            <main className="flex-1 h-screen overflow-y-auto">
                <div className='max-w-6xl mx-auto px-8 py-12'>
                    
                    {/* BANNER COMPACTO */}
                    <header className="relative overflow-hidden bg-white rounded-[2rem] p-8 mb-8 border border-gray-100 shadow-sm flex items-center justify-between">
                        <div className="relative z-10">
                            <h1 className="text-3xl font-bold text-[#1d1d1f] tracking-tight mb-1">
                                Cursos disponibles
                            </h1>
                            <p className="text-gray-500 text-sm font-medium">
                                Gestiona tus cursos de onboarding y especialización.
                            </p>
                        </div>
                        <div className="text-4xl bg-gray-50 w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner">
                            <i className="bi bi-mortarboard-fill text-blue-500"></i>
                        </div>
                    </header>

                    {/* Filtros tipo Pill (Botones) */}
                    <div className="flex gap-3 mb-10 overflow-x-auto no-scrollbar">
                        {['TODOS', 'BASICO', 'ESPECIALIZADO'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setSelectedTab(tab as any)}
                                className={`relative px-6 py-2 rounded-full text-sm font-bold transition-all ${
                                    selectedTab === tab 
                                    ? 'text-white' 
                                    : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                <span className="relative z-10">
                                    {tab === 'TODOS' ? 'Todos' : tab === 'BASICO' ? 'Onboarding' : 'Especialización'}
                                </span>
                                {selectedTab === tab && (
                                    <motion.div 
                                        layoutId="activeTabCourses"
                                        className="absolute inset-0 bg-blue-600 rounded-full"
                                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-3xl" />)}
                        </div>
                    ) : (
                        <motion.div 
                            layout 
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        >
                            <AnimatePresence mode="popLayout">
                                {filtered.map((course) => (
                                    <motion.div
                                        key={course.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                                        className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow group"
                                    >
                                        <div>
                                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
                                                {course.category?.toUpperCase() === 'ESPECIALIZADO' ? '🎓' : '📖'}
                                            </div>
                                            <h3 className="font-bold text-lg text-[#1d1d1f] mb-2 line-clamp-2 h-14">
                                                {course.title}
                                            </h3>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 bg-blue-50 px-2 py-0.5 rounded">
                                                {course.category || 'General'}
                                            </span>
                                        </div>

                                        <Link
                                            href={`/dashboard/employee/courses/${course.id}`}
                                            className="mt-6 w-full py-3 bg-[#f5f5f7] text-[#1d1d1f] font-bold rounded-xl text-xs text-center hover:bg-blue-600 hover:text-white transition-all active:scale-[0.98]"
                                        >
                                            Explorar curso
                                        </Link>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </div>
            </main>
        </div>
    );
}