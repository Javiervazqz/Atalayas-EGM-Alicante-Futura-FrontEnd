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

export default function AdminCoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null); // Estado para capturar errores
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('token') : '';

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true);
                const token = getToken();
                
                const res = await fetch(API_ROUTES.COURSES.GET_ALL, {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);

                const data = await res.json();
                
                // IMPORTANTE: Imprime esto en tu consola (F12) para ver la estructura
                console.log("Respuesta de la API:", data);

                // Adaptador flexible: por si viene como array o dentro de un objeto
                const finalData = Array.isArray(data) ? data : (data.courses || data.data || []);
                setCourses(finalData);

            } catch (err: any) {
                console.error("Error en fetch:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    const toggleMenu = (id: string) => setActiveMenu(activeMenu === id ? null : id);

    return (
        <div className="flex min-h-screen bg-[#f5f5f7]">
            <Sidebar role="ADMIN" />

            <main className="flex-1 p-10 overflow-auto">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-[#1d1d1f] tracking-tight mb-2">Gestión de Cursos</h1>
                        <p className="text-[#86868b] text-base">Administra el catálogo de formación.</p>
                    </div>
                    <Link href="/dashboard/admin/courses/new" className="bg-[#0071e3] text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[#0077ed] transition-all">
                        + Nuevo Curso
                    </Link>
                </div>

                {/* Mostrar error si algo falla */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
                        Error al cargar: {error}. Revisa la consola (F12).
                    </div>
                )}

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-64 bg-white rounded-2xl animate-pulse border border-gray-200" />
                        ))}
                    </div>
                ) : courses.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                        <p className="text-[#86868b]">No se encontraron cursos en la base de datos.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {courses.map((course) => (
                            <div key={course.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-all relative flex flex-col justify-between">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="px-2.5 py-1 rounded-full bg-gray-100 text-[#86868b] text-[10px] font-bold uppercase">
                                        {course.category || 'General'}
                                    </span>
                                    <div className="relative">
                                        <button onClick={() => toggleMenu(course.id)} className="p-1 hover:bg-gray-100 rounded-full">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                                                <circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" />
                                            </svg>
                                        </button>
                                        {activeMenu === course.id && (
                                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-10 overflow-hidden">
                                                <button className="w-full text-left px-4 py-3 text-sm hover:bg-[#f5f5f7]">📝 Editar</button>
                                                <button className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50">🗑️ Eliminar</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="mb-6">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4 ${course.isPublic ? 'bg-green-100' : 'bg-blue-100'}`}>📚</div>
                                    <h3 className="text-[#1d1d1f] font-semibold text-lg leading-tight mb-1">{course.title}</h3>
                                    <p className="text-xs text-[#86868b]">{course.isPublic ? 'Público' : 'Privado'}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Link href={`/dashboard/admin/courses/${course.id}`} className="flex-1 py-2.5 bg-[#f5f5f7] text-[#1d1d1f] text-sm font-medium rounded-xl text-center hover:bg-gray-200 transition-colors">
                                        Gestionar
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
            {activeMenu && <div className="fixed inset-0 z-0" onClick={() => setActiveMenu(null)} />}
        </div>
    );
}