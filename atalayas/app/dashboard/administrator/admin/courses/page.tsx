"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/ui/Sidebar";
import Link from "next/link";
import { API_ROUTES } from "@/lib/utils";
import SearchInput from "@/components/ui/Searchbar";
import PageHeader from '@/components/ui/pageHeader';

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

    const filtered = courses.filter(c => {
        const matchesTab = activeTab === 'BASICO'
            ? (c.category?.toUpperCase() !== 'ESPECIALIZADO')
            : (c.category?.toUpperCase() === 'ESPECIALIZADO');
        const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    return (
        <div className="flex min-h-screen bg-background font-sans">
            <Sidebar role="ADMIN" />

            <main className="flex-1 overflow-auto flex flex-col relative">
                <PageHeader 
                    title="Formación de Empresa"
                    description="Supervisa y gestiona los itinerarios formativos de tu equipo."
                    icon={<i className="bi bi-mortarboard-fill"></i>}
                    action={
                        <Link href="/dashboard/administrator/admin/courses/manage"
                            className="bg-secondary text-secondary-foreground px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all shadow-sm flex items-center justify-center gap-2"
                        >
                            <i className="bi bi-gear-wide-connected"></i> Gestionar Contenido
                        </Link>
                    }
                />

                <div className="p-6 lg:p-10 flex-1 w-full max-w-7xl mx-auto">
                    {/* Barra de herramientas integrada */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 bg-card p-4 rounded-2xl border border-border shadow-sm">
                        <div className="flex gap-2">
                            {['BASICO', 'ESPECIALIZADO'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                                        activeTab === tab
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-muted-foreground hover:bg-muted'
                                    }`}
                                >
                                    {tab === 'BASICO' ? 'Onboarding' : 'Especialización'}
                                </button>
                            ))}
                        </div>
                        <div className="relative w-full md:w-80">
                            <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"></i>
                            <input 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar cursos..."
                                className="w-full bg-background border border-input rounded-xl pl-11 pr-4 py-2 text-sm outline-none focus:ring-1 focus:ring-primary transition-all font-medium"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-64 bg-card rounded-[2rem] animate-pulse border border-border" />
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-20 bg-card rounded-[2rem] border border-dashed border-border shadow-sm">
                            <i className="bi bi-journal-x text-5xl text-muted-foreground/30 mb-4 block"></i>
                            <h3 className="text-xl font-bold text-foreground">Sin resultados</h3>
                            <p className="text-muted-foreground text-sm">No hay cursos disponibles en esta categoría.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filtered.map((course) => (
                                <div key={course.id} className="bg-card rounded-[2rem] p-6 shadow-sm border border-border flex flex-col group hover:shadow-xl hover:border-primary/30 transition-all duration-300">
                                    <div className="mb-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-4 ${
                                            activeTab === 'BASICO' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
                                        }`}>
                                            <i className={activeTab === 'BASICO' ? "bi bi-book" : "bi bi-award"}></i>
                                        </div>
                                        <h3 className="text-foreground font-bold text-lg leading-tight line-clamp-2 min-h-[3.5rem]">
                                            {course.title}
                                        </h3>
                                    </div>
                                    <Link href={`/dashboard/administrator/admin/courses/${course.id}`}
                                        className="mt-auto w-full py-3 bg-muted text-foreground hover:bg-secondary hover:text-secondary-foreground text-sm font-bold rounded-xl text-center transition-all"
                                    >
                                        Ver Contenido
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
