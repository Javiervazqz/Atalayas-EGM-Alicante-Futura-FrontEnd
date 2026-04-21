'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/ui/Sidebar";
import PageHeader from "@/components/ui/pageHeader";
import { API_ROUTES } from "@/lib/utils";

export default function AdminCourseDetailPage() {
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
        const res = await fetch(API_ROUTES.COURSES.GET_BY_ID(id as string), {
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
      const res = await fetch(API_ROUTES.CONTENT.GET_BY_ID(id as string, contentToDelete), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setCourse((prev: any) => ({
          ...prev,
          Content: (prev.Content || prev.content).filter((c: any) => c.id !== contentToDelete),
        }));
        setShowDeleteModal(false);
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
    <div className="flex min-h-screen bg-background font-sans text-foreground">
      <Sidebar role="ADMIN" />

      <main className="flex-1 overflow-auto flex flex-col relative">
        <PageHeader 
          title={course?.title || "Detalle del Curso"}
          description="Gestión de contenidos y material didáctico."
          icon={<i className="bi bi-journal-bookmark"></i>}
          backUrl="/dashboard/administrator/admin/courses/manage"
          action={
            <Link 
              href={`/dashboard/administrator/admin/courses/${id}/content/new`}
              className="bg-secondary text-secondary-foreground px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all flex items-center gap-2 shadow-sm"
            >
              <i className="bi bi-plus-lg"></i> Añadir Unidad
            </Link>
          }
        />

        <div className="p-6 lg:p-10 flex-1 max-w-6xl mx-auto w-full">
          
          {/* TABLA DE UNIDADES */}
          <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm flex flex-col">
            
            {/* Cabecera de la tabla */}
            <div className="p-5 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/20">
              <h2 className="text-sm font-bold uppercase tracking-widest text-foreground ml-2">Unidades</h2>
              
              <div className="relative w-full sm:max-w-xs">
                <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm"></i>
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar unidad..."
                  className="w-full bg-background border border-input rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-primary transition-all font-medium"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/40 border-b border-border">
                    <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest w-20 text-center">Nº</th>
                    <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Título</th>
                    <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Tipo</th>
                    <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredContents.length > 0 ? (
                    filteredContents.map((content: any) => (
                      <tr 
                        key={content.id} 
                        onClick={() => router.push(`/dashboard/administrator/admin/courses/${id}/content/${content.id}`)}
                        className="hover:bg-muted/40 transition-all group cursor-pointer"
                      >
                        <td className="px-6 py-5 text-center">
                          <span className="font-mono text-xs font-bold text-muted-foreground group-hover:text-primary transition-colors">
                            {String(content.order).padStart(2, '0')}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                            {content.title}
                          </div>
                          <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5 font-medium">
                            {content.summary || 'Sin descripción adicional'}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex gap-2">
                            {content.url?.includes('.mp3') ? (
                              <span className="bg-indigo-500/10 text-indigo-600 text-[9px] font-black px-2 py-0.5 rounded-md border border-indigo-500/20 uppercase tracking-tighter">Podcast</span>
                            ) : (
                              <span className="bg-emerald-500/10 text-emerald-600 text-[9px] font-black px-2 py-0.5 rounded-md border border-emerald-500/20 uppercase tracking-tighter">Lectura</span>
                            )}
                            {content.quiz && (
                              <span className="bg-secondary/10 text-secondary text-[9px] font-black px-2 py-0.5 rounded-md border border-secondary/20 uppercase tracking-tighter">Test</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button 
                              onClick={() => router.push(`/dashboard/administrator/admin/courses/${id}/content/${content.id}/edit`)} 
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
                              title="Editar"
                            >
                              <i className="bi bi-pencil-square"></i>
                            </button>
                            <button 
                              onClick={() => { setContentToDelete(content.id); setShowDeleteModal(true); }} 
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                              title="Eliminar"
                            >
                              <i className="bi bi-trash3"></i>
                            </button>
                            <div className="ml-2 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all">
                                <i className="bi bi-chevron-right text-sm"></i>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-20 text-center text-muted-foreground font-medium text-sm italic">
                        No se han encontrado unidades en este curso.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de eliminación sutil */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-sm rounded-[2rem] p-8 shadow-2xl border border-border text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
              <i className="bi bi-exclamation-triangle"></i>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2 tracking-tight">¿Eliminar unidad?</h3>
            <p className="text-muted-foreground text-sm mb-8 leading-relaxed">Esta acción es irreversible. Se perderá todo el contenido de la lección.</p>
            <div className="flex flex-col gap-3">
              <button onClick={executeDelete} className="w-full py-3 bg-destructive text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-destructive/20">Sí, eliminar</button>
              <button onClick={() => setShowDeleteModal(false)} className="w-full py-3 bg-muted text-foreground rounded-xl font-bold text-sm hover:bg-border transition-all">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}