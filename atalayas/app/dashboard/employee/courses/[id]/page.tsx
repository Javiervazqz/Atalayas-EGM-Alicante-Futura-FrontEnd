'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/ui/Sidebar';
import SearchInput from '@/components/ui/Searchbar'; 
import { API_ROUTES } from '@/lib/utils';

export default function CourseDetailPage() {
  const params = useParams();
  // Corregimos nombres y acceso (Next.js pone los parámetros directamente en params)
  const courseId = params.id as string; 

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) return;
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Usamos courseId que es el parámetro que viene de la URL
        const res = await fetch(API_ROUTES.COURSES.GET_BY_ID(courseId), {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Error en la respuesta");
        const data = await res.json();
        
        // Mapeo flexible según cómo responda tu backend
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
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background font-sans">
      <Sidebar role="EMPLOYEE" />
      
      <main className="flex-1 h-screen overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12">
          
          <div className="mb-10">
            <Link href="/dashboard/employee/courses" className="text-secondary text-sm font-bold hover:opacity-80 transition-opacity mb-6 inline-flex items-center gap-2">
              <i className="bi bi-arrow-left"></i> Mis cursos
            </Link>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
                  {loading ? "Cargando curso..." : course?.title}
                </h1>
                {!loading && (
                  <span className="inline-flex items-center gap-1.5 mt-3 bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                    <i className="bi bi-stack"></i> {contentList.length} Lecciones
                  </span>
                )}
              </div>
              <SearchInput 
                value={searchQuery} 
                onChange={setSearchQuery} 
                placeholder='Buscar lección...' 
              />
            </div>
          </div>

          {loading ? (
            /* ESQUELETOS DE CARGA */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-card rounded-3xl border border-border animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {sortedContent.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedContent.map((content: any) => (
                    <Link 
                      key={content.id} 
                      href={`/dashboard/employee/courses/${id}/content/${content.id}`}
                    >
                      <div className="group bg-card rounded-3xl border border-border shadow-sm hover:shadow-xl hover:border-secondary transition-all duration-300 flex flex-col h-full overflow-hidden active:scale-95">
                        
                        {/* IMAGEN DE LA LECCIÓN */}
                        <div className="relative w-full aspect-video overflow-hidden bg-muted border-b border-border flex items-center justify-center">
                          <div className="absolute top-3 left-3 z-10 bg-background/90 backdrop-blur-md w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-foreground shadow-sm">
                            {content.order}
                          </div>
                          {content.imageUrl ? (
                            <img
                              src={content.imageUrl}
                              alt={content.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <i className="bi bi-image text-4xl text-muted-foreground/30"></i>
                          )}
                        </div>

                        {/* INFO DE LA LECCIÓN */}
                        <div className="p-6 flex flex-col flex-1">
                          <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-secondary transition-colors line-clamp-2 h-14 overflow-hidden">
                            {content.title}
                          </h3>
                          
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-6">
                            {content.summary || "Sin descripción disponible para esta lección."}
                          </p>

                          <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                              Lección {content.order}
                            </span>
                            <span className="text-secondary font-bold text-xs group-hover:translate-x-1 transition-transform flex items-center gap-1">
                              Empezar <i className="bi bi-arrow-right"></i>
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                /* ESTADO VACÍO */
                <div className="py-20 text-center bg-card rounded-3xl border border-dashed border-border">
                  <div className="text-4xl mb-4 text-muted-foreground/50"><i className="bi bi-search"></i></div>
                  <h2 className="text-xl font-bold text-foreground mb-2">No encontramos lecciones</h2>
                  <p className="text-muted-foreground text-sm">Intenta con otro término de búsqueda o revisa más tarde.</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}