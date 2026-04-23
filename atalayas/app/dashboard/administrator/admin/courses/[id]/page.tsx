'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/ui/Sidebar";
import PageHeader from "@/components/ui/pageHeader";
import { API_ROUTES } from "@/lib/utils";

// Función para limpiar Markdown y dejar solo texto plano para la previsualización
const cleanMarkdown = (text: string): string => {
  if (!text) return "";
  return text
    .replace(/\*\*?([^*]+)\*\*?/g, "$1") // Elimina **negrita** y *cursiva*
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Elimina enlaces [texto](url) -> texto
    .replace(/^- /gm, "") // Elimina guiones de lista
    .replace(/#/g, "") // Elimina almohadillas de títulos
    .trim();
};

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

  return (
    <div className="flex h-screen bg-background font-sans text-foreground overflow-hidden">
      <Sidebar role="ADMIN" />

      <main className="flex-1 overflow-auto flex flex-col relative">
        {loading ? (
          /* ESTADO DE CARGA CON SIDEBAR VISIBLE */
          <div className="flex-1 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          /* CONTENIDO REAL UNA VEZ CARGADO */
          <>
            <PageHeader 
              title={course?.title || "Detalle del Curso"}
              description="Gestión de contenidos y material didáctico."
              icon={<i className="bi bi-journal-bookmark"></i>}
              backUrl="/dashboard/administrator/admin/courses/manage"
              action={
                <Link 
                  href={`/dashboard/administrator/admin/courses/${id}/content/new`}
                  className="bg-primary text-white px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all flex items-center gap-2 shadow-sm"
                >
                  <i className="bi bi-plus-lg"></i> Añadir Unidad
                </Link>
              }
            />

            <div className="p-4 lg:p-8 flex-1 max-w-6xl mx-auto w-full">
              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm flex flex-col">
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
                  <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Unidades del programa</h2>
                  <div className="relative w-full sm:max-w-xs">
                    <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                    <input 
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar unidad..."
                      className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-1.5 text-xs outline-none focus:border-primary transition-all font-medium placeholder:text-slate-300"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse table-fixed">
                    <thead>
                      <tr className="bg-slate-50/20 border-b border-slate-100">
                        <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest w-16 text-center">Nº</th>
                        <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Título y descripción</th>
                        <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest w-32">Tipo</th>
                        <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right w-24">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredContents.length > 0 ? (
                        filteredContents.map((content: any) => (
                          <tr 
                            key={content.id} 
                            onClick={() => router.push(`/dashboard/administrator/admin/courses/${id}/content/${content.id}`)}
                            className="hover:bg-slate-50/50 transition-all group cursor-pointer"
                          >
                            <td className="px-5 py-3 text-center align-top">
                              <span className="font-mono text-[10px] font-bold text-slate-300 group-hover:text-primary transition-colors">
                                {String(content.order).padStart(2, '0')}
                              </span>
                            </td>
                            <td className="px-5 py-3 align-top">
                              <div className="font-bold text-sm text-slate-900 group-hover:text-primary transition-colors truncate">
                                {content.title}
                              </div>
                              {content.summary && (
                                <div className="text-[10.5px] text-slate-400 line-clamp-1 mt-0.5 font-medium italic leading-relaxed">
                                  {cleanMarkdown(content.summary)}
                                </div>
                              )}
                            </td>
                            <td className="px-5 py-3 align-top">
                              <div className="flex gap-1.5 mt-0.5">
                                {content.url?.includes('.mp3') ? (
                                  <span className="bg-indigo-50 text-indigo-500 text-[9px] font-black px-1.5 py-0.5 rounded border border-indigo-100 uppercase tracking-tighter">Podcast</span>
                                ) : (
                                  <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black px-1.5 py-0.5 rounded border border-emerald-100 uppercase tracking-tighter">Lectura</span>
                                )}
                                {content.quiz && (
                                  <span className="bg-slate-50 text-slate-500 text-[9px] font-black px-1.5 py-0.5 rounded border border-slate-200 uppercase tracking-tighter">Test</span>
                                )}
                              </div>
                            </td>
                            <td className="px-5 py-3 text-right align-top" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1 mt-0.5">
                                <button 
                                  onClick={() => router.push(`/dashboard/administrator/admin/courses/${id}/content/${content.id}/edit`)} 
                                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-primary transition-all"
                                >
                                  <i className="bi bi-pencil-square text-xs"></i>
                                </button>
                                <button 
                                  onClick={() => { setContentToDelete(content.id); setShowDeleteModal(true); }} 
                                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all"
                                >
                                  <i className="bi bi-trash3 text-xs"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-5 py-12 text-center text-slate-400 font-medium text-xs italic bg-slate-50/20">
                            No hay unidades disponibles.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl border border-red-100">
              <i className="bi bi-exclamation-triangle"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">¿Eliminar unidad?</h3>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">Esta acción es irreversible. Se perderá todo el contenido de la lección.</p>
            <div className="flex flex-col gap-3">
              <button onClick={executeDelete} className="w-full py-3 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-200">Sí, eliminar</button>
              <button onClick={() => setShowDeleteModal(false)} className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}