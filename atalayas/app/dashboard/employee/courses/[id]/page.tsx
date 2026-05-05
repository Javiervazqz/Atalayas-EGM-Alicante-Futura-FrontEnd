'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/ui/Sidebar';
import PageHeader from '@/components/ui/pageHeader';
import { API_ROUTES } from '@/lib/utils';
import { motion } from "framer-motion";

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const cleanMarkdown = (text: string): string => {
    if (!text) return "";
    return text
      .replace(/\*\*?([^*]+)\*\*?/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/^- /gm, "")
      .replace(/#/g, "")
      .trim();
  };

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) return;
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        const res = await fetch(API_ROUTES.COURSES.GET_BY_ID(courseId), {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!res.ok) throw new Error("Error");
        const data = await res.json();
        setCourse(data.course || data.data || data);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [courseId]);

  const contentList = course?.Content || course?.content || [];
  const filteredContent = contentList.filter((c: any) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const sortedContent = [...filteredContent].sort((a, b) => a.order - b.order);

  if (error) return (
    <div className="flex min-h-screen bg-background font-sans">
      <Sidebar role="EMPLOYEE" />
      <main className="flex-1 p-10 flex flex-col items-center justify-center">
        <div className="bg-destructive/10 p-8 rounded-3xl border border-destructive/20 text-center max-w-md">
          <i className="bi bi-exclamation-triangle text-4xl text-destructive mb-4 block"></i>
          <h2 className="text-destructive font-bold text-xl mb-2">Error al cargar el curso</h2>
          <p className="text-muted-foreground text-sm">No se ha podido conectar con el servidor. Por favor, vuelve a intentarlo más tarde.</p>
        </div>
      </main>
    </div>
  );

  // Pantalla de carga limpia y sin el recuadro blanco
  if (loading) return (
    <div className="flex min-h-screen bg-background items-center justify-center font-sans">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-md" />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background font-sans text-foreground">
      <Sidebar role="EMPLOYEE" />

      <main className="flex-1 h-screen overflow-y-auto no-scrollbar relative">
        
        {/* BANNER UNIFICADO - Va SIEMPRE a la ruta de cursos, sin usar el historial */}
        <PageHeader 
          title={course?.title || "Cargando curso..."}
          description={cleanMarkdown(course?.description) || "Detalles del curso"}
          icon={<i className="bi bi-journal-bookmark-fill"></i>}
          backUrl="/dashboard/employee/courses" 
        />

        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-10">
          
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-primary rounded-full" />
              <h2 className="text-lg font-black uppercase tracking-wider">Contenido del curso</h2>
            </div>
            
            <div className="shrink-0 flex items-center gap-2 px-4 py-2 bg-card rounded-2xl border border-border shadow-sm w-fit">
              <i className="bi bi-stack text-primary text-sm"></i>
              <span className="text-sm font-bold">{contentList.length}</span>
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">Lecciones</span>
            </div>
          </div>

          {sortedContent.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedContent.map((content: any) => (
                <Link key={content.id} href={`/dashboard/employee/courses/${courseId}/content/${content.id}`}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="group relative h-full bg-card rounded-[1.5rem] border border-border overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/40 transition-all duration-300 flex flex-col"
                  >

                    <div className="relative aspect-video overflow-hidden bg-muted">
                      {content.imageUrl ? (
                        <img src={content.imageUrl} alt={content.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted/30">
                          <i className="bi bi-play-circle text-3xl text-primary/20"></i>
                        </div>
                      )}
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="text-base font-bold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                        {content.title}
                      </h3>

                      {content.summary && (
                        <p className="text-[12px] text-muted-foreground line-clamp-2 mb-4 leading-relaxed font-medium">
                          {cleanMarkdown(content.summary)}
                        </p>
                      )}

                      <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Contenido disponible</span>
                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                          <i className="bi bi-arrow-right text-xs"></i>
                        </div>
                      </div>
                    </div>
                    {content.isCompleted && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md">
                        <i className="bi bi-check-lg"></i>
                      </div>
                    )}
                  </motion.div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-muted/10 rounded-[2rem] border border-dashed border-border">
              <p className="text-muted-foreground font-bold">No hay contenido aún.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}