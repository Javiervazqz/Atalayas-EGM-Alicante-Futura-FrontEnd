'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation'; // Importante
import Link from 'next/link';
import Sidebar from '@/components/ui/Sidebar';
import { API_ROUTES } from '@/lib/utils';

export default function CourseDetailPage() {
  // CAMBIO AQUÍ: Si tu carpeta es [id], usa "id". 
  // Si tu carpeta es [courseId], entonces usa "courseId".
  const params = useParams();
  const id = params.id; 

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!id) return; // No hacer nada si no hay ID

      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Usamos "id" en lugar de "courseId"
        const res = await fetch(API_ROUTES.COURSES.GET_BY_ID(id as string), {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Error en la respuesta");

        const data = await res.json();
        
        // Verificación de estructura (por si viene anidado en .data o .course)
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
  }, [id]);

  if (loading) return (
    <div className="flex min-h-screen bg-[#f5f5f7]">
       <Sidebar role="EMPLOYEE" />
       <main className="flex-1 p-10 animate-pulse text-[#005596] font-bold">Cargando curso...</main>
    </div>
  );

  if (error || !course) return (
    <div className="flex min-h-screen bg-[#f5f5f7]">
       <Sidebar role="EMPLOYEE" />
       <main className="flex-1 p-10 text-red-500 font-bold">Error al cargar el curso. Verifica el ID o tu conexión.</main>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#f5f5f7]">
      <Sidebar role="EMPLOYEE" />
      <main className="flex-1 p-10">
        <Link href="/dashboard/employee/courses" className="text-[#0071e3] text-sm font-bold hover:underline mb-6 inline-block">
          ← Volver a mis cursos
        </Link>
        
        <div className="bg-white rounded-[32px] p-10 border border-gray-200 shadow-sm mb-8">
          <h1 className="text-4xl font-black text-[#1d1d1f] tracking-tight mb-4">{course?.title}</h1>
          <div className="flex gap-2">
            <span className="bg-blue-50 text-[#005596] text-[10px] font-black px-3 py-1 rounded-full uppercase">
              {course?.Content?.length || course?.content?.length || 0} Lecciones
            </span>
          </div>
        </div>

        <div className="grid gap-4">
          {/* Intentamos con Content (Prisma) o content (JSON estándar) */}
          {(course?.Content || course?.content)?.map((content: any, index: number) => (
            <Link 
              key={content.id} 
              href={`/dashboard/employee/courses/${id}/content/${content.id}`}
            >
              <div className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-[#d9ff00] hover:shadow-md transition-all flex items-center gap-6 group">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-[#005596] font-black group-hover:bg-[#d9ff00] transition-colors">
                  {content.order || index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[#1d1d1f] group-hover:text-[#005596] transition-colors">
                    {content.title}
                  </h3>
                  <p className="text-sm text-gray-400 line-clamp-1">{content.summary || 'Sin descripción disponible'}</p>
                </div>
                <div className="text-[#0071e3] font-bold text-sm">Empezar →</div>
              </div>
            </Link>
          ))}
          
          {/* Si no hay lecciones */}
          {(!course?.Content && !course?.content) && (
             <div className="p-10 bg-white rounded-2xl text-center text-gray-400 border border-dashed">
                No hay lecciones disponibles para este curso.
             </div>
          )}
        </div>
      </main>
    </div>
  );
}