"use client";

import { useEffect, useState } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import PageHeader from '@/components/ui/pageHeader'; // Banner unificado
import { API_ROUTES } from '@/lib/utils';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';

export default function EmployeeCoursesPage() {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'TODOS' | 'BASICO' | 'ESPECIALIZADO'>('TODOS');
    
    const searchParams = useSearchParams();
    const fromTaskId = searchParams.get('fromTask');

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await fetch(API_ROUTES.COURSES.GET_ALL, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                const data = await res.json();
                const rawCourses = Array.isArray(data) ? data : (data.courses || []);
                
                const sortedDataCourses = [...rawCourses].sort((a: any, b: any) => {
                    const titleA = (a.title || '').trim().toLowerCase();
                    const titleB = (b.title || '').trim().toLowerCase();
                    return titleA.localeCompare(titleB, undefined, { numeric: true, sensitivity: "base" });
                });
                
                setCourses(sortedDataCourses);
            } catch (err) { console.error(err); } 
            finally { setLoading(false); }
        };
        fetchCourses();
    }, []);

    // Lógica de autoconfirmación de tareas (Onboarding)
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
                } catch (err) { console.error("Error al autocompletar:", err); }
            }
        };
        autoConfirmTask();
    }, [fromTaskId]);

    const filtered = courses.filter(c => {
        if (activeTab === 'TODOS') return true;
        const cat = c.category?.toUpperCase();
        if (activeTab === 'BASICO') return cat !== 'ESPECIALIZADO';
        return cat === 'ESPECIALIZADO';
    });

    return (
        <div className="flex min-h-screen bg-background font-sans text-foreground">
            <Sidebar role="EMPLOYEE" />

            <main className="flex-1 overflow-auto flex flex-col relative">
                
                {/* BANNER UNIFICADO (Idéntico al Admin) */}
                <PageHeader 
                    title="Mi Formación"
                    description="Explora los programas de capacitación, cursos de onboarding y material especializado diseñado para tu crecimiento."
                    icon={<i className="bi bi-journal-bookmark-fill"></i>}
                />

                {/* CONTENIDO CON PADDING (Siguiendo estructura Admin) */}
                <div className="p-6 lg:p-10 flex-1 space-y-8">
                    
                    {/* SELECTOR DE CATEGORÍAS (Apple Style Pill) */}
                    <div className="flex justify-between items-center flex-wrap gap-4">
                        <div className="flex gap-1 bg-card border border-border p-1.5 rounded-2xl shadow-sm">
                            {['TODOS', 'BASICO', 'ESPECIALIZADO'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    className={`relative px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${
                                        activeTab === tab ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <span className="relative z-10">
                                        {tab === 'TODOS' ? 'Todos' : tab === 'BASICO' ? 'Onboarding' : 'Especialización'}
                                    </span>
                                    {activeTab === tab && (
                                        <motion.div 
                                            layoutId="activeTabPill"
                                            className="absolute inset-0 bg-primary/5 border border-primary/10 rounded-xl"
                                            transition={{ type: "spring", stiffness: 500, damping: 35 }}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Indicador de progreso rápido o total */}
                        <div className="hidden md:flex items-center gap-3 px-5 py-2.5 bg-card border border-border rounded-2xl shadow-sm">
                            <i className="bi bi-lightning-charge-fill text-secondary"></i>
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                {courses.length} Programas disponibles
                            </span>
                        </div>
                    </div>

                    {/* GRID DE CURSOS (Estilo moderno y profesional) */}
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8"
                        >
                            {loading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="h-80 bg-card rounded-[2rem] border border-border animate-pulse shadow-sm" />
                                ))
                            ) : filtered.length === 0 ? (
                                <div className="col-span-full py-24 text-center bg-card border-2 border-dashed border-border rounded-[2rem]">
                                    <div className="text-5xl text-muted-foreground/20 mb-6"><i className="bi bi-search"></i></div>
                                    <p className="text-muted-foreground font-bold text-lg">No hay cursos en esta categoría actualmente</p>
                                </div>
                            ) : (
                                filtered.map((course) => {
                                    const isBasico = course.category?.toUpperCase() !== 'ESPECIALIZADO';
                                    return (
                                        <div key={course.id} className="group bg-card rounded-[2rem] border border-border shadow-sm hover:shadow-xl hover:border-secondary/40 transition-all duration-500 flex flex-col overflow-hidden relative">
                                            
                                            {/* Decoración sutil de fondo */}
                                            <div className={`absolute top-0 right-0 w-32 h-32 blur-[80px] opacity-10 transition-opacity group-hover:opacity-20 ${isBasico ? 'bg-primary' : 'bg-secondary'}`} />

                                            <div className="p-8 flex-1 flex flex-col">
                                                <div className="flex justify-between items-start mb-8">
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all duration-500 group-hover:scale-110 shadow-sm ${
                                                        isBasico ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
                                                    }`}>
                                                        <i className={`bi ${isBasico ? 'bi-compass' : 'bi-rocket-takeoff'}`}></i>
                                                    </div>
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${
                                                        isBasico ? 'bg-primary/5 text-primary border-primary/20' : 'bg-secondary/5 text-secondary border-secondary/20'
                                                    }`}>
                                                        {isBasico ? 'Básico' : 'Pro'}
                                                    </span>
                                                </div>

                                                <h3 className="text-xl font-bold text-foreground leading-tight mb-4 group-hover:text-primary transition-colors">
                                                    {course.title}
                                                </h3>
                                                
                                                <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-8 opacity-80">
                                                    Explora los fundamentos de este programa y adquiere las habilidades necesarias para destacar en Atalayas EGM.
                                                </p>

                                                <div className="mt-auto">
                                                    <Link
                                                        href={`/dashboard/employee/courses/${course.id}`}
                                                        className="flex items-center justify-center gap-3 w-full py-4 bg-foreground text-background dark:bg-muted dark:text-foreground text-sm font-black uppercase tracking-widest rounded-2xl transition-all hover:opacity-90 active:scale-[0.97] shadow-lg shadow-black/5"
                                                    >
                                                        Empezar curso
                                                        <i className="bi bi-arrow-right-short text-xl"></i>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
