"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/ui/Sidebar";
import SearchInput from "@/components/ui/Searchbar"; // Asegúrate de que la ruta sea correcta
import { API_ROUTES } from "@/lib/utils";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";

export default function EmployeeCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<
    "TODOS" | "BASICO" | "ESPECIALIZADO"
  >("TODOS");
  const [searchQuery, setSearchQuery] = useState("");
  const searchParams = useSearchParams();
  const fromTaskId = searchParams.get("fromTask");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(API_ROUTES.COURSES.GET_ALL, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();

        // Normalizamos la data si viene envuelta en un objeto
        const rawCourses = Array.isArray(data) ? data : data.courses || [];

        const sortedDataCourses = rawCourses.sort((a: any, b: any) => {
          const titleA = a.title.trim().toLowerCase();
          const titleB = b.title.trim().toLowerCase();
          return titleA.localeCompare(titleB, undefined, {
            numeric: true,
            sensitivity: "base",
          });
        });

        setCourses(sortedDataCourses);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Lógica de autocompletado de tarea (Onboarding)
  useEffect(() => {
    const autoConfirmTask = async () => {
      if (fromTaskId) {
        try {
          const token = localStorage.getItem("token");
          await fetch(API_ROUTES.ONBOARDING.TOGGLE, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ taskId: fromTaskId, done: true }),
          });
        } catch (err) {
          console.error("Error al autocompletar:", err);
        }
      }
    };
    autoConfirmTask();
  }, [fromTaskId]);

  // Filtrado combinado: Tab + Buscador
  const filtered = courses.filter((c) => {
    const matchesSearch = c.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesTab =
      selectedTab === "TODOS"
        ? true
        : selectedTab === "BASICO"
          ? c.category?.toUpperCase() !== "ESPECIALIZADO"
          : c.category?.toUpperCase() === "ESPECIALIZADO";

    return matchesSearch && matchesTab;
  });

  if (loading)
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );

  return (
    <div
      className="flex min-h-screen bg-[#f5f5f7]"
      style={{
        fontFamily:
          "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif",
      }}
    >
      <Sidebar role="EMPLOYEE" />

      <main className="flex-1 h-screen overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-12">
          {/* BANNER COMPACTO (Estilo Servicios) */}
          <header className="bg-white rounded-[2rem] p-8 mb-8 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold text-[#1d1d1f] tracking-tight">
                Cursos disponibles
              </h1>
              <p className="text-gray-500 text-sm font-medium mt-1">
                Gestiona tus cursos de onboarding y especialización.
              </p>
            </div>
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Buscar cursos..."
            />
          </header>

          {/* CHIPS DE FILTRADO (Estilo Servicios) */}
          <div className="flex items-center gap-3 mb-10 overflow-x-auto pb-2 no-scrollbar">
            {["TODOS", "BASICO", "ESPECIALIZADO"].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab as any)}
                className={`relative shrink-0 px-6 py-2 rounded-full text-sm font-bold transition-all ${
                  selectedTab === tab
                    ? "text-white"
                    : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {tab === "TODOS" ? (
                    "Todos"
                  ) : tab === "BASICO" ? (
                    <>
                      <i className="bi bi-book text-blue-400"></i> Onboarding
                    </>
                  ) : (
                    <>
                      <i className="bi bi-mortarboard text-purple-400"></i>{" "}
                      Especialización
                    </>
                  )}
                </span>
                {selectedTab === tab && (
                  <motion.div
                    layoutId="pill-bg-courses"
                    className="absolute inset-0 bg-[#1d1d1f] rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* GRID DE CURSOS (Estilo Servicios con Imagen) */}
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((course) => (
                <motion.div
                  key={course.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  <Link href={`/dashboard/employee/courses/${course.id}`}>
                    <div className="group bg-white rounded-[2rem] border border-gray-200/50 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full overflow-hidden active:scale-[0.98]">
                      {/* IMAGEN DEL CURSO (Usando fileUrl) */}
                      <div className="relative w-full aspect-video overflow-hidden bg-gray-100 border-b border-gray-100">
                        {course.fileUrl ? (
                          <img
                            src={course.fileUrl}
                            alt={course.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300 text-4xl">
                            <i className="bi bi-journal-bookmark"></i>
                          </div>
                        )}
                        {/* Badge flotante de categoría */}
                        {/*<div className="absolute top-4 left-4">
                          <span className="text-[10px] font-black uppercase tracking-widest text-white bg-black/50 backdrop-blur-md px-3 py-1 rounded-full">
                            {course.category || "General"}
                          </span>
                        </div>*/}
                      </div>

                      <div className="p-6 flex flex-col flex-1">
                        <h3 className="text-lg font-bold text-[#1d1d1f] mb-4 group-hover:text-blue-600 transition-colors line-clamp-2 h-14 overflow-hidden">
                          {course.title}
                        </h3>

                        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                          <span className="text-[11px] font-bold text-gray-400 flex items-center gap-2">
                            {course.category?.toUpperCase() ===
                            "ESPECIALIZADO" ? (
                              <>
                                <i className="bi bi-star-fill text-yellow-400"></i>
                                Especialización
                              </>
                            ) : (
                              <>
                                <i className="bi bi-check-circle-fill text-green-400"></i>{" "}
                                Onboarding
                              </>
                            )}
                          </span>
                          <span className="text-[11px] font-bold text-gray-400 flex items-center gap-2">
                            <i className="bi bi-collection-play"></i>
                            {course._count?.Content || 0} Contenidos
                          </span>{" "}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* ESTADO VACÍO */}
          {!loading && filtered.length === 0 && (
            <div className="text-center py-20">
              <i className="bi bi-search text-4xl text-gray-200 mb-4 block"></i>
              <p className="text-gray-400 font-medium">
                No se encontraron cursos que coincidan con tu búsqueda.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
