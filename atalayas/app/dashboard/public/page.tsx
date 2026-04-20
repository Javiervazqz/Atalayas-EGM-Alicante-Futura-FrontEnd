'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import { API_ROUTES } from '@/lib/utils';
import Link from 'next/link';

// Fuente estilo Apple
const appleFont =
  "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif";

// Iconos por tipo de servicio
const SERVICE_ICONS = {
  INFO: 'bi-info-circle-fill',
  BOOKING: 'bi-calendar-event-fill',
  ANNOUNCEMENT: 'bi-megaphone-fill',
  DEFAULT: 'bi-gear-fill'
};

// Colores por tipo de servicio
const SERVICE_COLORS = {
  INFO: 'text-blue-500 bg-blue-50',
  BOOKING: 'text-purple-500 bg-purple-50',
  ANNOUNCEMENT: 'text-orange-500 bg-orange-50',
  DEFAULT: 'text-gray-500 bg-gray-50'
};

export default function PublicDashboard() {
  const [courses, setCourses] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
        const [coursesRes, servicesRes] = await Promise.all([
          fetch(API_ROUTES.COURSES.GET_ALL, { headers }),
          fetch(API_ROUTES.SERVICES.GET_ALL, { headers })
        ]);
        const coursesData = await coursesRes.json();
        const servicesData = await servicesRes.json();
        
        // Simulamos filtrar solo lo marcado como público
        setCourses(Array.isArray(coursesData) ? coursesData.slice(0, 4) : []);
        setServices(Array.isArray(servicesData) ? servicesData : []);
      } catch (err) {
        console.error("❌ Error fetch data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Separar anuncios de servicios normales
  const announcements = services.filter(s => s.serviceType === 'ANNOUNCEMENT').slice(0, 3);
  const otherServices = services.filter(s => s.serviceType !== 'ANNOUNCEMENT').slice(0, 6);

  return (
    <div className="flex min-h-screen bg-[#f5f5f7]" style={{ fontFamily: appleFont }}>

      <main className="flex-1 overflow-y-auto w-full">
        
        {/* HEADER */}
        <div className="bg-white border-b border-black/5 py-8 md:py-10 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-widest mb-3">
                  Atalayas EGM • Portal Público
                </span>
                <h1 className="text-3xl md:text-5xl font-extrabold text-[#1d1d1f] tracking-tighter leading-tight">
                  Bienvenido al <br className="hidden md:block"/> Polígono Industrial
                </h1>
                <p className="text-base text-gray-500 mt-2 font-medium">
                  Explora noticias, servicios y formación en abierto.
                </p>
              </div>
              
              <div className="flex gap-3 shrink-0">
                 <button className="px-6 py-3 bg-black text-white rounded-2xl font-bold text-xs hover:scale-105 transition-transform shadow-lg shadow-black/10">
                    Sobre Atalayas EGM
                 </button>
                 <button className="px-6 py-3 bg-white text-black rounded-2xl border border-gray-200 font-bold text-xs hover:bg-gray-50 transition-colors">
                    Mapa de Empresas
                 </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8 md:px-10 md:py-12">
          <div className="content-layout">
            
            {/* COLUMNA IZQUIERDA: NOVEDADES Y SERVICIOS (70%) */}
            <div className="lg:col-span-8 space-y-12">
              
              {/* ANUNCIOS DESTACADOS - Estilo "Revista" */}
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-extrabold text-[#1d1d1f] tracking-tight flex items-center gap-3">
                     <i className="bi bi-megaphone-fill text-orange-500"></i> Últimos Anuncios
                  </h2>
                  <Link href="/news" className="text-blue-600 text-sm font-bold hover:underline">Ver todo →</Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {loading ? [1,2,3].map(i => <div key={i} className="h-64 bg-white rounded-3xl animate-pulse border border-black/5" />) : 
                    announcements.length === 0 ? <p className="text-gray-500 text-sm md:col-span-3 py-10 text-center bg-white rounded-3xl border border-black/5">No hay anuncios recientes.</p> :
                    announcements.map((news) => (
                      <article key={news.id} className="group flex flex-col bg-white border border-black/5 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
                        <div className="h-40 bg-gray-100 overflow-hidden shrink-0 relative">
                          {news.mediaUrl ? (
                            <img src={news.mediaUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                               <i className="bi bi-image text-gray-300 text-3xl"></i>
                            </div>
                          )}
                          <div className="absolute top-4 left-4 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-white text-[9px] font-black uppercase tracking-wider">Hoy</div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                          <h3 className="text-base font-bold text-[#1d1d1f] mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">{news.title}</h3>
                          <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed mb-4 flex-1">{news.description}</p>
                          <Link href="#" className="text-blue-600 text-[11px] font-bold hover:underline">Leer más...</Link>
                        </div>
                      </article>
                    ))
                  }
                </div>
              </section>

              {/* OTROS SERVICIOS - Estilo "Widget" */}
              <section className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm">
                <h3 className="text-xl font-extrabold text-[#1d1d1f] tracking-tight mb-8">Servicios públicos</h3>
                
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[1,2,3,4,5,6].map(i => <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />)}
                    </div>
                ) : otherServices.length === 0 ? <p className="text-gray-500 text-sm text-center py-6">No hay servicios disponibles.</p> : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {otherServices.map(service => {
                            const type = service.serviceType as keyof typeof SERVICE_ICONS;
                            const icon = SERVICE_ICONS[type] || SERVICE_ICONS.DEFAULT;
                            const color = SERVICE_COLORS[type] || SERVICE_COLORS.DEFAULT;
                            return (
                                <button key={service.id} className="w-full flex items-center gap-4 p-4 bg-[#f5f5f7] rounded-2xl hover:bg-black hover:text-white hover:-translate-y-1 transition-all group">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color} transition-colors group-hover:bg-white/10 group-hover:text-white`}>
                                      <i className="bi bi-suitcase-lg-fill text-blue-500"></i>                                    </div>
                                    <div className="text-left">
                                        <span className="text-[9px] font-black uppercase text-gray-400 group-hover:text-gray-200">{type}</span>
                                        <p className="text-sm font-bold leading-tight line-clamp-2">{service.title}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
              </section>
            </div>

            {/* COLUMNA DERECHA: CURSOS DESTACADOS (30%) */}
            <aside className="lg:col-span-4 space-y-10">
              <section className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-extrabold text-[#1d1d1f]">Formación Abierta</h3>
                    <i className="bi bi-bookmark-fill text-blue-600"></i>
                </div>
                
                {loading ? <div className="h-40 bg-gray-100 rounded-2xl animate-pulse" /> : 
                  courses.length === 0 ? <p className="text-gray-500 text-sm text-center py-6">No hay cursos en abierto.</p> : (
                    <div className="space-y-4">
                        {courses.map(course => (
                            <div key={course.id} className="group relative overflow-hidden rounded-3xl bg-[#f5f5f7] p-6 border border-gray-100 hover:border-blue-100 transition-colors">
                                <div className="flex justify-between items-center mb-3">
                                    <div className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-[9px] font-black uppercase">Gratis</div>
                                    <span className="text-[11px] text-gray-400 font-medium">🌐 Público</span>
                                </div>
                                <h4 className="font-bold text-sm text-[#1d1d1f] mb-1 group-hover:text-blue-600 transition-colors leading-tight">{course.title}</h4>
                                <p className="text-[10px] text-gray-500 mb-4 font-medium">Por Alicante Futura</p>
                                <Link href={`/dashboard/public/courses/${course.id}`} className="block text-center py-2.5 bg-black text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-lg shadow-black/10">
                                    Comenzar Lección
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
              </section>
            </aside>
          </div>
        </div>
      </main>

      <style jsx>{`
        .content-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
        }

        @media (min-width: 1024px) {
          .content-layout {
            grid-template-columns: repeat(12, minmax(0, 1fr));
            gap: 40px;
          }
        }
      `}</style>
    </div>
  );
}