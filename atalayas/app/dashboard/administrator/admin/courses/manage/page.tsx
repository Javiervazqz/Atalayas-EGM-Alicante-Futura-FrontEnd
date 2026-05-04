'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import PageHeader from '@/components/ui/pageHeader';
import Link from 'next/link';
import { API_ROUTES } from '@/lib/utils';

export default function ManageCourses() {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'ALL' | 'BASICO' | 'ESPECIALIZADO'>('ALL');
    const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
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
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!courseToDelete) return;
        setDeleting(true);
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_ROUTES.COURSES.GET_ALL}/${courseToDelete}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            setCourses(courses.filter(c => c.id !== courseToDelete));
            setCourseToDelete(null);
        } finally {
            setDeleting(false);
        }
    };

    const filtered = courses.filter(c => {
        const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
        let matchesTab = true;
        if (filter === 'BASICO') matchesTab = c.category?.toUpperCase() !== 'ESPECIALIZADO';
        if (filter === 'ESPECIALIZADO') matchesTab = c.category?.toUpperCase() === 'ESPECIALIZADO';
        return matchesSearch && matchesTab;
    });

    return (
        <div className="flex min-h-screen bg-background font-sans relative">
            <Sidebar role="ADMIN" />
            <main className="flex-1 overflow-auto flex flex-col relative">
                <PageHeader
                    title="Gestión de Contenido"
                    description="Administra los cursos de formación de tu empresa y el contenido global."
                    icon={<i className="bi bi-gear-fill"></i>}
                    action={
                        <Link href="/dashboard/administrator/admin/courses/manage/new"
                            className="bg-secondary text-secondary-foreground px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all shadow-sm flex items-center justify-center gap-2 w-full"
                        >
                            <i className="bi bi-plus-lg"></i> Nuevo curso
                        </Link>
                    }
                />

                <div className="p-6 lg:p-10 flex-1 max-w-7xl mx-auto w-full">
                    <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm flex flex-col">
                        <div className="p-5 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/20">
                            <div className="flex bg-background border border-input p-1 rounded-xl shrink-0">
                                {['ALL', 'BASICO', 'ESPECIALIZADO'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setFilter(tab as any)}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${filter === tab ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        {tab === 'ALL' ? 'Todos' : tab === 'BASICO' ? 'Onboarding' : 'Especialización'}
                                    </button>
                                ))}
                            </div>
                            <div className="relative w-full sm:max-w-xs">
                                <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm"></i>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Buscar curso..."
                                    className="w-full bg-background border border-input rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-primary transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[600px]">
                                <thead>
                                    <tr className="bg-muted/40 border-b border-border">
                                        <th className="px-6 lg:px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest w-2/3">Nombre del Curso</th>
                                        <th className="px-6 lg:px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Categoría</th>
                                        <th className="px-6 lg:px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {loading ? (
                                        [1, 2, 3].map(i => <tr key={i} className="animate-pulse"><td colSpan={3} className="px-6 py-8"><div className="h-4 bg-muted rounded w-full"></div></td></tr>)
                                    ) : filtered.length > 0 ? (
                                        filtered.map((course) => (
                                            <tr key={course.id} className="group hover:bg-muted/30 transition-colors">
                                                <td className="px-6 lg:px-8 py-5">
                                                    {/* Envolvemos el contenido en un Link para que sea clicable */}
                                                    <Link
                                                        href={`/dashboard/administrator/admin/courses/manage/view/${course.id}`}
                                                        className="flex items-center gap-4 cursor-pointer group/link"
                                                    >
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${course.isPublic
                                                            ? 'bg-green-500/10 text-green-600 border-green-500/20 group-hover/link:bg-green-600 group-hover/link:text-white'
                                                            : 'bg-primary/5 text-primary border border-primary/10 group-hover/link:bg-primary group-hover/link:text-white'
                                                            }`}>
                                                            <i className={`bi ${course.isPublic ? 'bi-globe' : 'bi-journal-text'} text-lg`}></i>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-foreground group-hover/link:text-primary transition-colors">
                                                                {course.title}
                                                            </span>
                                                            <span className="text-[10px] font-bold uppercase tracking-tighter flex items-center gap-1 opacity-60">
                                                                {course.isPublic ? (
                                                                    <span className="text-green-600 flex items-center gap-1">
                                                                        <i className="bi bi-globe"></i> Público
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-primary flex items-center gap-1">
                                                                        <i className="bi bi-building"></i> Privado
                                                                    </span>
                                                                )}
                                                                <span className="mx-1">•</span> Click para ver contenido
                                                            </span>
                                                        </div>
                                                    </Link>
                                                </td>
                                                <td className="px-6 lg:px-8 py-5 text-center">
                                                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider ${course.category?.toUpperCase() === 'ESPECIALIZADO' ? 'bg-secondary/10 text-secondary border border-secondary/20' : 'bg-primary/10 text-primary border border-primary/20'
                                                        }`}>
                                                        {course.category?.toUpperCase() === 'ESPECIALIZADO' ? 'Especialización' : 'Onboarding'}
                                                    </span>
                                                </td>
                                                <td className="px-6 lg:px-8 py-5 text-right">
                                                    <div className="flex items-center justify-end gap-2 relative z-10">
                                                        {!course.isPublic ? (
                                                            <>
                                                                <Link href={`/dashboard/administrator/admin/courses/manage/${course.id}`}
                                                                    className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all border border-transparent hover:border-primary/20"
                                                                    title="Editar curso"
                                                                >
                                                                    <i className="bi bi-pencil-square"></i>
                                                                </Link>
                                                                <button onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setCourseToDelete(course.id);
                                                                }}
                                                                    className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all border border-transparent hover:border-destructive/20 cursor-pointer bg-transparent"
                                                                    title="Eliminar curso"
                                                                >
                                                                    <i className="bi bi-trash3"></i>
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest px-3">
                                                                Gestionado por Global
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan={3} className="px-6 py-20 text-center text-muted-foreground font-medium">No hay cursos con estos filtros.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modal de eliminación */}
            {courseToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl text-center border border-border">
                        <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                            <i className="bi bi-exclamation-triangle"></i>
                        </div>
                        <h3 className="text-2xl font-black text-foreground mb-2 tracking-tight">¿Eliminar curso?</h3>
                        <p className="text-muted-foreground text-sm mb-8">Esta acción borrará permanentemente el curso.</p>
                        <div className="flex flex-col gap-3">
                            <button onClick={confirmDelete} disabled={deleting} className="w-full py-3.5 bg-destructive text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-destructive/20">
                                {deleting ? 'Borrando...' : 'Sí, eliminar curso'}
                            </button>
                            <button onClick={() => setCourseToDelete(null)} className="w-full py-3.5 bg-muted text-foreground rounded-xl font-bold hover:bg-border transition-all">
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}