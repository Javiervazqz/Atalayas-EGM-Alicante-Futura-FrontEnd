'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/ui/Sidebar';
import { API_ROUTES } from '@/lib/utils';
import SearchInput from '@/components/ui/Searchbar';

export default function AdminCourseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(API_ROUTES.COURSES.GET_BY_ID(id as string), {
          headers: { 'Authorization': `Bearer ${token}` }
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

  const filteredContents = course?.Content?.filter((c: any) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a: any, b: any) => a.order - b.order) || [];

  if (loading) return (
    <div className="flex min-h-screen bg-[#f5f5f7]">
      <Sidebar role="ADMIN" />
      <main className="flex-1 p-10 animate-pulse text-[#005596] font-bold">Cargando moderación...</main>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#f5f5f7]">
      <Sidebar role="ADMIN" />

      <main className="flex-1 h-screen overflow-y-auto">
        <div className="max-w-7xl mx-auto px-8 py-10">
          
          {/* BREADCRUMB */}
          <Link href="/dashboard/administrator/admin/courses" className="text-[#0071e3] text-sm font-semibold hover:underline mb-6 inline-block">
            ← Volver a Cursos
          </Link>

          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-[11px] font-black text-[#005596] uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
                Moderación de Contenidos
              </span>
              <h1 className="text-4xl font-black text-[#1d1d1f] mt-2 tracking-tight">
                {course?.title}
              </h1>
              <p className="text-[#86868b] mt-1">Gestiona las lecciones, cuestionarios y material multimedia.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Buscar lección..." />
              <Link 
                href={`/dashboard/administrator/admin/courses/${id}/content/new`}
                className="bg-[#1d1d1f] text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-black transition-all shadow-sm whitespace-nowrap"
              >
                + Añadir Lección
              </Link>
            </div>
          </div>

          {/* INFO CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-6 rounded-[24px] border border-gray-200 shadow-sm">
              <p className="text-[11px] font-bold text-[#86868b] uppercase">Empresa</p>
              <p className="text-lg font-bold text-[#1d1d1f]">{course?.isPublic ? '🌐 Público' : course?.Company?.name || 'Privado'}</p>
            </div>
            <div className="bg-white p-6 rounded-[24px] border border-gray-200 shadow-sm">
              <p className="text-[11px] font-bold text-[#86868b] uppercase">Categoría</p>
              <p className="text-lg font-bold text-[#1d1d1f]">{course?.category}</p>
            </div>
            <div className="bg-white p-6 rounded-[24px] border border-gray-200 shadow-sm">
              <p className="text-[11px] font-bold text-[#86868b] uppercase">Total Contenidos</p>
              <p className="text-lg font-bold text-[#1d1d1f]">{course?.Content?.length || 0} Unidades</p>
            </div>
          </div>

          {/* TABLA ESTILO APPLE */}
          <div className="bg-white rounded-[32px] border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#fbfbfd] border-b border-gray-100">
                    <th className="px-8 py-5 text-[11px] font-black text-[#86868b] uppercase tracking-widest w-16">Orden</th>
                    <th className="px-6 py-5 text-[11px] font-black text-[#86868b] uppercase tracking-widest">Título de la Lección</th>
                    <th className="px-6 py-5 text-[11px] font-black text-[#86868b] uppercase tracking-widest">Multimedia</th>
                    <th className="px-6 py-5 text-[11px] font-black text-[#86868b] uppercase tracking-widest text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredContents.length > 0 ? (
                    filteredContents.map((content: any) => (
                      <tr 
                        key={content.id}
                        // CLICK EN TODA LA FILA PARA IR AL DETALLE
                        onClick={() => router.push(`/dashboard/administrator/admin/courses/${id}/content/${content.id}`)}
                        className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                      >
                        <td className="px-8 py-5 font-mono text-sm text-[#86868b]">
                          {String(content.order).padStart(2, '0')}
                        </td>
                        <td className="px-6 py-5">
                          <div className="font-bold text-[#1d1d1f] group-hover:text-[#0071e3] transition-colors">{content.title}</div>
                          <div className="text-[11px] text-[#86868b] line-clamp-1 max-w-xs">{content.summary || 'Sin resumen'}</div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex gap-2">
                            {content.quiz && <span className="bg-orange-50 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded">QUIZ</span>}
                            {content.podcast && <span className="bg-purple-50 text-purple-600 text-[10px] font-bold px-2 py-0.5 rounded">AUDIO</span>}
                            {content.url && <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded">PORTADA</span>}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-4">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation(); // Evita que se dispare el click de la fila
                                router.push(`/dashboard/administrator/admin/courses/${id}/content/${content.id}/edit`);
                              }}
                              className="text-[#0071e3] text-xs font-bold hover:underline"
                            >
                              Editar
                            </button>
                            <button 
                              onClick={(e) => e.stopPropagation()} 
                              className="text-red-500 text-xs font-bold hover:underline"
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
                        <div className="text-[#86868b] font-medium">Este curso aún no tiene lecciones creadas.</div>
                        <Link 
                          href={`/dashboard/administrator/admin/courses/${id}/content/new`} 
                          className="text-[#0071e3] text-sm font-bold mt-2 inline-block hover:underline"
                        >
                          Crear la primera lección ahora
                        </Link>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}