'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import PageHeader from '@/components/ui/pageHeader';
import { API_ROUTES } from '@/lib/utils';
import mediumZoom from 'medium-zoom';
import Link from 'next/link';

const inputClass = "w-full px-5 py-3 bg-background border border-input focus:border-primary focus:ring-4 focus:ring-primary/5 rounded-xl outline-none transition-all text-foreground text-sm font-medium placeholder:text-muted-foreground/50 shadow-sm";

export default function AdminContentDetail() {
  const params = useParams();
  const router = useRouter();
  const zoomRef = useRef<HTMLImageElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<{ title?: string }>({});

  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const lastSavedSecond = useRef<number>(0);

  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    imageUrl: "",
    url: "",
    quiz: null as any,
    podcast: null as any,
  });

  useEffect(() => {
    const fetchContent = async () => {
      const courseId = params.id as string;
      const contentId = params.contentId as string;
      if (!courseId || !contentId) return;

      try {
        const res = await fetch(API_ROUTES.CONTENT.GET_BY_ID(courseId, contentId), {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        const finalData = data.content || data.data || data;
        setContent(finalData);
        hydrateForm(finalData);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [params.contentId, params.id]);

  const hydrateForm = (c: any) => {
    setFormData({
      title: c.title || "",
      summary: c.summary || "",
      imageUrl: c.imageUrl || "",
      url: c.url || "",
      quiz: c.quiz || null,
      podcast: c.podcast || null,
    });
  };

  useEffect(() => {
    if (zoomRef.current && content?.imageUrl && !isEditing) {
      const zoom = mediumZoom(zoomRef.current, { background: 'rgba(0,0,0,0.8)', margin: 24 });
      return () => { zoom.detach(); };
    }
  }, [content?.imageUrl, isEditing]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      // Simulación de subida
      const fakeUrl = "https://storage.atalayas.com/pdf-actualizado.pdf"; 
      setFormData(prev => ({ ...prev, url: fakeUrl }));
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setErrors({});
    if (!formData.title.trim()) {
      setErrors({ title: "El título es obligatorio" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...formData,
        quiz: Array.isArray(formData.quiz) ? { questions: formData.quiz } : formData.quiz,
      };

      const res = await fetch(API_ROUTES.CONTENT.GET_BY_ID(params.id as string, params.contentId as string), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const updated = await res.json();
        const finalUpdated = updated.content || updated;
        setContent(finalUpdated);
        setIsEditing(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(API_ROUTES.CONTENT.GET_BY_ID(params.id as string, params.contentId as string), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) {
        router.push(`/dashboard/administrator/admin/courses/${params.id}`);
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleQuizSubmit = async () => {
    const questions = content.quiz?.questions || content.quiz || [];
    let correctCount = 0;
    questions.forEach((q: any, index: number) => {
      if (quizAnswers[index] === q.correctAnswer) correctCount++;
    });
    setQuizScore(correctCount);
    setQuizSubmitted(true);
  };

  if (loading) return (
    <div className="flex min-h-screen bg-background items-center justify-center font-sans">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background font-sans text-foreground">
      <Sidebar role="ADMIN" />

      <main className="flex-1 overflow-auto flex flex-col relative">
        
        {/* BANNER ULTRA-SLIM CON ACCIONES INTEGRADAS */}
        <PageHeader 
          title={isEditing ? "Editando unidad" : (content?.title || "Detalle")}
          description={isEditing ? "Modifica el texto, imágenes y recursos de la lección." : "Vista de moderación y previsualización de contenidos."}
          icon={<i className="bi bi-journal-text"></i>}
          backUrl={`/dashboard/administrator/admin/courses/${params.id}`}
          action={
            <div className="flex items-center gap-3">
              {saveSuccess && <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest animate-pulse"><i className="bi bi-check-lg"></i> Guardado</span>}
              
              {!isEditing ? (
                <>
                  <button onClick={() => setIsEditing(true)} className="bg-secondary text-secondary-foreground px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2 shadow-sm">
                    <i className="bi bi-pencil-square"></i> Editar
                  </button>
                  <button onClick={() => setShowDeleteModal(true)} className="bg-white/10 text-white hover:bg-destructive hover:text-white w-9 h-9 rounded-xl transition-all flex items-center justify-center border border-white/10">
                    <i className="bi bi-trash3"></i>
                  </button>
                </>
              ) : (
                <>
                  <button onClick={handleSave} disabled={saving} className="bg-secondary text-secondary-foreground px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2 shadow-sm">
                    {saving ? <i className="bi bi-arrow-repeat animate-spin"></i> : <i className="bi bi-cloud-arrow-up"></i>} Guardar
                  </button>
                  <button onClick={() => { hydrateForm(content); setIsEditing(false); }} className="text-white/60 hover:text-white text-xs font-bold px-4 transition-colors">
                    Descartar
                  </button>
                </>
              )}
            </div>
          }
        />

        <div className="p-6 lg:p-10 flex-1 max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 lg:gap-12">

            {/* COLUMNA IZQUIERDA: CONTENIDO / FORMULARIO */}
            <div className="space-y-8">
              
              {isEditing ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {/* EDITOR DE TEXTO */}
                  <div className="bg-card rounded-3xl border border-border p-6 lg:p-8 shadow-sm space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Título de la lección</label>
                      <input 
                        value={formData.title} 
                        onChange={e => setFormData({...formData, title: e.target.value})} 
                        className={`${inputClass} text-base font-bold ${errors.title ? 'border-destructive ring-1 ring-destructive/20' : ''}`}
                        placeholder="Ej: Introducción a la Seguridad"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Cuerpo del contenido</label>
                      <textarea 
                        rows={12} 
                        value={formData.summary} 
                        onChange={e => setFormData({...formData, summary: e.target.value})} 
                        className={`${inputClass} resize-none leading-relaxed`}
                        placeholder="Escribe aquí el material didáctico..."
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">URL de Imagen de apoyo</label>
                      <input 
                        value={formData.imageUrl} 
                        onChange={e => setFormData({...formData, imageUrl: e.target.value})} 
                        className={inputClass}
                        placeholder="https://images.unsplash.com/..."
                      />
                    </div>
                  </div>

                  {/* MATERIAL DESCARGABLE */}
                  <div className="bg-card rounded-3xl border border-border p-6 lg:p-8 shadow-sm space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">Documentación Adjunta</h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <input value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} className={inputClass} placeholder="Enlace externo o PDF..." />
                      <label className="shrink-0 relative h-[46px] px-6 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted/30 hover:bg-muted hover:border-secondary transition-all cursor-pointer">
                         <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
                         <span className="text-xs font-bold text-secondary flex items-center gap-2">
                           <i className="bi bi-cloud-arrow-up text-base"></i> {uploading ? 'Subiendo...' : 'Subir PDF'}
                         </span>
                      </label>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-10 animate-in fade-in duration-500">
                  {/* VISTA DE LECTURA */}
                  <div className="prose prose-slate max-w-none">
                    <h2 className="text-2xl font-bold text-foreground tracking-tight mb-6">{content.title}</h2>
                    <div className="text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {content.summary || <span className="italic opacity-50">Esta lección no contiene texto descriptivo.</span>}
                    </div>
                  </div>

                  {content.imageUrl && (
                    <div className="overflow-hidden rounded-3xl border border-border shadow-md">
                      <img ref={zoomRef} src={content.imageUrl} alt={content.title} className="w-full h-auto cursor-zoom-in hover:opacity-95 transition-opacity" />
                    </div>
                  )}

                  {/* TEST INTERACTIVO (PREVISUALIZACIÓN) */}
                  {content.quiz && (
                    <div className="bg-card rounded-[2rem] border border-border p-8 lg:p-10 shadow-sm border-l-4 border-l-secondary">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center shrink-0 border border-secondary/20">
                          <i className="bi bi-patch-question text-2xl"></i>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-foreground tracking-tight">Evaluación de la unidad</h3>
                          <p className="text-xs text-muted-foreground font-medium">Previsualización del test para el alumno.</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {(content.quiz?.questions || content.quiz).map((q: any, idx: number) => (
                          <div key={idx} className={`p-6 rounded-2xl border transition-all ${quizSubmitted ? (quizAnswers[idx] === q.correctAnswer ? 'bg-primary/5 border-primary/30' : 'bg-destructive/5 border-destructive/30') : 'bg-muted/20 border-transparent'}`}>
                            <p className="font-bold text-sm text-foreground mb-4 flex gap-2">
                              <span className="opacity-40">{idx + 1}.</span> {q.question}
                            </p>
                            <div className="grid grid-cols-1 gap-2">
                              {q.options.map((opt: string, i: number) => (
                                <button 
                                  key={i} 
                                  onClick={() => !quizSubmitted && setQuizAnswers({...quizAnswers, [idx]: opt})}
                                  className={`text-left px-4 py-3 rounded-xl border-2 text-sm transition-all font-medium ${quizAnswers[idx] === opt ? 'border-secondary bg-secondary/5 text-secondary' : 'border-transparent bg-background text-muted-foreground hover:border-secondary/30'}`}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {!quizSubmitted ? (
                        <button onClick={handleQuizSubmit} className="mt-8 w-full py-4 bg-foreground text-background rounded-2xl font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-all shadow-lg">Corregir Previsualización</button>
                      ) : (
                        <div className="mt-8 p-6 bg-primary text-primary-foreground rounded-2xl text-center shadow-lg animate-in zoom-in-95">
                           <p className="text-xs font-black uppercase tracking-widest mb-1 opacity-80">Resultado del test</p>
                           <h4 className="text-3xl font-black">{quizScore} / {(content.quiz?.questions || content.quiz).length}</h4>
                           <button onClick={() => {setQuizSubmitted(false); setQuizAnswers({});}} className="mt-4 text-[10px] font-black uppercase underline tracking-widest">Reiniciar Test</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* COLUMNA DERECHA: RECURSOS */}
            <aside className="space-y-6">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Recursos de la unidad</h4>
              
              {/* PODCAST IA */}
              {content.url?.includes('.mp3') && (
                <div className="bg-primary rounded-3xl p-6 shadow-lg shadow-primary/20 text-white relative overflow-hidden group">
                   <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                     <i className="bi bi-mic text-8xl"></i>
                   </div>
                   <div className="relative z-10">
                     <div className="flex items-center gap-2 mb-4">
                        <span className="bg-white/20 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest">AI Generated</span>
                        <i className="bi bi-robot"></i>
                     </div>
                     <h5 className="font-bold text-sm mb-6 leading-tight">Audio-guía inteligente de la unidad</h5>
                     <audio 
                       ref={audioRef}
                       controls 
                       className="w-full h-10 accent-secondary"
                       src={content.url}
                     />
                   </div>
                </div>
              )}

              {/* DOCUMENTO PDF */}
              {content.url && !content.url.includes('.mp3') && (
                <div className="bg-card border border-border rounded-3xl p-6 shadow-sm text-center">
                  <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <i className="bi bi-file-earmark-pdf text-2xl"></i>
                  </div>
                  <p className="text-xs font-bold text-foreground mb-1">Documentación PDF</p>
                  <p className="text-[10px] text-muted-foreground mb-5 uppercase tracking-widest">Material de apoyo</p>
                  <a href={content.url} target="_blank" rel="noreferrer" className="inline-flex w-full py-2.5 bg-muted text-foreground rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-border transition-all justify-center items-center gap-2">
                    <i className="bi bi-box-arrow-up-right"></i> Abrir Recurso
                  </a>
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>

      {/* MODAL ELIMINAR PREMIUM */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-card rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl border border-border animate-in zoom-in-95 duration-200 text-center" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
              <i className="bi bi-exclamation-triangle"></i>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">¿Eliminar unidad?</h2>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
              Esta acción borrará permanentemente la lección y sus datos asociados. No se puede deshacer.
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={handleDelete} disabled={deleting} className="w-full py-3.5 rounded-xl font-bold bg-destructive text-white hover:opacity-90 transition-opacity shadow-lg shadow-destructive/20 text-sm">
                {deleting ? 'Borrando...' : 'Sí, eliminar contenido'}
              </button>
              <button onClick={() => setShowDeleteModal(false)} className="w-full py-3.5 rounded-xl font-bold text-muted-foreground hover:bg-muted transition-colors text-sm border border-transparent hover:border-border">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}