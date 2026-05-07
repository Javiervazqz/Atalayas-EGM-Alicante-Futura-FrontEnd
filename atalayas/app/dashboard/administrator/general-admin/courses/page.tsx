'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import PageHeader from '@/components/ui/pageHeader'; // Importamos el header
import Link from 'next/link';
import { API_ROUTES } from '@/lib/utils';
import SearchInput from '@/components/ui/Searchbar';

export default function GeneralAdminCourses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'BASICO' | 'ESPECIALIZADO'>('BASICO');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(API_ROUTES.COURSES.GET_ALL, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        setCourses(Array.isArray(data) ? data : []);
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
    // bg-muted/30 para dar contraste premium
    <div className="flex min-h-screen bg-muted/30 font-sans text-foreground transition-colors duration-300">
      <Sidebar role="GENERAL_ADMIN" />

      <main className="flex-1 overflow-auto flex flex-col relative">
        {/* ── HEADER PREMIUM ── */}
        <PageHeader 
          title="Catálogo Maestro"
          description="Configura la oferta formativa global del sistema."
          icon={<i className="bi bi-journal-bookmark"></i>}
          action={
            <div className="flex items-center gap-4">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder='Buscar cursos...'
              />
              <Link
                href="/dashboard/administrator/general-admin/courses/manage"
                className="bg-secondary text-white px-6 py-2.5 rounded-xl font-bold hover:opacity-90 transition-all shadow-sm shrink-0 text-xs uppercase tracking-wider"
              >
                Vista Global
              </Link>
            </div>
          }
        />

        <div className="p-6 lg:p-10 flex-1 max-w-7xl mx-auto w-full">
          
          {/* TABS (Ajustados para el look premium) */}
          <div className="flex gap-8 border-b border-border/60 mb-8 overflow-x-auto no-scrollbar">
            {['BASICO', 'ESPECIALIZADO'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`pb-4 text-xs font-black uppercase tracking-[0.15em] cursor-pointer transition-all whitespace-nowrap ${activeTab === tab
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                {tab === 'BASICO' ? 'Onboarding' : 'Especialización'}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-64 bg-card rounded-[24px] animate-pulse border border-border/60" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 bg-card rounded-[24px] border border-dashed border-border/60 shadow-sm">
              <div className="text-4xl text-muted-foreground/30 mb-4"><i className="bi bi-journal-x"></i></div>
              <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">No se han encontrado cursos en esta sección</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((course) => (
                <div 
                  key={course.id} 
                  className="bg-card rounded-[24px] p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.04)] border border-border/60 flex flex-col justify-between group hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 ease-out"
                >
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider border ${activeTab === 'BASICO' ? 'bg-primary/5 text-primary border-primary/10' : 'bg-secondary/5 text-secondary border-secondary/10'}`}>
                        {activeTab === 'BASICO' ? 'Onboarding' : 'Especialización'}
                      </span>
                    </div>

                    <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center text-xl mb-5 transition-all duration-300 border border-border/50 ${activeTab === 'BASICO' ? 'bg-muted text-primary group-hover:bg-primary group-hover:text-white shadow-sm' : 'bg-muted text-secondary group-hover:bg-secondary group-hover:text-white shadow-sm'}`}>
                      {activeTab === 'BASICO' ? (
                        <i className="bi bi-book"></i>
                      ) : (
                        <i className="bi bi-mortarboard"></i>
                      )}
                    </div>

                    <h3 className="text-foreground font-bold text-base leading-tight mb-6 line-clamp-2 min-h-10 group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>
                  </div>

                  <Link
                    href={`/dashboard/administrator/general-admin/courses/${course.id}`}
                    className="w-full py-3 bg-primary text-white text-[11px] font-black uppercase tracking-widest rounded-xl text-center hover:opacity-90 transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                  >
                    Gestionar Curso
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