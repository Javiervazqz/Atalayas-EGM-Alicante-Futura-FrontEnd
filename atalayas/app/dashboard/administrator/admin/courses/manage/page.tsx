'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import Link from 'next/link';
import { API_ROUTES } from '@/lib/utils';
import SearchInput from '@/components/ui/Searchbar';
import { useRouter } from 'next/navigation';

export default function ManageCourses() {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'ALL' | 'BASICO' | 'ESPECIALIZADO'>('ALL');
    const [courseToDelete, setCourseToDelete] = useState<string | null>(null);

    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(API_ROUTES.COURSES.GET_ALL, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            const rawCourses = Array.isArray(data) ? data : (data.courses || []);

            const sortedDataCourses = rawCourses.sort((a: any, b: any) => {
                    const titleA = a.title.trim().toLowerCase();
                    const titleB = b.title.trim().toLowerCase();
                    return titleA.localeCompare(titleB, undefined, { numeric: true, sensitivity: "base" });
                });

                setCourses(sortedDataCourses);
        } catch (err) {
            console.error("Error al obtener cursos:", err);
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!courseToDelete) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_ROUTES.COURSES.GET_ALL.replace(/\/$/, "")}/${courseToDelete}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                setCourses(courses.filter(c => c.id !== courseToDelete));
                setCourseToDelete(null);
            } else {
                alert("No se pudo eliminar el curso.");
            }
        } catch (err) {
            console.error("Error al eliminar:", err);
        }
    };

    const filtered = courses.filter(c => {
        const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
        const isNotPublic = c.isPublic === false || c.isPublic === 0;
        let matchesTab = true;
        if (filter === 'BASICO') matchesTab = c.category?.toUpperCase() !== 'ESPECIALIZADO';
        if (filter === 'ESPECIALIZADO') matchesTab = c.category?.toUpperCase() === 'ESPECIALIZADO';
        return matchesSearch && isNotPublic && matchesTab;
    });

    if (!mounted) return <div className="min-h-screen bg-[#f5f5f7]" />;

    return (
        <div className="flex min-h-screen bg-[#f5f5f7] relative">
            <Sidebar role="ADMIN" />

            <main className="flex-1 h-screen overflow-y-auto">
                <div className="max-w-7xl mx-auto px-8 py-10">

                    <Link
                        href="/dashboard/administrator/admin/courses"
                        className="group text-[#0071e3] text-sm font-semibold hover:underline mb-6 inline-flex items-center gap-2 transition-all"
                        >
                        <i className="bi bi-arrow-left-circle-fill transition-transform duration-300 group-hover:-translate-x-1.5"></i>
                        <span>Volver al panel</span>
                        </Link>

                    {/* HEADER */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-[#1d1d1f] tracking-tight">Gestión de Contenidos</h1>
                            <p className="text-[#86868b] text-sm">Organiza, edita o elimina los cursos privados de tu empresa.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Buscar curso..." />
                            <Link
                                href="/dashboard/administrator/admin/courses/manage/new"
                                className="bg-[#0071e3] text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-[#0077ed] transition-all shadow-md whitespace-nowrap active:scale-95"
                            >
                                Nuevo Curso
                            </Link>
                        </div>
                    </div>

                    {/* FILTROS TIPO APPLE */}
                    <div className="flex items-center gap-2 mb-8 bg-gray-200/50 p-1 rounded-2xl w-fit">
                        {['ALL', 'BASICO', 'ESPECIALIZADO'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setFilter(tab as any)}
                                className={`px-6 py-2 rounded-xl text-xs font-black transition-all uppercase tracking-wider ${filter === tab 
                                    ? 'bg-white text-[#1d1d1f] shadow-sm' 
                                    : 'text-[#86868b] hover:text-[#1d1d1f] cursor-pointer'
                                }`}
                            >
                                {tab === 'ALL' ? 'Todos' : tab === 'BASICO' ? 'Onboarding' : 'Especialización'}
                            </button>
                        ))}
                    </div>

                    {/* TABLA DE CURSOS */}
                    <div className="bg-white rounded-[2.5rem] border border-gray-200 overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#fbfbfd] border-b border-gray-100">
                                    <th className="px-8 py-5 text-[10px] font-black text-[#86868b] uppercase tracking-[0.15em]">Vista Previa</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-[#86868b] uppercase tracking-[0.15em]">Información del Curso</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-[#86868b] uppercase tracking-[0.15em] text-center">Categoría</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-[#86868b] uppercase tracking-[0.15em] text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {!loading && filtered.map((course) => (
                                    <tr key={course.id} className="group hover:bg-[#fbfbfd] transition-colors">
                                        <td className="px-8 py-4">
                                            <div className="w-20 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-100">
                                                {course.fileUrl ? (
                                                    <img src={course.fileUrl} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                                        <i className="bi bi-image text-gray-300"></i>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-[#1d1d1f] text-base">{course.title}</span>
                                                <span className="text-[11px] text-[#86868b]">ID: {course.id.substring(0,8)}...</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4 text-center">
                                            <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${
                                                course.category?.toUpperCase() === 'ESPECIALIZADO' 
                                                ? 'bg-purple-50 text-purple-600 border border-purple-100' 
                                                : 'bg-blue-50 text-blue-600 border border-blue-100'
                                            }`}>
                                                {course.category === 'ESPECIALIZADO' ? 'Especialización' : 'Onboarding'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link 
                                                    href={`/dashboard/administrator/admin/courses/manage/${course.id}`} 
                                                    className="p-2.5 bg-[#f5f5f7] hover:bg-blue-50 text-gray-600 hover:text-[#0071e3] rounded-xl transition-all"
                                                >
                                                    <i className="bi bi-pencil-square"></i>
                                                </Link>
                                                <button
                                                    onClick={() => setCourseToDelete(course.id)}
                                                    className="p-2.5 bg-[#f5f5f7] hover:bg-red-50 text-gray-600 hover:text-red-500 rounded-xl transition-all cursor-pointer"
                                                >
                                                    <i className="bi bi-trash3-fill"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filtered.length === 0 && !loading && (
                            <div className="py-24 text-center">
                                <p className="text-[#86868b] font-medium">No hay cursos disponibles.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* MODAL DE ELIMINACIÓN */}
            {courseToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#1d1d1f]/20 backdrop-blur-md" onClick={() => setCourseToDelete(null)} />
                    <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-5 text-2xl">
                                <i className="bi bi-trash3-fill"></i>
                            </div>
                            <h3 className="text-xl font-bold text-[#1d1d1f] mb-2">¿Eliminar este curso?</h3>
                            <p className="text-[#86868b] text-sm mb-8 leading-relaxed">
                                Esta acción es irreversible y eliminará todo el progreso asociado.
                            </p>
                            <div className="space-y-3">
                                <button
                                    onClick={confirmDelete}
                                    className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-colors cursor-pointer"
                                >
                                    Eliminar ahora
                                </button>
                                <button
                                    onClick={() => setCourseToDelete(null)}
                                    className="w-full py-4 bg-[#f5f5f7] text-[#1d1d1f] rounded-2xl font-bold hover:bg-gray-200 transition-colors cursor-pointer"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}