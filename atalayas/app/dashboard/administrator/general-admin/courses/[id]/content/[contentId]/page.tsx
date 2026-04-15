'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import { API_ROUTES } from '@/lib/utils';
import mediumZoom from 'medium-zoom';
import Link from 'next/link';

const inputClass = "w-full px-5 py-4 bg-background border border-input focus:border-primary focus:ring-2 focus:ring-ring rounded-2xl outline-none transition-all text-foreground text-sm placeholder:text-muted-foreground";

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
    url: '', // PDF
    quiz: null as any,
    podcast: null as any,
  });

  useEffect(() => {
    const fetchContent = async () => {
      const id = params.id;
      const contentId = params.contentId;

      if (!id || !contentId) {
        const timer = setTimeout(() => setLoading(false), 2000);
        return () => clearTimeout(timer);
      }
      if (typeof params.contentId !== 'string') return;
      try {
        const res = await fetch(API_ROUTES.CONTENT.GET_BY_ID(params.contentId), {
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
  }, [params.contentId, params.id]);

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
      const zoom = mediumZoom(zoomRef.current, { background: 'rgba(250,250,249,0.95)', margin: 24 });
      return () => { zoom.detach(); };
    }
  }, [content?.imageUrl, isEditing]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fakeUrl = "https://tu-storage.com/pdf-actualizado.pdf"; 
      setFormData(prev => ({ ...prev, url: fakeUrl }));
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setErrors({});
    if (!formData.title.trim()) { setErrors({ title: 'El título es obligatorio' }); return; }

    setSaving(true);
    const clean = (v: string) => v?.trim() || null;
    try {
      const res = await fetch(API_ROUTES.CONTENT.GET_BY_ID(params.contentId as string), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({
          ...formData,
          title: formData.title,
          summary: clean(formData.summary),
          imageUrl: clean(formData.imageUrl),
          url: clean(formData.url),
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setContent(updated.content || updated);
        setIsEditing(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch { alert('Error de conexión.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(API_ROUTES.CONTENT.GET_BY_ID(params.contentId as string), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.ok) { 
        router.push(`/dashboard/administrator/general-admin/courses/${params.id}`); 
        router.refresh(); 
      }
    } finally { setDeleting(false); setShowDeleteModal(false); }
  };

  const set = (key: string, value: any) => setFormData(prev => ({ ...prev, [key]: value }));

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary" />
    </div>
  );
  if (!content) return null;

  return (
    <div className="flex min-h-screen bg-background font-sans">
      <Sidebar role="GENERAL_ADMIN" />

      <main className="flex-1 h-screen overflow-y-auto">

        {/* HEADER */}
        <div className="bg-card border-b border-border py-8 lg:py-10">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <Link href={`/dashboard/administrator/general-admin/courses/${params.id}`}
              className="inline-flex items-center gap-2 text-secondary text-sm font-bold hover:opacity-80 transition-opacity mb-8">
              <i className="bi bi-chevron-left"></i> Volver a la unidad
            </Link>

            <div className="flex items-center justify-between flex-wrap gap-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                  <i className="bi bi-journal-text"></i>
                </div>
                
                <div className="flex-1 min-w-[250px]">
                  <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight mb-2">
                    {formData.title || content?.title || "Cargando..."}
                  </h1>
                  <span className="inline-flex items-center text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-secondary/10 text-secondary">
                    Unidad de aprendizaje
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {saveSuccess && (
                  <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full border border-primary/20 animate-in fade-in duration-300 mr-2">
                    <i className="bi bi-check-circle"></i> Guardado
                  </span>
                )}

                {!isEditing ? (
                  <>
                    <button onClick={() => setShowDeleteModal(true)}
                      className="px-4 py-2.5 rounded-xl text-sm font-semibold text-destructive bg-destructive/10 hover:bg-destructive/20 transition-colors">
                      Eliminar
                    </button>
                    <button onClick={() => setIsEditing(true)}
                      className="px-5 py-2.5 rounded-xl text-sm font-bold bg-secondary text-secondary-foreground hover:opacity-90 transition-opacity shadow-sm">
                      Editar unidad
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { hydrateForm(content); setIsEditing(false); }}
                      className="px-4 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground bg-muted hover:bg-border transition-colors">
                      Descartar
                    </button>
                    <button onClick={handleSave} disabled={saving}
                      className="px-5 py-2.5 rounded-xl text-sm font-bold bg-secondary text-secondary-foreground hover:opacity-90 transition-opacity shadow-sm disabled:opacity-60">
                      {saving ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CONTENIDO */}
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-10 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10 lg:gap-12">

            {/* COLUMNA PRINCIPAL */}
            <div>
              <h3 className="text-xl font-bold text-foreground mb-6">
                {isEditing ? 'Configurar contenido' : 'Información de la lección'}
              </h3>

              {isEditing ? (
                <div className="space-y-6">
                  {/* TEXTO E IMAGEN */}
                  <div className="bg-card p-6 lg:p-8 rounded-3xl border border-border shadow-sm space-y-5">
                    <p className="text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground">Texto e Imagen</p>
                    
                    <div className="space-y-1">
                      <input value={formData.title} onChange={e => set('title', e.target.value)}
                        placeholder="Título de la unidad..."
                        className={`w-full px-5 py-4 rounded-2xl outline-none transition-all text-lg font-bold ${errors.title ? 'border-2 border-destructive bg-destructive/10 text-destructive' : 'border border-input bg-background focus:border-primary focus:ring-2 focus:ring-ring text-foreground'}`}
                      />
                      {errors.title && <p className="text-destructive text-xs font-bold ml-2 mt-1"><i className="bi bi-exclamation-triangle"></i> {errors.title}</p>}
                    </div>

                    <textarea rows={8} value={formData.summary} onChange={e => set('summary', e.target.value)}
                      placeholder="Cuerpo de la lección..."
                      className="w-full px-5 py-4 bg-background border border-input focus:border-primary focus:ring-2 focus:ring-ring rounded-2xl outline-none transition-all resize-none text-foreground leading-relaxed placeholder:text-muted-foreground"
                    />

                    <div>
                      <label className="text-xs font-bold text-foreground ml-1 mb-1.5 block">URL de Imagen de Portada</label>
                      <input value={formData.imageUrl} onChange={e => set('imageUrl', e.target.value)}
                        placeholder="https://ejemplo.com/foto.jpg" className={inputClass} />
                    </div>
                  </div>

                  {/* MATERIAL DE ESTUDIO (PDF) */}
                  <div className="bg-card p-6 lg:p-8 rounded-3xl border border-border shadow-sm space-y-5">
                    <p className="text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground">Documento PDF (Material de estudio)</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                       <input value={formData.url} onChange={e => set('url', e.target.value)}
                        placeholder="Link directo al PDF..." className={inputClass} />
                       
                       <div className="relative h-[3.25rem] rounded-2xl border-2 border-dashed border-border flex items-center justify-center bg-muted/50 hover:bg-muted hover:border-secondary transition-all cursor-pointer">
                          <input type="file" accept=".pdf" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                          <span className="text-sm font-bold text-secondary flex items-center gap-2">
                            <i className="bi bi-cloud-arrow-up"></i> {uploading ? 'Subiendo...' : 'Subir nuevo PDF'}
                          </span>
                       </div>
                    </div>
                  </div>

                  {/* IA DATA (Solo lectura) */}
                  {(formData.podcast || formData.quiz) && (
                    <div className="bg-muted p-6 lg:p-8 rounded-3xl border border-border space-y-4 opacity-70 grayscale">
                      <p className="text-[11px] font-black uppercase text-muted-foreground tracking-widest">Datos Generados por IA (Solo lectura)</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {formData.podcast && <div className="p-4 bg-background border border-border rounded-xl text-xs font-mono overflow-hidden h-24 text-muted-foreground">Podcast: {JSON.stringify(formData.podcast).substring(0,60)}...</div>}
                         {formData.quiz && <div className="p-4 bg-background border border-border rounded-xl text-xs font-mono overflow-hidden h-24 text-muted-foreground">Quiz: {JSON.stringify(formData.quiz).substring(0,60)}...</div>}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-wrap mb-10">
                    {content.summary || 'Sin contenido redactado.'}
                  </p>

                  {content.imageUrl && (
                    <div className="mb-10 overflow-hidden rounded-3xl border border-border shadow-sm">
                      <img ref={zoomRef} src={content.imageUrl} alt={content.title} className="w-full h-auto cursor-zoom-in" />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* ACTION BOX LATERAL (Solo lectura) */}
            {!isEditing && (
              <aside className="space-y-6">
                {(content.url || content.podcast) && <h4 className="text-[11px] font-black text-muted-foreground uppercase tracking-widest px-1">Material Extra</h4>}
                
                {content.url && (
                  <div className="bg-card p-6 rounded-3xl border border-border shadow-sm text-center">
                    <div className="text-4xl text-primary mb-3"><i className="bi bi-file-earmark-pdf"></i></div>
                    <p className="text-[11px] font-black text-foreground uppercase mb-5 tracking-widest">Guía PDF</p>
                    <a href={content.url} target="_blank" rel="noopener noreferrer" className="block w-full py-3.5 bg-secondary text-secondary-foreground rounded-xl text-sm font-bold hover:opacity-90 transition-opacity shadow-sm">
                      Abrir documento
                    </a>
                  </div>
                )}
                
                {content.podcast && (
                  <div className="bg-foreground p-6 rounded-3xl text-background shadow-xl">
                    <div className="flex items-center gap-3 mb-5">
                      <span className="text-2xl text-secondary"><i className="bi bi-mic-fill"></i></span>
                      <p className="text-[10px] font-black opacity-80 tracking-widest uppercase text-background">IA Audio</p>
                    </div>
                    <h4 className="text-sm font-bold mb-5 leading-tight">Resumen disponible en podcast</h4>
                    <button className="w-full py-3 bg-background text-foreground rounded-xl text-sm font-bold hover:opacity-90 transition-opacity">
                      Reproducir Audio
                    </button>
                  </div>
                )}
              </aside>
            )}
          </div>
        </div>
      </main>

      {/* MODAL ELIMINAR */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-card rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl border border-border animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
              <i className="bi bi-exclamation-triangle"></i>
            </div>
            <h2 className="text-2xl font-extrabold text-foreground mb-2 text-center tracking-tight">¿Eliminar contenido?</h2>
            <p className="text-sm text-muted-foreground mb-8 text-center leading-relaxed">
              Esta acción eliminará la lección de este curso permanentemente y no se puede deshacer.
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={handleDelete} disabled={deleting} className="w-full py-4 rounded-xl font-bold bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity shadow-sm disabled:opacity-60">
                {deleting ? 'Eliminando...' : 'Eliminar ahora'}
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