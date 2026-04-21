"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion"; // Importamos Framer Motion
import Sidebar from "@/components/ui/Sidebar";
import SearchInput from "@/components/ui/Searchbar";
import { API_ROUTES } from "@/lib/utils";

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) return;
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await fetch(API_ROUTES.COURSES.GET_BY_ID(courseId), {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Error en la respuesta");
        const data = await res.json();
        const finalData = data.course || data.data || data;
        setCourse(finalData);
      } catch (err) {
        console.error("Error cargando curso:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [courseId]);

  const contentList = course?.Content || course?.content || [];

  const filteredContent = contentList.filter((c: any) => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
    const isCompleted = c.userProgresses?.some((p: any) => p.isCompleted);
    if (filterStatus === "completed") return matchesSearch && isCompleted;
    if (filterStatus === "pending") return matchesSearch && !isCompleted;
    return matchesSearch;
  });

  const sortedContent = [...filteredContent].sort((a, b) => {
    const aCompleted = a.userProgresses?.some((p: any) => p.isCompleted) ? 1 : 0;
    const bCompleted = b.userProgresses?.some((p: any) => p.isCompleted) ? 1 : 0;
    if (aCompleted !== bCompleted) return aCompleted - bCompleted;
    return a.title.localeCompare(b.title);
  });

  if (loading) return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" 
      />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#f5f5f7]" style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" }}>
      <Sidebar role="EMPLOYEE" />

      <main className="flex-1 h-screen overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-12">
          <div className="mb-10">
            <Link href="/dashboard/employee/courses" className="group text-[#0071e3] text-sm font-semibold hover:underline mb-4 inline-flex items-center gap-2">
              <i className="bi bi-arrow-left-circle-fill"></i>
              <span>Volver a cursos</span>
            </Link>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="flex-1">
                <motion.h1 
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-4xl font-black text-[#1d1d1f] tracking-tight mb-6"
                >
                  {course?.title || "Curso"}
                </motion.h1>
                
                {/* FILTRO POR CHIPS ANIMADOS */}
                <div className="flex flex-wrap items-center gap-3">
                  {[
                    { id: 'all', label: 'Todos', icon: 'bi-grid-fill' },
                    { id: 'pending', label: 'Pendientes', icon: 'bi-clock-history' },
                    { id: 'completed', label: 'Completados', icon: 'bi-trophy-fill' }
                  ].map((chip) => (
                    <button
                      key={chip.id}
                      onClick={() => setFilterStatus(chip.id)}
                      className="relative px-4 py-2 text-xs font-bold transition-colors outline-none"
                    >
                      {/* Fondo animado del chip seleccionado */}
                      {filterStatus === chip.id && (
                        <motion.div
                          layoutId="activeChip"
                          className="absolute inset-0 bg-[#1d1d1f] rounded-full shadow-md"
                          transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
                        />
                      )}
                      
                      <span className={`relative z-10 flex items-center gap-2 ${
                        filterStatus === chip.id ? "text-white" : "text-[#86868b]"
                      }`}>
                        <i className={`bi ${chip.icon}`}></i>
                        {chip.label}
                      </span>

                      {/* Borde sutil para los no seleccionados */}
                      {filterStatus !== chip.id && (
                        <div className="absolute inset-0 border border-gray-200 rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full md:w-auto">
                <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Buscar contenido..." />
              </div>
            </div>
          </div>

          {/* GRID CON ANIMACIÓN DE PRESENCIA */}
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {sortedContent.map((content: any) => {
                const isCompleted = content.userProgresses?.some((p: any) => p.isCompleted);
                
                return (
                  <motion.div
                    key={content.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link href={`/dashboard/employee/courses/${courseId}/content/${content.id}`}>
                      <div className="group bg-white rounded-[2rem] border border-gray-200/50 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full overflow-hidden active:scale-[0.98]">
                        <div className="relative w-full aspect-video overflow-hidden bg-gray-100 border-b border-gray-50">
                          {isCompleted && (
                            <motion.div 
                              initial={{ rotate: -20, scale: 0 }}
                              animate={{ rotate: 0, scale: 1 }}
                              className="absolute top-3 left-3 z-10 w-8 h-8 rounded-lg flex items-center justify-center bg-green-500 text-white shadow-lg backdrop-blur-md"
                            >
                              <i className="bi bi-trophy-fill text-yellow-300"></i>
                            </motion.div>
                          )}
                          {content.imageUrl ? (
                            <img src={content.imageUrl} alt={content.title} className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${isCompleted ? "opacity-80" : ""}`} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300 text-4xl">
                              <i className="bi bi-card-image"></i>
                            </div>
                          )}
                        </div>

                        <div className="p-5 flex flex-col flex-1">
                          <h3 className="text-lg font-bold text-[#1d1d1f] mb-4 group-hover:text-[#0071e3] transition-colors line-clamp-2 h-14 flex items-center gap-2">
                            {content.title}
                            {isCompleted && <i className="bi bi-check-circle-fill text-green-500 text-sm"></i>}
                          </h3>

                          <div className="flex flex-wrap gap-2 mt-auto">
                            {content.summary && <span className="flex items-center gap-1.5 bg-gray-50 text-gray-600 text-[10px] font-bold px-2.5 py-1 rounded-md border border-gray-100"><i className="bi bi-file-text"></i> RESUMEN</span>}
                            {content.podcast && <span className="flex items-center gap-1.5 bg-blue-50 text-[#0071e3] text-[10px] font-bold px-2.5 py-1 rounded-md border border-blue-100"><i className="bi bi-headphones"></i> AUDIO</span>}
                            {content.quiz && <span className="flex items-center gap-1.5 bg-purple-50 text-purple-600 text-[10px] font-bold px-2.5 py-1 rounded-md border border-purple-100"><i className="bi bi-patch-question"></i> TEST</span>}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>
    </div>
  );
}