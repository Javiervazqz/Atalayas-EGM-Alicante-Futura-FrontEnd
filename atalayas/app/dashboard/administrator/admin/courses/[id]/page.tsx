"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/ui/Sidebar";
import { API_ROUTES } from "@/lib/utils";
import SearchInput from "@/components/ui/Searchbar";

export default function AdminCourseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<string | null>(null);

  // --- CARGAR DATOS DEL CURSO ---
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


const confirmDelete = (e: React.MouseEvent, contentId: string) => {
  e.stopPropagation();
  setContentToDelete(contentId);
  setShowDeleteModal(true);
};

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

  // --- FILTRADO Y ORDENACIÓN ---
  const contentList = course?.Content || course?.content || [];

  const filteredContents = contentList
    .filter((c: any) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a: any, b: any) => a.order - b.order);

  if (loading) return (
    <div className="flex min-h-screen bg-background font-sans">
      <Sidebar role="ADMIN" />
      <main className="flex-1 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background font-sans">
      <Sidebar role="ADMIN" />

      <main className="flex-1 h-screen overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-10 lg:py-12">
          
          {/* BREADCRUMB */}
          <Link href="/dashboard/administrator/admin/courses" className="inline-flex items-center gap-2 text-secondary text-sm font-bold hover:opacity-80 transition-opacity mb-8">
            <i className="bi bi-arrow-left"></i> Volver a Cursos
          </Link>

          {/* HEADER (Estilo Tarjeta) */}
          <div className="bg-card rounded-[2.5rem] border border-border p-8 lg:p-10 mb-10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center text-4xl shrink-0">
                <i className="bi bi-journal-bookmark"></i>
              </div>
              <div>
                <span className="inline-block text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full mb-3">
                  Moderación de Contenidos
                </span>
                <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight mb-2">
                  {course?.title}
                </h1>
                <p className="text-muted-foreground text-sm font-medium">Gestiona las lecciones, cuestionarios y material multimedia.</p>
              </div>
            </div>
            
            <Link 
              href={`/dashboard/administrator/admin/courses/${id}/content/new`}
              className="shrink-0 bg-secondary text-secondary-foreground px-6 py-3.5 rounded-2xl text-sm font-bold hover:opacity-90 transition-opacity shadow-sm flex items-center justify-center gap-2"
            >
              <i className="bi bi-plus-lg text-lg"></i> Añadir Lección
            </Link>
          </div>

          {/* INFO CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col items-start">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-4 text-primary bg-primary/10">
                <i className="bi bi-tag-fill"></i>
              </div>
              <p className="text-2xl font-extrabold text-foreground mb-1 truncate w-full">{course?.category}</p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Categoría</p>
            </div>
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col items-start">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-4 text-secondary bg-secondary/10">
                <i className="bi bi-stack"></i>
              </div>
              <p className="text-2xl font-extrabold text-foreground mb-1">{contentList.length}</p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Unidades</p>
            </div>
          </div>

          {/* Buscador */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Lecciones</h2>
            <div className="w-full sm:w-auto">
              <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Buscar lección..." />
            </div>
          </div>

          {/* TABLA ESTILO APPLE / TARJETAS */}
          <div className="bg-card rounded-[2.5rem] border border-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="px-6 lg:px-8 py-5 text-[11px] font-black text-muted-foreground uppercase tracking-widest w-20 text-center">Orden</th>
                    <th className="px-6 lg:px-8 py-5 text-[11px] font-black text-muted-foreground uppercase tracking-widest">Título de la Lección</th>
                    <th className="px-6 lg:px-8 py-5 text-[11px] font-black text-muted-foreground uppercase tracking-widest">Multimedia</th>
                    <th className="px-6 lg:px-8 py-5 text-[11px] font-black text-muted-foreground uppercase tracking-widest text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredContents.length > 0 ? (
                    filteredContents.map((content: any) => (
                      <tr
                        key={content.id}
                        onClick={() => router.push(`/dashboard/administrator/admin/courses/${id}/content/${content.id}`)}
                        className="hover:bg-muted/30 transition-colors group cursor-pointer"
                      >
                        <td className="px-6 lg:px-8 py-5 text-center">
                          <div className="w-10 h-10 bg-muted mx-auto rounded-xl flex items-center justify-center font-mono text-sm font-bold text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            {String(content.order).padStart(2, '0')}
                          </div>
                        </td>
                        <td className="px-6 lg:px-8 py-5">
                          <div className="font-bold text-foreground group-hover:text-primary transition-colors text-base mb-1">{content.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">{content.summary || 'Sin resumen'}</div>
                        </td>
                        <td className="px-6 lg:px-8 py-5">
                          <div className="flex flex-wrap gap-2">
                            {content.quiz && <span className="bg-secondary/10 border border-secondary/20 text-secondary text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg">QUIZ</span>}
                            
                            {/* Si tiene un MP3, le ponemos la etiqueta de PODCAST IA */}
                            {content.url && content.url.includes('.mp3') && (
                              <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg flex items-center gap-1">
                                <i className="bi bi-mic-fill"></i> PODCAST
                              </span>
                            )}

                            {/* Si tiene un PDF o web, etiqueta normal */}
                            {content.url && !content.url.includes('.mp3') && (
                              <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg">DOCUMENTO</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 lg:px-8 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation(); 
                                router.push(`/dashboard/administrator/admin/courses/${id}/content/${content.id}/edit`);
                              }}
                              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                              title="Editar lección"
                            >
                              <i className="bi bi-pencil-square text-lg"></i>
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                // Aquí podrías añadir lógica para abrir el modal de borrado en esta página si quisieras, 
                                // como lo hicimos en GAdminCourseDetailPage
                                alert("Ve a la vista de detalle o edición para eliminar."); 
                              }} 
                              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                              title="Eliminar lección"
                            >
                               <i className="bi bi-trash3 text-lg"></i>
                            </button>
                            <i className="bi bi-chevron-right text-muted-foreground/50 group-hover:text-primary ml-2 text-lg transition-colors hidden sm:block"></i>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-8 py-24 text-center">
                        <div className="text-4xl text-muted-foreground/30 mb-4"><i className="bi bi-journal-x"></i></div>
                        <div className="text-foreground font-bold text-lg mb-1">Este curso aún no tiene lecciones creadas.</div>
                        <div className="text-muted-foreground text-sm mb-4">Añade contenido para que los empleados puedan empezar a aprender.</div>
                        <Link 
                          href={`/dashboard/administrator/admin/courses/${id}/content/new`} 
                          className="text-secondary text-sm font-bold inline-flex items-center gap-1 hover:underline"
                        >
                          <i className="bi bi-plus-lg"></i> Crear la primera lección
                        </Link>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
      {/* MODAL DE CONFIRMACIÓN ESTILO PREMIUM */}
{showDeleteModal && (
  <div 
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200"
    onClick={() => setShowDeleteModal(false)}
  >
    <div 
      className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl scale-in-center animate-in zoom-in-95 duration-200"
      onClick={e => e.stopPropagation()}
    >
      <div className="text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
          <i className="bi bi-exclamation-triangle-fill"></i>
        </div>
        <h2 className="text-2xl font-black text-[#1d1d1f] mb-2">¿Eliminar lección?</h2>
        <p className="text-[#86868b] text-sm mb-8">
          Esta acción borrará permanentemente el contenido y los datos asociados. No se puede deshacer.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <button 
          onClick={executeDelete}
          className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold transition-colors"
        >
          Sí, eliminar permanentemente
        </button>
        <button 
          onClick={() => setShowDeleteModal(false)}
          className="w-full py-4 text-[#0071e3] font-bold hover:bg-gray-50 rounded-2xl transition-colors"
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