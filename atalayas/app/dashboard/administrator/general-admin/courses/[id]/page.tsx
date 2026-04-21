'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/ui/Sidebar';
import PageHeader from '@/components/ui/pageHeader';
import { API_ROUTES } from '@/lib/utils';
import SearchInput from '@/components/ui/Searchbar';

export default function GAdminCourseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(API_ROUTES.COURSES.GET_BY_ID(id as string), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setCourse(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCourse();
  }, [id]);

  const filteredContents = course?.Content?.filter((c: any) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a: any, b: any) => a.order - b.order) || [];

  const handleDelete = async () => {
    if (!selectedContent) return;
    setDeletingId(selectedContent.id);
    try {
      const token = localStorage.getItem('token');
      await fetch(API_ROUTES.CONTENT.GET_BY_ID(selectedContent.id), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourse((prev: any) => ({
        ...prev,
        Content: prev.Content.filter((c: any) => c.id !== selectedContent.id),
      }));
    } finally {
      setDeletingId(null);
      setShowDeleteModal(false);
      setSelectedContent(null);
    }
  };

  if (loading) return (
    <div className="flex min-h-screen bg-background items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">Sincronizando Currículo...</p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-muted/30 font-sans text-foreground transition-colors duration-300">
      <Sidebar role="GENERAL_ADMIN" />

      <main className="flex-1 overflow-auto flex flex-col relative">
        <PageHeader 
          title={course?.title || "Detalle del Curso"}
          description={`Gestionando ${filteredContents.length} unidades de aprendizaje para ${course?.Company?.name || 'Contenido Global'}.`}
          icon={<i className="bi bi-journal-bookmark-fill"></i>}
          backUrl="/dashboard/administrator/general-admin/courses"
          action={
            <div className="flex items-center gap-4">
               <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Buscar lección..." />
               <Link
                href={`/dashboard/administrator/general-admin/courses/${id}/content/new`}
                className="bg-secondary text-white px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-secondary/20 flex items-center gap-2"
              >
                <i className="bi bi-robot text-lg"></i> Generar con IA
              </Link>
            </div>
          }
        />

        <div className="p-6 lg:p-10 space-y-10 max-w-7xl mx-auto w-full">
          
          {/* STATS GRID PREMIUM */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { label: 'Unidades', value: course?.Content?.length || 0, icon: 'bi-layers', color: 'text-primary' },
              { label: 'PDFs', value: course?.Content?.filter((c: any) => c.url)?.length || 0, icon: 'bi-file-earmark-pdf', color: 'text-secondary' },
              { label: 'Quizzes', value: course?.Content?.filter((c: any) => c.quiz)?.length || 0, icon: 'bi-patch-question', color: 'text-indigo-500' },
              { label: 'Audios', value: course?.Content?.filter((c: any) => c.podcast)?.length || 0, icon: 'bi-mic', color: 'text-emerald-500' },
            ].map((stat) => (
              <div key={stat.label} className="bg-card border border-border/60 rounded-[24px] p-6 shadow-sm flex flex-col items-center text-center group hover:border-primary/30 transition-all">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-4 bg-muted/50 ${stat.color} group-hover:scale-110 transition-transform`}>
                  <i className={`bi ${stat.icon}`}></i>
                </div>
                <p className="text-3xl font-black text-foreground tracking-tighter">{stat.value}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* LISTADO DE LECCIONES */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Estructura del curso</h2>
              <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-1 rounded-md">Orden ascendente</span>
            </div>

            {filteredContents.length === 0 ? (
              <div className="bg-card rounded-[32px] border border-dashed border-border/60 p-20 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center text-muted-foreground/20 text-4xl mb-6 shadow-inner">
                   <i className="bi bi-journal-x"></i>
                </div>
                <p className="text-foreground font-black text-xs uppercase tracking-widest">Sin contenidos registrados</p>
                <p className="text-muted-foreground text-xs mt-2 mb-8">Empieza a construir el curso usando nuestro asistente de IA.</p>
                <Link href={`/dashboard/administrator/general-admin/courses/${id}/content/new`} className="bg-primary text-white px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-all">
                  Crear primera unidad
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredContents.map((content: any) => (
                  <div
                    key={content.id}
                    onClick={() => router.push(`/dashboard/administrator/general-admin/courses/${id}/content/${content.id}`)}
                    className="group bg-card rounded-[24px] border border-border/60 p-5 hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex items-center gap-6"
                  >
                    <div className="w-14 h-14 bg-muted/50 rounded-2xl flex items-center justify-center font-mono text-lg font-black text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all shrink-0 shadow-inner">
                      {String(content.order).padStart(2, '0')}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors truncate mb-1">{content.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">{content.summary || 'Sin descripción redactada...'}</p>
                    </div>
                    
                    <div className="hidden md:flex items-center gap-2 shrink-0">
                      {content.url && <span className="bg-secondary/10 text-secondary text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg border border-secondary/20">PDF</span>}
                      {content.quiz && <span className="bg-indigo-500/10 text-indigo-600 text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg border border-indigo-500/20">Quiz</span>}
                      {content.podcast && <span className="bg-emerald-500/10 text-emerald-600 text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg border border-emerald-500/20">Audio</span>}
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0 pl-4 border-l border-border/60" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/administrator/general-admin/courses/${id}/content/${content.id}/edit`); }}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted/30 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all"
                      >
                        <i className="bi bi-pencil-square"></i>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedContent(content); setShowDeleteModal(true); }}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted/30 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
                      >
                        <i className="bi bi-trash3"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MODAL ELIMINAR PREMIUM */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-card rounded-[40px] p-10 max-w-sm w-full shadow-2xl border border-border animate-in zoom-in-95 duration-300 text-center">
            <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-[28px] flex items-center justify-center mx-auto mb-6 text-4xl shadow-sm">
              <i className="bi bi-exclamation-triangle"></i>
            </div>
            <h2 className="text-2xl font-black text-foreground mb-2 tracking-tight uppercase">¿Eliminar lección?</h2>
            <p className="text-xs text-muted-foreground mb-8 leading-relaxed font-medium px-4">
              Vas a eliminar la unidad <strong className="text-foreground">"{selectedContent?.title}"</strong>. Esta acción es irreversible.
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={handleDelete} disabled={!!deletingId} className="w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] bg-destructive text-white hover:opacity-90 transition-all shadow-lg shadow-destructive/20 disabled:opacity-50">
                {deletingId ? 'Eliminando...' : 'Confirmar Eliminación'}
              </button>
              <button onClick={() => setShowDeleteModal(false)} className="w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:bg-muted transition-all">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}