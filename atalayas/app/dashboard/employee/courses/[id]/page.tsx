'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/ui/Sidebar';
import SearchInput from '@/components/ui/Searchbar';
import { API_ROUTES } from '@/lib/utils';
import { motion } from "framer-motion";
import ReactMarkdown from 'react-markdown';

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

  if (loading) return (
    <div className="flex h-screen bg-background items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
        />
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background font-sans text-foreground">
      <Sidebar role="EMPLOYEE" />

      <main className="flex-1 h-screen overflow-y-auto no-scrollbar">
        {/* Header Compacto */}
        <div className="bg-card/40 border-b border-border py-6 lg:py-8 backdrop-blur-md sticky top-0 z-30">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <Link href="/dashboard/employee/courses" className="text-muted-foreground text-[11px] font-black uppercase tracking-widest hover:text-primary transition-colors mb-4 inline-flex items-center gap-1.5">
              <i className="bi bi-chevron-left"></i> Mis cursos
            </Link>

            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-foreground truncate">
                  {course?.title}
                </h1>
                <div className="mt-1 hidden md:block">
                  <ReactMarkdown
                    components={{
                      p: ({ ...props }) => <p className="text-muted-foreground text-sm line-clamp-1 opacity-70" {...props} />
                    }}
                  >
                    {course?.description}
                  </ReactMarkdown>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2 px-4 py-2 bg-background/50 rounded-2xl border border-border">
                <i className="bi bi-stack text-primary text-sm"></i>
                <span className="text-sm font-bold">{contentList.length}</span>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">Lecciones</span>
              </div>
            </div>
          </div>
        </div>

        {/* Grid de Contenidos */}
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-10">
          <div className="mb-8 flex items-center gap-3">
            <div className="w-1.5 h-6 bg-primary rounded-full" />
            <h2 className="text-lg font-black uppercase tracking-wider">Contenido del curso</h2>
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
                      <div className="absolute top-3 right-3 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
                        🏆
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