'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/ui/Sidebar';
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
    <div className="flex min-h-screen bg-background">
      <Sidebar role="GENERAL_ADMIN" />
      <main className="flex-1 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background font-sans">
      <Sidebar role="GENERAL_ADMIN" />

      <main className="flex-1 h-screen overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-10 lg:py-12">

          {/* Breadcrumb */}
          <Link href="/dashboard/administrator/general-admin/courses" className="inline-flex items-center gap-2 text-secondary text-sm font-bold hover:opacity-80 transition-opacity mb-8">
            <i className="bi bi-arrow-left"></i> Volver a todos los cursos
          </Link>

          {/* Header con info de empresa destacada */}
          <div className="bg-card rounded-[2.5rem] border border-border p-8 lg:p-10 mb-10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center text-4xl shrink-0">
                <i className="bi bi-journal-bookmark"></i>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${course?.isPublic ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                    {course?.isPublic ? '🌐 Público' : '🔒 Privado'}
                  </span>
                  {course?.Company?.name && (
                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-muted text-muted-foreground border border-border">
                      🏢 {course.Company.name}
                    </span>
                  )}
                  {course?.category && (
                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-muted text-muted-foreground border border-border">
                      {course.category}
                    </span>
                  )}
                </div>
                <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight mb-2">{course?.title}</h1>
                <p className="text-muted-foreground text-sm font-medium">{filteredContents.length} lecciones · Panel de Administración</p>
              </div>
            </div>
            <Link
              href={`/dashboard/administrator/general-admin/courses/${id}/content/new`}
              className="shrink-0 bg-secondary text-secondary-foreground px-6 py-3.5 rounded-2xl text-sm font-bold hover:opacity-90 transition-opacity shadow-sm flex items-center justify-center gap-2"
            >
              <i className="bi bi-plus-lg text-lg"></i> Nueva lección
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { label: 'Total lecciones', value: course?.Content?.length || 0, icon: 'bi-stack', color: 'text-primary bg-primary/10' },
              { label: 'Recursos PDF', value: course?.Content?.filter((c: any) => c.url)?.length || 0, icon: 'bi-file-earmark-pdf', color: 'text-secondary bg-secondary/10' },
              { label: 'Cuestionarios', value: course?.Content?.filter((c: any) => c.quiz)?.length || 0, icon: 'bi-ui-checks', color: 'text-indigo-600 bg-indigo-500/10' },
              { label: 'Audio Podcast', value: course?.Content?.filter((c: any) => c.podcast)?.length || 0, icon: 'bi-mic', color: 'text-emerald-600 bg-emerald-500/10' },
            ].map((stat) => (
              <div key={stat.label} className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col items-start">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-4 ${stat.color}`}>
                  <i className={`bi ${stat.icon}`}></i>
                </div>
                <p className="text-3xl font-extrabold text-foreground mb-1">{stat.value}</p>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Buscador */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Lecciones</h2>
            <div className="w-full sm:w-auto">
              <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Buscar lección..." />
            </div>
          </div>

          {/* Lista */}
          {filteredContents.length === 0 ? (
            <div className="bg-card rounded-[2.5rem] border border-dashed border-border p-16 text-center">
              <p className="text-5xl mb-4 text-muted-foreground/30"><i className="bi bi-journal-x"></i></p>
              <p className="text-foreground font-bold text-xl mb-2">Sin lecciones todavía</p>
              <p className="text-muted-foreground text-sm mb-6">Este curso aún no tiene contenido o la búsqueda no arrojó resultados.</p>
              <Link href={`/dashboard/administrator/general-admin/courses/${id}/content/new`} className="inline-flex bg-secondary text-secondary-foreground px-6 py-3 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity shadow-sm">
                Crear primera lección
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredContents.map((content: any) => (
                <div
                  key={content.id}
                  onClick={() => router.push(`/dashboard/administrator/general-admin/courses/${id}/content/${content.id}`)}
                  className="bg-card rounded-[2rem] border border-border p-6 hover:border-primary hover:shadow-md transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center gap-5"
                >
                  <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center font-mono text-sm font-bold text-muted-foreground shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    {String(content.order).padStart(2, '0')}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-lg text-foreground group-hover:text-primary transition-colors truncate mb-1">{content.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{content.summary || 'Sin resumen'}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {content.url && <span className="bg-secondary/10 text-secondary text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-secondary/20">PDF</span>}
                    {content.quiz && <span className="bg-indigo-500/10 text-indigo-600 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-indigo-500/20">QUIZ</span>}
                    {content.podcast && <span className="bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-emerald-500/20">AUDIO</span>}
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 sm:border-l border-border pt-4 sm:pt-0 sm:pl-4 mt-2 sm:mt-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/administrator/general-admin/courses/${id}/content/${content.id}/edit`); }}
                      className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      title="Editar lección"
                    >
                      <i className="bi bi-pencil-square text-lg"></i>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedContent(content); setShowDeleteModal(true); }}
                      className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      title="Eliminar lección"
                    >
                      <i className="bi bi-trash3 text-lg"></i>
                    </button>
                    <i className="bi bi-chevron-right text-muted-foreground/50 group-hover:text-primary ml-2 text-lg transition-colors hidden sm:block"></i>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* MODAL ELIMINAR */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-card rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl border border-border animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
              <i className="bi bi-exclamation-triangle"></i>
            </div>
            <h2 className="text-2xl font-extrabold text-foreground text-center mb-2 tracking-tight">¿Eliminar lección?</h2>
            <p className="text-sm text-muted-foreground text-center mb-8 leading-relaxed">
              Se eliminará <strong className="text-foreground">"{selectedContent?.title}"</strong> permanentemente.
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={handleDelete} disabled={!!deletingId} className="w-full py-4 rounded-xl font-bold bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity shadow-sm disabled:opacity-60">
                {deletingId ? 'Eliminando...' : 'Eliminar ahora'}
              </button>
              <button onClick={() => setShowDeleteModal(false)} className="w-full py-4 rounded-xl font-bold text-muted-foreground hover:bg-muted transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}