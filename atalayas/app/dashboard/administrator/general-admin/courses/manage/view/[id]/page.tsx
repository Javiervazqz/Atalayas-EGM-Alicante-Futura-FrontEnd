'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/ui/Sidebar";
import PageHeader from "@/components/ui/pageHeader";
import { API_ROUTES } from "@/lib/utils";

export default function GeneralAdminCourseDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [contentToDelete, setContentToDelete] = useState<string | null>(null);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const token = localStorage.getItem("token");
                // Ajuste de la ruta: si GET_BY_ID no es función, usa `${API_ROUTES.COURSES.GET_ALL}/${id}`
                const url = typeof API_ROUTES.COURSES.GET_BY_ID === 'function'
                    ? API_ROUTES.COURSES.GET_BY_ID(id as string)
                    : `${API_ROUTES.COURSES.GET_ALL}/${id}`;

                const res = await fetch(url, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                setCourse(data);
            } catch (error) {
                console.error("Error fetching course:", error);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchCourse();
    }, [id]);

    const executeDelete = async () => {
        if (!contentToDelete) return;
        try {
            const token = localStorage.getItem("token");
            const url = typeof API_ROUTES.CONTENT.GET_BY_ID === 'function'
                ? API_ROUTES.CONTENT.GET_BY_ID(id as string, contentToDelete)
                : `${API_ROUTES.CONTENT.GET_ALL}/${contentToDelete}`;

            const res = await fetch(url, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                setCourse((prev: any) => ({
                    ...prev,
                    Content: (prev.Content || prev.content).filter((c: any) => c.id !== contentToDelete),
                }));
                setShowDeleteModal(false);
                setContentToDelete(null);
            }
        } catch (error) {
            console.error("Error deleting:", error);
        }
    };

    const contentList = course?.Content || course?.content || [];
    const filteredContents = contentList
        .filter((c: any) => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a: any, b: any) => a.order - b.order);

    if (loading) return (
        <div className="flex min-h-screen bg-background items-center justify-center font-sans">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="flex min-h-screen bg-muted/30 font-sans text-foreground transition-colors duration-300">
            <Sidebar role="GENERAL_ADMIN" />

            <main className="flex-1 overflow-auto flex flex-col relative">
                <PageHeader
                    title={course?.title || "Detalle del Curso"}
                    description={`Gestionando contenidos para ${course?.isPublic ? 'Biblioteca Pública' : (course?.company?.name || 'Empresa')}.`}
                    icon={<i className="bi bi-journal-bookmark-fill"></i>}
                    backUrl="/dashboard/administrator/general-admin/courses/manage"
                    action={
                        <Link
                            href={`/dashboard/administrator/general-admin/courses/manage/view/${id}/content/new`}
                            className="bg-secondary text-white px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2 shadow-sm"
                        >
                            <i className="bi bi-plus-lg"></i> Añadir Unidad
                        </Link>
                    }
                />

                <div className="p-6 lg:p-10 flex-1 max-w-7xl mx-auto w-full">
                    <div className="bg-card rounded-[24px] border border-border/60 overflow-hidden shadow-sm flex flex-col">

                        {/* Cabecera de la tabla con buscador */}
                        <div className="p-6 border-b border-border/60 flex flex-col md:flex-row items-center justify-between gap-4 bg-muted/20">
                            <div className="flex items-center gap-3">
                                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Estructura del Currículo</h2>
                                {course?.isPublic && (
                                    <span className="bg-primary/10 text-primary text-[9px] font-black px-2 py-1 rounded-md border border-primary/20 uppercase tracking-widest">Público</span>
                                )}
                            </div>

                            <div className="relative w-full md:max-w-xs">
                                <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 text-sm"></i>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Buscar unidad..."
                                    className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all font-bold text-foreground placeholder:text-muted-foreground/50"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-muted/30 border-b border-border/60">
                                        <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest w-24 text-center">Orden</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Contenido de la Lección</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Tipo</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/60">
                                    {filteredContents.length > 0 ? (
                                        filteredContents.map((content: any) => (
                                            <tr
                                                key={content.id}
                                                onClick={() => router.push(`/dashboard/administrator/general-admin/courses/manage/view/${id}/content/${content.id}`)}
                                                className="group hover:bg-muted/20 transition-colors cursor-pointer"
                                            >
                                                <td className="px-8 py-5 text-center">
                                                    <div className="w-10 h-10 bg-muted/50 rounded-xl flex items-center justify-center font-mono text-xs font-black text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all mx-auto border border-border/40">
                                                        {String(content.order).padStart(2, '0')}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                                                            {content.title}
                                                        </span>
                                                        <span className="text-[11px] text-muted-foreground/70 line-clamp-1 mt-0.5 font-medium">
                                                            {content.summary || 'Sin descripción redactada...'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex gap-2 justify-center">
                                                        {content.url?.includes('.mp3') ? (
                                                            <span className="bg-indigo-500/5 text-indigo-600 text-[9px] font-black px-2.5 py-1 rounded-lg border border-indigo-500/10 uppercase tracking-widest">Audio</span>
                                                        ) : (
                                                            <span className="bg-emerald-500/5 text-emerald-600 text-[9px] font-black px-2.5 py-1 rounded-lg border border-emerald-500/10 uppercase tracking-widest">Texto</span>
                                                        )}
                                                        {content.quiz && (
                                                            <span className="bg-secondary/5 text-secondary text-[9px] font-black px-2.5 py-1 rounded-lg border border-secondary/10 uppercase tracking-widest">Quiz</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => router.push(`/dashboard/administrator/general-admin/courses/manage/view/${id}/content/${content.id}/edit`)}
                                                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all border border-border/40"
                                                            title="Editar lección"
                                                        >
                                                            <i className="bi bi-pencil-square"></i>
                                                        </button>
                                                        <button
                                                            onClick={() => { setContentToDelete(content.id); setShowDeleteModal(true); }}
                                                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-muted/50 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all border border-border/40"
                                                            title="Eliminar lección"
                                                        >
                                                            <i className="bi bi-trash3"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-20 text-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    <i className="bi bi-inbox text-4xl text-muted-foreground/20"></i>
                                                    <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest mt-2">No hay unidades registradas</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modal de eliminación */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-card w-full max-w-sm rounded-[32px] p-8 shadow-2xl border border-border text-center animate-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl shadow-sm">
                            <i className="bi bi-exclamation-triangle"></i>
                        </div>
                        <h3 className="text-xl font-black text-foreground mb-2 tracking-tight uppercase">¿Eliminar unidad?</h3>
                        <p className="text-muted-foreground text-[11px] font-medium mb-8 leading-relaxed px-4">
                            Esta acción eliminará permanentemente la lección y sus materiales asociados.
                        </p>
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={executeDelete}
                                className="w-full py-3.5 bg-destructive text-white rounded-xl font-black text-[11px] uppercase tracking-widest hover:opacity-90 transition-all shadow-md active:scale-95"
                            >
                                Sí, eliminar unidad
                            </button>
                            <button
                                onClick={() => { setShowDeleteModal(false); setContentToDelete(null); }}
                                className="w-full py-3.5 bg-muted text-foreground rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-border/60 transition-all"
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