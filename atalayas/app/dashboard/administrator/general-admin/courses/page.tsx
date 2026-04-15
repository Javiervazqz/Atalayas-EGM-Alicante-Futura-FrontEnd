'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/ui/Sidebar';
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
    <div className="flex min-h-screen bg-background font-sans">
      <Sidebar role="GENERAL_ADMIN" />

      <main className="flex-1 p-6 lg:p-10 overflow-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">Catálogo Maestro</h1>
            <p className="text-muted-foreground mt-2 text-base">Configura la oferta formativa global del sistema.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder='Buscar cursos...'
            />

            <Link
              href="/dashboard/administrator/general-admin/courses/manage"
              className="bg-secondary text-secondary-foreground w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold hover:opacity-90 transition-opacity shadow-sm shrink-0 text-center"
            >
              Vista Global
            </Link>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-8 border-b border-border mb-8 overflow-x-auto no-scrollbar">
          {['BASICO', 'ESPECIALIZADO'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-4 text-sm font-bold cursor-pointer transition-all whitespace-nowrap ${activeTab === tab
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
              <div key={i} className="h-64 bg-card rounded-3xl animate-pulse border border-border" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-border shadow-sm">
            <div className="text-4xl text-muted-foreground/50 mb-4"><i className="bi bi-journal-x"></i></div>
            <p className="text-muted-foreground font-medium">No se han encontrado cursos en esta sección.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((course) => (
              <div key={course.id} className="bg-card rounded-3xl p-6 shadow-sm border border-border flex flex-col justify-between group hover:shadow-xl hover:border-primary transition-all duration-300">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${activeTab === 'BASICO' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                      {activeTab === 'BASICO' ? 'Onboarding' : 'Especialización'}
                    </span>
                  </div>

                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-5 transition-colors ${activeTab === 'BASICO' ? 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground' : 'bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-secondary-foreground'}`}>
                    {activeTab === 'BASICO' ? (
                      <i className="bi bi-book"></i>
                    ) : (
                      <i className="bi bi-mortarboard"></i>
                    )}
                  </div>

                  <h3 className="text-foreground font-bold text-lg leading-tight mb-6 line-clamp-2 min-h-[3rem] group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                </div>
                <Link
                  href={`/dashboard/administrator/general-admin/courses/${course.id}`}
                  className="w-full py-3 bg-primary text-primary-foreground text-sm font-bold rounded-xl text-center hover:opacity-90 transition-opacity shadow-sm"
                >
                  Gestionar Curso
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}