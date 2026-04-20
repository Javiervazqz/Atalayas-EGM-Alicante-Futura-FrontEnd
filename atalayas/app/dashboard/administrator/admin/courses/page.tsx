"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/ui/Sidebar";
import Link from "next/link";
import { API_ROUTES } from "@/lib/utils";
import SearchInput from "@/components/ui/Searchbar";

export default function AdminCourses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"BASICO" | "ESPECIALIZADO">(
    "BASICO",
  );
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(API_ROUTES.COURSES.GET_ALL, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
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
    fetchData();
  }, []);

  const filtered = courses.filter((c) => {
    const matchesTab =
      activeTab === "BASICO"
        ? c.category?.toUpperCase() !== "ESPECIALIZADO"
        : c.category?.toUpperCase() === "ESPECIALIZADO";

    const matchesSearch = c.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <div
      className="flex min-h-screen bg-[#f5f5f7]"
      style={{ fontFamily: "'-apple-system', sans-serif" }}
    >
      <Sidebar role="ADMIN" />

      <main className="flex-1 p-10 overflow-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-bold text-[#1d1d1f] tracking-tight">
              Formación de Empresa
            </h1>
            <p className="text-[#86868b] mt-1 text-lg">
              Supervisa y gestiona el contenido formativo de tu organización.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Buscar cursos..."
            />

            <Link
              href="/dashboard/administrator/admin/courses/manage"
              className="bg-[#1d1d1f] text-white px-6 py-2.5 rounded-full font-semibold hover:bg-black transition-all shadow-md shrink-0 text-center"
            >
              <i className="bi bi-gear-fill mr-2"></i>
              Panel de Control
            </Link>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-8 border-b border-gray-200 mb-8">
          {["BASICO", "ESPECIALIZADO"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-4 text-sm font-semibold cursor-pointer transition-all ${
                activeTab === tab
                  ? "border-b-2 border-[#0071e3] text-[#0071e3]"
                  : "text-[#86868b] hover:text-[#1d1d1f]"
              }`}
            >
              {tab === "BASICO" ? "Onboarding" : "Especialización"}
            </button>
          ))}
        </div>

        {/* GRID DE CURSOS */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-80 bg-white rounded-[2rem] animate-pulse border border-gray-100"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-gray-200">
            <i className="bi bi-folder2-open text-4xl text-gray-300 mb-4 block"></i>
            <p className="text-[#86868b] font-medium text-lg">
              No hay cursos disponibles en esta categoría.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
            {filtered.map((course) => (
              <Link
                href={`/dashboard/administrator/admin/courses/${course.id}`}
              >
                <div
                  key={course.id}
                  className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 flex flex-col group hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                >
                  {/* IMAGEN DE PORTADA (Igual que en empleado) */}
                  <div className="h-44 w-full bg-[#f5f5f7] relative overflow-hidden">
                    {course.fileUrl ? (
                      <img
                        src={course.fileUrl}
                        alt={course.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://placehold.co/600x400/f5f5f7/86868b?text=Formación";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <i
                          className={`bi ${activeTab === "BASICO" ? "bi-book" : "bi-mortarboard"} text-4xl text-gray-300`}
                        ></i>
                      </div>
                    )}

                    {/* Badge de estado */}
                    {/*<div className="absolute top-4 left-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${
                          course.isPublic
                            ? "bg-green-500 text-white"
                            : "bg-white/90 text-[#1d1d1f] backdrop-blur-md"
                        }`}
                      >
                        {course.isPublic ? "Público" : "Empresa"}
                      </span>
                    </div>*/}
                  </div>

                  {/* CONTENIDO */}
                  <div className="p-7 flex flex-col flex-1">
                    <h3 className="text-[#1d1d1f] font-bold text-xl leading-tight mb-4 line-clamp-2 h-14">
                      {course.title}
                    </h3>

                    <div className="mt-auto space-y-4">
                      <div className="flex items-center justify-between text-[#86868b] text-sm mb-4">
                        <span className="flex items-center gap-1.5 font-medium">
                          <i className="bi bi-collection-play"></i>
                          {course._count?.Content || 0} Contenidos
                        </span>
                        {/*} <span className="flex items-center gap-1.5 font-medium">
                                                <i className="bi bi-people"></i>
                                                {course._count?.UserProgress || 0} Empleados
                                            </span>*/}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
