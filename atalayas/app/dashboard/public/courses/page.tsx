'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import Link from 'next/link';
import { API_ROUTES } from '@/lib/utils';

interface Course {
    id: string;
    title: string;
    isPublic: boolean;
    category: string;
}

export default function PublicCoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('token') : '';

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const headers = { Authorization: `Bearer ${getToken()}` };
                const res = await fetch(API_ROUTES.COURSES.GET_ALL, { headers });
                const data = await res.json();

                const allData = Array.isArray(data) ? data : (data.courses || []);
                setCourses(allData.filter((c: Course) => c.isPublic));
            } catch (err) {
                console.error("Error cargando cursos públicos:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    return (
        <div className="flex min-h-screen bg-background font-sans">
            <Sidebar role="PUBLIC" />

            <main className="flex-1 p-8 lg:p-12 overflow-auto">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-foreground tracking-tight mb-2">Explorar Cursos</h1>
                    <p className="text-muted-foreground text-base">
                        Contenido abierto para la comunidad del polígono.
                    </p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-64 bg-card rounded-3xl border border-border animate-pulse" />
                        ))}
                    </div>
                ) : courses.length === 0 ? (
                    <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-border">
                        <span className="text-5xl text-muted-foreground/50 mb-4 block"><i className="bi bi-journal-x"></i></span>
                        <p className="text-muted-foreground font-medium">No hay cursos públicos disponibles en este momento.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {courses.map((course) => (
                            <div
                                key={course.id}
                                className="bg-card rounded-3xl p-6 border border-border hover:border-secondary hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-6">
                                        <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                                            {course.category || 'Abierto'}
                                        </span>
                                        <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            Gratis
                                        </span>
                                    </div>

                                    <div className="mb-8">
                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl mb-5 group-hover:bg-secondary/10 group-hover:text-secondary group-hover:scale-110 transition-all">
                                            <i className="bi bi-journal-bookmark"></i>
                                        </div>
                                        <h3 className="text-foreground font-bold text-lg leading-tight mb-2 group-hover:text-secondary transition-colors line-clamp-2">
                                            {course.title}
                                        </h3>
                                        <p className="text-xs text-muted-foreground font-medium">Acceso instantáneo para visitantes</p>
                                    </div>
                                </div>

                                <Link
                                    href={`/dashboard/public/courses/${course.id}`}
                                    className="w-full py-3 bg-secondary hover:opacity-90 text-secondary-foreground text-sm font-semibold rounded-xl transition-all text-center shadow-sm"
                                >
                                    Comenzar a aprender
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}