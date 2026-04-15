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

    // ESTADO PARA EL MODAL DE ELIMINACIÓN
    const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

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
            setCourses(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error al obtener cursos:", err);
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!courseToDelete) return;
        setDeleting(true);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_ROUTES.COURSES.GET_ALL}/${courseToDelete}`, {
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
        } finally {
            setDeleting(false);
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

    if (!mounted) return <div className="min-h-screen bg-background" />;

    return (
        <div className="flex min-h-screen bg-background font-sans relative">
            <Sidebar role="ADMIN" />

            <main className="flex-1 h-screen overflow-y-auto">
                <div className="max-w-6xl mx-auto px-6 lg:px-8 py-10 lg:py-12">

                    {/* HEADER */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                        <div>
                            <Link href="/dashboard/administrator/admin/courses" className="inline-flex items-center gap-2 text-secondary text-sm font-bold hover:opacity-80 transition-opacity mb-4">
                                <i className="bi bi-arrow-left"></i> Volver a Formación
                            </Link>
                            <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">Gestionar Cursos</h1>
                            <p className="text-muted-foreground mt-2 text-base">Administra el contenido privado de tu empresa.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Buscar curso..." />
                            <Link
                                href="/dashboard/administrator/admin/courses/manage/new"
                                className="bg-secondary text-secondary-foreground w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold hover:opacity-90 transition-opacity shadow-sm shrink-0 text-center flex items-center justify-center gap-2"
                            >
                                <i className="bi bi-plus-lg"></i> Nuevo curso
                            </Link>
                        </div>
                    </div>

                    {/* FILTROS */}
                    <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2 no-scrollbar">
                        {['ALL', 'BASICO', 'ESPECIALIZADO'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setFilter(tab as any)}
                                className={`shrink-0 px-6 py-2.5 rounded-full text-sm font-bold transition-all border ${filter === tab ? 'bg-foreground text-background border-foreground shadow-sm' : 'bg-background text-muted-foreground border-border hover:bg-muted'
                                    }`}
                            >
                                {tab === 'ALL' ? 'Todos' : tab === 'BASICO' ? 'Onboarding' : 'Especialización'}
                            </button>
                        ))}
                    </div>

                    {/* TABLA */}
                    <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[600px]">
                                <thead>
                                    <tr className="bg-muted/50 border-b border-border">
                                        <th className="px-6 lg:px-8 py-5 text-[11px] font-black text-muted-foreground uppercase tracking-widest w-2/3">Nombre del Curso</th>
                                        <th className="px-6 lg:px-8 py-5 text-[11px] font-black text-muted-foreground uppercase tracking-widest text-center w-1/6">Categoría</th>
                                        <th className="px-6 lg:px-8 py-5 text-[11px] font-black text-muted-foreground uppercase tracking-widest text-right w-1/6">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {loading ? (
                                         [1, 2, 3].map(i => (
                                            <tr key={i} className="animate-pulse">
                                                <td colSpan={3} className="px-6 py-8 bg-muted/30"></td>
                                            </tr>
                                        ))
                                    ) : filtered.length > 0 ? (
                                        filtered.map((course) => (
                                        <tr key={course.id} className="group hover:bg-muted/30 transition-colors">
                                            <td className="px-6 lg:px-8 py-5 font-bold text-base text-foreground group-hover:text-primary transition-colors">{course.title}</td>

                                            <td className="px-6 lg:px-8 py-5 text-center">
                                                <div className="flex justify-center">
                                                    {course.category?.toUpperCase() === 'ESPECIALIZADO' ? (
                                                        <span className="text-[10px] font-black px-3 py-1 rounded-md bg-secondary/10 text-secondary uppercase tracking-wider whitespace-nowrap">
                                                            Especialización
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] font-black px-3 py-1 rounded-md bg-primary/10 text-primary uppercase tracking-wider whitespace-nowrap">
                                                            Onboarding
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-6 lg:px-8 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link 
                                                        href={`/dashboard/administrator/admin/courses/manage/${course.id}`} 
                                                        className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors group/btn"
                                                        title="Editar curso"
                                                    >
                                                        <i className="bi bi-pencil-square text-lg group-hover/btn:scale-110 transition-transform block"></i>
                                                    </Link>
                                                    <button
                                                        onClick={() => setCourseToDelete(course.id)}
                                                        className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors group/btn cursor-pointer border-none bg-transparent"
                                                        title="Eliminar curso"
                                                    >
                                                        <i className="bi bi-trash3 text-lg block transition-colors"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-20 text-center">
                                                <div className="text-4xl text-muted-foreground/30 mb-3"><i className="bi bi-search"></i></div>
                                                <p className="text-foreground font-bold text-lg mb-1">No hay resultados</p>
                                                <p className="text-muted-foreground text-sm font-medium">No se encontraron cursos en esta categoría.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            {/* MODAL DE CONFIRMACIÓN */}
            {courseToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-center border border-border">
                        <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                            <i className="bi bi-exclamation-triangle"></i>
                        </div>
                        <h3 className="text-2xl font-extrabold text-foreground mb-2 tracking-tight">¿Eliminar curso?</h3>
                        <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
                            Esta acción no se puede deshacer. El curso se borrará permanentemente.
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={confirmDelete}
                                disabled={deleting}
                                className="w-full py-3.5 bg-destructive text-destructive-foreground rounded-xl font-bold hover:opacity-90 transition-opacity cursor-pointer shadow-sm disabled:opacity-60"
                            >
                                {deleting ? 'Eliminando...' : 'Sí, eliminar'}
                            </button>
                            <button
                                onClick={() => setCourseToDelete(null)}
                                className="w-full py-3.5 bg-muted text-foreground rounded-xl font-bold hover:bg-border transition-colors cursor-pointer"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}