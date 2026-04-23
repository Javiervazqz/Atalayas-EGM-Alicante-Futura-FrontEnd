'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import PageHeader from '@/components/ui/pageHeader';
import { API_ROUTES } from '@/lib/utils';
import mediumZoom from 'medium-zoom';
import Link from 'next/link';

const inputClass = "w-full px-5 py-4 bg-background border border-border focus:border-primary/40 focus:ring-4 focus:ring-primary/5 rounded-[18px] outline-none transition-all text-foreground text-sm font-bold placeholder:text-muted-foreground/30";

export default function AdminContentDetail() {
  const params = useParams();
  const router = useRouter();
  const zoomRef = useRef<HTMLImageElement>(null);

  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<{ title?: string }>({});

  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    imageUrl: '',
    url: '',
    quiz: null as any,
    podcast: null as any,
  });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch(API_ROUTES.CONTENT.GET_BY_ID(params.contentId as string), {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await res.json();
        const finalData = data.content || data.data || data;
        setContent(finalData);
        hydrateForm(finalData);
      } finally {
        setLoading(false);
      }
    };
    if (params.contentId) fetchContent();
  }, [params.contentId]);

  const hydrateForm = (c: any) => {
    setFormData({
      title: c.title || '',
      summary: c.summary || '',
      imageUrl: c.imageUrl || '',
      url: c.url || '',
      quiz: c.quiz || null,
      podcast: c.podcast || null,
    });
  };

  useEffect(() => {
    if (zoomRef.current && content?.imageUrl && !isEditing) {
      const zoom = mediumZoom(zoomRef.current, { background: 'rgba(var(--background), 0.9)', margin: 24 });
      return () => zoom.detach();
    }
  }, [content?.imageUrl, isEditing]);

  const handleSave = async () => {
    if (!formData.title.trim()) { setErrors({ title: 'Obligatorio' }); return; }
    setSaving(true);
    try {
      const res = await fetch(API_ROUTES.CONTENT.GET_BY_ID(params.contentId as string), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const updated = await res.json();
        setContent(updated.content || updated);
        setIsEditing(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } finally { setSaving(false); }
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center font-black uppercase text-[10px] tracking-widest animate-pulse">Cargando Lección...</div>;

  return (
    <div className="flex min-h-screen bg-muted/30 font-sans text-foreground transition-colors duration-300">
      <Sidebar role="GENERAL_ADMIN" />

      <main className="flex-1 overflow-auto flex flex-col relative">
        <PageHeader 
          title={isEditing ? "Modificando Lección" : (content?.title || "Detalle")}
          description={isEditing ? "Ajusta el resumen y los recursos de aprendizaje de esta unidad." : "Revisión de contenidos y materiales generados."}
          icon={<i className="bi bi-journal-text"></i>}
          backUrl={`/dashboard/administrator/general-admin/courses/${params.id}`}
          action={
            <div className="flex items-center gap-3">
              {saveSuccess && <span className="text-[10px] font-black uppercase text-emerald-400 mr-2 animate-bounce">Guardado</span>}
              {!isEditing ? (
                <>
                  <button onClick={() => setShowDeleteModal(true)} className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 transition-all">Eliminar</button>
                  <button onClick={() => setIsEditing(true)} className="bg-secondary text-white px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-secondary/20 transition-all active:scale-95">Editar Unidad</button>
                </>
              ) : (
                <>
                  <button onClick={() => { hydrateForm(content); setIsEditing(false); }} className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted transition-all">Cancelar</button>
                  <button onClick={handleSave} disabled={saving} className="bg-primary text-white px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95">
                    {saving ? 'Guardando...' : 'Confirmar Cambios'}
                  </button>
                </>
              )}
            </div>
          }
        />

        <div className="p-6 lg:p-10 flex-1 max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
            
            {/* CONTENIDO PRINCIPAL */}
            <div className="space-y-8">
              {isEditing ? (
                <div className="bg-card rounded-[32px] border border-border/60 p-8 lg:p-10 space-y-8 animate-in fade-in zoom-in-95 duration-500">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Título</label>
                    <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className={inputClass} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Resumen del contenido</label>
                    <textarea rows={12} value={formData.summary} onChange={e => setFormData({...formData, summary: e.target.value})} className={`${inputClass} resize-none leading-relaxed`} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">URL Imagen de Cabecera</label>
                    <input value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className={inputClass} />
                  </div>
                </div>
              ) : (
                <div className="bg-card rounded-[32px] border border-border/60 p-8 lg:p-12 shadow-sm min-h-[600px]">
                  <div className="flex items-center gap-4 mb-10 border-b border-border/60 pb-6">
                     <span className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-widest">Currículo validado</span>
                     <span className="w-1 h-1 rounded-full bg-border"></span>
                     <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="prose prose-slate max-w-none">
                    <p className="text-lg leading-relaxed text-foreground/80 whitespace-pre-wrap">
                      {content.summary || 'Esta unidad no tiene una descripción redactada actualmente.'}
                    </p>
                  </div>
                  {content.imageUrl && (
                    <div className="mt-12 overflow-hidden rounded-[24px] border border-border/60 shadow-xl group">
                      <img ref={zoomRef} src={content.imageUrl} alt={content.title} className="w-full h-auto cursor-zoom-in transition-transform duration-700 group-hover:scale-105" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SIDEBAR DE RECURSOS */}
            <aside className="space-y-6">
               <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-2">Recursos Vinculados</h4>
               
               {/* CARD PDF */}
               <div className={`bg-card p-6 rounded-[28px] border border-border/60 shadow-sm transition-all ${!content.url && !isEditing ? 'opacity-30 grayscale' : 'hover:border-primary/30'}`}>
                  <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center text-2xl mb-4">
                    <i className="bi bi-file-earmark-pdf"></i>
                  </div>
                  <p className="font-black text-[11px] uppercase tracking-widest mb-1">Documentación Base</p>
                  <p className="text-[10px] text-muted-foreground font-medium mb-5">Guía técnica en PDF</p>
                  {isEditing ? (
                    <input value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-[10px] font-bold outline-none" placeholder="Link al PDF..." />
                  ) : content.url ? (
                    <a href={content.url} target="_blank" className="block w-full py-3 bg-secondary text-white rounded-xl text-center text-[10px] font-black uppercase tracking-widest hover:opacity-90">Ver Documento</a>
                  ) : (
                    <div className="text-[10px] font-bold text-muted-foreground/50 text-center py-2 italic">No disponible</div>
                  )}
               </div>

               {/* CARD AUDIO IA */}
               {content.podcast && (
                 <div className="bg-foreground rounded-[28px] p-6 text-background shadow-xl relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/5 rounded-full blur-2xl group-hover:bg-primary/20 transition-all"></div>
                    <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center text-xl mb-4">
                      <i className="bi bi-mic"></i>
                    </div>
                    <p className="font-black text-[11px] uppercase tracking-widest mb-1">Podcast IA</p>
                    <p className="text-[10px] opacity-60 font-medium mb-5">Resumen narrado por IA</p>
                    <button className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all">Reproducir</button>
                 </div>
               )}

               {/* CARD QUIZ IA */}
               {content.quiz && (
                 <div className="bg-indigo-600 rounded-[28px] p-6 text-white shadow-xl">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl mb-4">
                      <i className="bi bi-patch-check"></i>
                    </div>
                    <p className="font-black text-[11px] uppercase tracking-widest mb-1">Cuestionario IA</p>
                    <p className="text-[10px] opacity-70 font-medium mb-5">Evaluación de conocimientos</p>
                    <button className="w-full py-3 bg-white text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all">Gestionar Quiz</button>
                 </div>
               )}
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}