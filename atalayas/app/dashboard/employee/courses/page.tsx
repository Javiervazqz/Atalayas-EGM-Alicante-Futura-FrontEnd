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
        <div className="flex min-h-screen bg-background font-sans">
            <Sidebar role="EMPLOYEE" />

            <main className="flex-1 p-6 lg:p-10 overflow-auto">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-foreground tracking-tight mb-2">Mi Formación</h1>
                    <p className="text-muted-foreground text-base">Accede a tus contenidos y material de estudio.</p>
                </div>

                {/* Tabs Consistentes */}
                <div className="flex gap-8 border-b border-border mb-8 overflow-x-auto no-scrollbar">
                    {['BASICO', 'ESPECIALIZADO'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`pb-4 text-sm font-semibold cursor-pointer transition-all whitespace-nowrap ${activeTab === tab ? 'border-b-2 border-secondary text-secondary' : 'text-muted-foreground hover:text-foreground'
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {loading ? [1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-card rounded-3xl animate-pulse border border-border" />)
                        : filtered.length === 0 ? (
                           <div className="col-span-full text-center py-20 bg-card rounded-3xl border border-dashed border-border">
                                <span className="text-4xl text-muted-foreground/50 mb-4 block"><i className="bi bi-journal-x"></i></span>
                                <p className="text-muted-foreground font-medium">No hay cursos en esta categoría.</p>
                            </div> 
                        ) : filtered.map((course) => (
                            <div key={course.id} className="bg-card rounded-3xl p-6 shadow-sm border border-border flex flex-col justify-between group hover:shadow-xl hover:border-secondary transition-all relative">

                                <div>
                                    <div className="flex justify-between items-start mb-6">
                                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${activeTab === 'BASICO' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                                            {activeTab === 'BASICO' ? 'Onboarding' : 'Especialización'}
                                        </span>

                                        {/* MENÚ DE TRES PUNTOS */}
                                        <div className="relative">
                                            <button
                                                onClick={() => toggleMenu(course.id)}
                                                className="p-1.5 hover:bg-muted cursor-pointer rounded-full transition-colors text-muted-foreground hover:text-foreground"
                                            >
                                                <i className="bi bi-three-dots-vertical"></i>
                                            </button>

                                            {activeMenu === course.id && (
                                                <div className="absolute right-0 mt-2 w-40 bg-card border border-border rounded-xl shadow-lg z-10 overflow-hidden animate-in fade-in zoom-in duration-200">
                                                    <button className="w-full text-left cursor-pointer px-4 py-3 text-sm text-foreground hover:bg-muted flex items-center gap-3 transition-colors">
                                                        <i className="bi bi-download text-muted-foreground"></i> Descargar
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-5 transition-colors ${activeTab === 'BASICO' ? 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground' : 'bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-secondary-foreground'}`}>
                                        <i className={`bi ${activeTab === 'BASICO' ? 'bi-journal-text' : 'bi-award'}`}></i>
                                    </div>
                                    <h3 className="text-foreground font-bold text-lg leading-tight mb-5 line-clamp-2">{course.title}</h3>
                                </div>

                                <Link
                                    href={`/dashboard/employee/courses/${course.id}`}
                                    className="w-full py-3 bg-secondary text-secondary-foreground cursor-pointer text-sm font-semibold rounded-xl text-center hover:opacity-90 transition-opacity shadow-sm inline-block"
                                >
                                    Ver Curso
                                </Link>
                            </div>
                        ))}
                </div>
            </main>
        </div>
    );
}