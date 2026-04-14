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

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f5f5f7]" style={{ fontFamily: "'SF Pro Display', sans-serif" }}>
        <Sidebar role="ADMIN" />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-[#005596]/10 border-t-[#005596] rounded-full animate-spin"></div>
          <p className="mt-6 text-[#005596] font-black text-xs uppercase tracking-[0.3em] animate-pulse">
            Cargando unidad...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f5f5f7]" style={{ fontFamily: "'SF Pro Display', sans-serif" }}>
      <Sidebar role="ADMIN" />

      <main className="flex-1 h-screen overflow-y-auto">
        <div className="max-w-7xl mx-auto px-8 py-10">
          
          {/* BREADCRUMB */}
          <Link
            href="/dashboard/administrator/admin/courses"
            className="group text-[#0071e3] text-sm font-semibold hover:underline mb-6 inline-flex items-center gap-2 transition-all"
          >
            <i className="bi bi-arrow-left-circle-fill transition-transform duration-300 group-hover:-translate-x-1.5"></i>
            <span>Volver a Cursos</span>
          </Link>

          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-[11px] font-black text-[#005596] uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
                Gestión de Lecciones
              </span>
              <h1 className="text-4xl font-black text-[#1d1d1f] mt-2 tracking-tight">
                {course?.title}
              </h1>
              <p className="text-[#86868b] mt-1">Administra el temario y recursos multimedia.</p>
            </div>

            <div className="flex items-center gap-3">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Buscar lección..."
              />
              <Link
                href={`/dashboard/administrator/admin/courses/${id}/content/new`}
                className="bg-[#0071e3] text-white px-6 py-2.5 rounded-full font-semibold hover:bg-[#0077ed] transition-all shadow-md shrink-0 text-center"
              >
                Añadir Lección
              </Link>
            </div>
          </div>

          {/* INFO CARDS */}
          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="bg-white p-6 rounded-[24px] border border-gray-200 shadow-sm">
              <p className="text-[11px] font-bold text-[#86868b] uppercase">Categoría</p>
              <p className="text-lg font-bold text-[#1d1d1f]">{course?.category || 'General'}</p>
            </div>
            <div className="bg-white p-6 rounded-[24px] border border-gray-200 shadow-sm">
              <p className="text-[11px] font-bold text-[#86868b] uppercase">Contenidos</p>
              <p className="text-lg font-bold text-[#1d1d1f]">{contentList.length} Unidades</p>
            </div>
          </div>

          {/* TABLA DE LECCIONES */}
          <div className="bg-white rounded-[32px] border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#fbfbfd] border-b border-gray-100">
                    <th className="px-6 py-5 text-[11px] font-black text-[#86868b] uppercase tracking-widest">Lección</th>
                    <th className="px-6 py-5 text-[11px] font-black text-[#86868b] uppercase tracking-widest">Recursos</th>
                    <th className="px-6 py-5 text-[11px] font-black text-[#86868b] uppercase tracking-widest text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredContents.length > 0 ? (
                    filteredContents.map((content: any) => (
                      <tr
                        key={content.id}
                        onClick={() => router.push(`/dashboard/administrator/admin/courses/${id}/content/${content.id}`)}
                        className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                      >
                        <td className="px-6 py-5">
                          <div className="font-bold text-[#1d1d1f] group-hover:text-[#0071e3] transition-colors">
                            {content.title}
                          </div>
                          <div className="text-[11px] text-[#86868b] line-clamp-1 max-w-xs italic">
                            {content.summary ? "Con resumen generado" : "Sin resumen"}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex gap-2">
                            {content.quiz && <span className="bg-orange-50 text-orange-600 text-[9px] font-black px-2 py-0.5 rounded uppercase">Quiz</span>}
                            {content.podcast && <span className="bg-purple-50 text-purple-600 text-[9px] font-black px-2 py-0.5 rounded uppercase">Audio</span>}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/dashboard/administrator/admin/courses/${id}/content/${content.id}`);
                              }}
                              className="text-[#0071e3] text-xs font-bold hover:underline cursor-pointer"
                            >
                              Ver
                            </button>
                            <button
                              onClick={(e) => confirmDelete(e, content.id)}
                              className="text-red-500 text-xs font-bold hover:underline cursor-pointer"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center">
                        <p className="text-[#86868b] font-medium">No hay lecciones en este curso.</p>
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