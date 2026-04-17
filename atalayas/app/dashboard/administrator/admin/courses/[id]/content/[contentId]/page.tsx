"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/ui/Sidebar";
import { API_ROUTES } from "@/lib/utils";
import mediumZoom from "medium-zoom";
import Link from "next/link";

const appleFont =
  "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif";
const inputClass =
  "w-full px-5 py-3.5 bg-[#f5f5f7] border-2 border-transparent focus:border-[#0071e3] focus:bg-white rounded-2xl outline-none transition-all text-[#424245] text-sm placeholder:text-[#c7c7cc]";
const inputClass = "w-full px-5 py-4 bg-background border border-input focus:border-primary focus:ring-2 focus:ring-ring rounded-2xl outline-none transition-all text-foreground text-sm placeholder:text-muted-foreground";

export default function AdminContentDetail() {
  const params = useParams();
  const router = useRouter();
  const zoomRef = useRef<HTMLImageElement>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const lastSavedSecond = useRef<number>(0);

  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<{ title?: string }>({});

  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    imageUrl: "",
    url: "",
    quiz: null as any,
    podcast: null as any,
  });

  const getQuizQuestions = (quizSource: any) => {
    if (!quizSource) return [];
    if (Array.isArray(quizSource)) return quizSource;
    return quizSource.questions || [];
  };

  useEffect(() => {
    const fetchContent = async () => {
      const courseId = params.id as string;
      const contentId = params.contentId as string;
      if (!courseId || !contentId) return;

      try {
        const res = await fetch(
          API_ROUTES.CONTENT.GET_BY_ID(courseId, contentId),
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        const data = await res.json();
        const finalData = data.content || data.data || data;

        setContent(finalData);
        hydrateForm(finalData);
      } catch (error) {
        console.error("❌ Error cargando el contenido:", error);
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
    if (!formData.title.trim()) {
      setErrors({ title: "El título es obligatorio" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...formData,
        quiz: Array.isArray(formData.quiz)
          ? { questions: formData.quiz }
          : formData.quiz,
      };

      const res = await fetch(
        API_ROUTES.CONTENT.GET_BY_ID(
          params.id as string,
          params.contentId as string,
        ),
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (res.ok) {
        const updated = await res.json();
        const finalUpdated = updated.content || updated;
        setContent(finalUpdated);
        setIsEditing(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error("❌ Error en la petición:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(
        API_ROUTES.CONTENT.GET_BY_ID(
          params.id as string,
          params.contentId as string,
        ),
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      if (res.ok) {
        router.push(`/dashboard/administrator/admin/courses/${params.id}`);
        router.refresh();
      }
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleQuizSubmit = () => {
    const questions = getQuizQuestions(content.quiz);
    let correctCount = 0;
    questions.forEach((q: any, index: number) => {
      if (quizAnswers[index] === q.correctAnswer) correctCount++;
    });
    setQuizScore(correctCount);
    setQuizSubmitted(true);

    if (correctCount === content.quiz.length) {
      const token = localStorage.getItem('token');
      await fetch(`${API_ROUTES.ENROLLMENTS.BASE}/complete-manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ contentId: content.id })
      });
      router.refresh();
    }
  };

  const set = (key: string, value: any) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  if (loading)
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary" />
    </div>
  );
  if (!content) return null;

  return (
    <div className="flex min-h-screen bg-background font-sans">
      <Sidebar role="ADMIN" />

      <main className="flex-1 h-screen overflow-y-auto">

        {/* HEADER */}
        <div className="bg-card border-b border-border py-8 lg:py-10">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <Link href={`/dashboard/administrator/admin/courses/${params.id}`}
              className="inline-flex items-center gap-1 text-secondary text-sm font-bold hover:opacity-80 transition-opacity mb-8">
              <i className="bi bi-chevron-left"></i> Volver a la unidad
            </Link>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-3xl flex items-center justify-center text-3xl shrink-0">
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

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                {saveSuccess && (
                  <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full border border-primary/20 animate-in fade-in duration-300">
                    <i className="bi bi-check-circle"></i> Guardado
                  </span>
                )}

                {!isEditing ? (
                  <>
                    <button onClick={() => setShowDeleteModal(true)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-destructive bg-destructive/10 hover:bg-destructive/20 transition-colors">
                      Eliminar
                    </button>
                    <button onClick={() => setIsEditing(true)} className="px-6 py-2.5 rounded-xl text-sm font-bold bg-secondary text-secondary-foreground hover:opacity-90 transition-opacity shadow-sm">
                      Editar unidad
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { hydrateForm(content); setIsEditing(false); }} className="px-5 py-2.5 rounded-xl text-sm font-bold text-muted-foreground bg-muted hover:bg-border transition-colors">
                      Descartar
                    </button>
                    <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 rounded-xl text-sm font-bold bg-secondary text-secondary-foreground hover:opacity-90 transition-opacity shadow-sm disabled:opacity-60 flex items-center gap-2">
                      {saving ? <><i className="bi bi-arrow-repeat animate-spin"></i> Guardando...</> : 'Guardar cambios'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-10 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10 lg:gap-12">

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
                      <input value={formData.title} onChange={e => set('title', e.target.value)} placeholder="Título..." className={`w-full px-5 py-4 rounded-2xl outline-none transition-all text-lg font-bold ${errors.title ? 'border-2 border-destructive bg-destructive/10 text-destructive' : 'border border-input bg-background focus:border-primary focus:ring-2 focus:ring-ring text-foreground'}`} />
                      {errors.title && <p className="text-destructive text-xs font-bold ml-2 mt-1"><i className="bi bi-exclamation-triangle"></i> {errors.title}</p>}
                    </div>
                    
                    <textarea rows={8} value={formData.summary} onChange={e => set('summary', e.target.value)} placeholder="Cuerpo de la lección..." className="w-full px-5 py-4 bg-background border border-input focus:border-primary focus:ring-2 focus:ring-ring rounded-2xl outline-none transition-all resize-none text-foreground leading-relaxed placeholder:text-muted-foreground" />
                    
                    <input value={formData.imageUrl} onChange={e => set('imageUrl', e.target.value)} placeholder="URL Imagen (Opcional)..." className={inputClass} />
                  </div>

                  {/* DOCUMENTO PDF */}
                  <div className="bg-card p-6 lg:p-8 rounded-3xl border border-border shadow-sm space-y-5">
                    <p className="text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground">Documento PDF / Enlace</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <input value={formData.url} onChange={e => set('url', e.target.value)} placeholder="Enlace directo (Opcional)..." className={inputClass} />
                       
                       <div className="relative h-[3.5rem] rounded-2xl border-2 border-dashed border-border flex items-center justify-center bg-muted/50 hover:bg-muted hover:border-secondary transition-all cursor-pointer">
                          <input type="file" accept=".pdf" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                          <span className="text-sm font-bold text-secondary flex items-center gap-2">
                            <i className="bi bi-cloud-arrow-up"></i> {uploading ? 'Subiendo...' : 'Subir nuevo PDF'}
                          </span>
                       </div>
                    </div>
                  </div>

                  {/* DATOS IA (Solo lectura) */}
                  {(formData.podcast || formData.quiz) && (
                    <div className="bg-muted/50 p-6 lg:p-8 rounded-3xl border border-border space-y-4">
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
                  <div className="prose prose-slate max-w-none">
                    <p className="text-base text-muted-foreground leading-relaxed whitespace-pre-wrap mb-10">
                      {content.summary || 'Sin contenido redactado.'}
                    </p>
                  </div>

                  {content.imageUrl && (
                    <div className="mb-10 overflow-hidden rounded-3xl border border-border shadow-sm">
                      <img ref={zoomRef} src={content.imageUrl} alt={content.title} className="w-full h-auto cursor-zoom-in" />
                    </div>
                  )}

                  {/* 🚀 QUIZ INTERACTIVO */}
                  {content.quiz && (
                    <div className="mt-12 bg-card p-6 lg:p-10 rounded-3xl border border-border shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-8">
                        <div className="w-14 h-14 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center shrink-0 border border-secondary/20">
                          <i className="bi bi-patch-question text-3xl"></i>
                        </div>
                        <div>
                          <h3 className="text-2xl font-extrabold text-foreground tracking-tight">Test de Comprensión</h3>
                          <p className="text-muted-foreground text-sm font-medium mt-1">Supera el test para validar el conocimiento adquirido.</p>
                        </div>
                      </div>

                      <div className="space-y-8">
                        {content.quiz.map((pregunta: any, index: number) => {
                          const isCorrect = quizAnswers[index] === pregunta.correctAnswer;
                          const bgClass = quizSubmitted 
                            ? (isCorrect ? "bg-primary/10 border-primary/30" : "bg-destructive/10 border-destructive/30") 
                            : "bg-background border-border";
                          
                          return (
                            <div key={index} className={`p-6 rounded-3xl border transition-colors ${bgClass}`}>
                              <p className="font-bold text-foreground text-base mb-4 flex gap-2">
                                <span className="text-muted-foreground">{index + 1}.</span> {pregunta.question}
                              </p>
                              <div className="flex flex-col gap-3">
                                {pregunta.options.map((opcion: string, i: number) => (
                                  <label key={i} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${quizAnswers[index] === opcion ? 'border-secondary bg-secondary/5' : 'bg-card border-border hover:border-secondary/50'}`}>
                                    <input type="radio" name={`q-${index}`} checked={quizAnswers[index] === opcion} onChange={() => !quizSubmitted && setQuizAnswers(prev => ({...prev, [index]: opcion}))} className="w-5 h-5 accent-secondary" />
                                    <span className="text-foreground text-sm font-medium">{opcion}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {!quizSubmitted ? (
                        <button 
                          onClick={handleQuizSubmit} 
                          disabled={Object.keys(quizAnswers).length < content.quiz.length} 
                          className="mt-8 w-full py-4 bg-secondary text-secondary-foreground rounded-2xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                          Corregir Test
                        </button>
                      ) : (
                        <div className="mt-8 p-8 bg-primary/10 rounded-3xl text-center border border-primary/20">
                          <h4 className="text-3xl font-black text-primary mb-2 tracking-tight">Puntuación: {quizScore} / {content.quiz.length}</h4>
                          {quizScore === content.quiz.length 
                            ? <p className="text-primary font-bold flex items-center justify-center gap-2 mt-2"><i className="bi bi-check-circle-fill"></i> ¡Perfecto! Excelente trabajo.</p> 
                            : <button onClick={() => { setQuizSubmitted(false); setQuizAnswers({}); }} className="mt-4 px-8 py-3 bg-card border border-border text-foreground rounded-xl font-bold hover:bg-muted transition-colors shadow-sm">Reintentar Test</button>
                          }
                        </div>
                      ) : (
                        <button
                          onClick={handleQuizSubmit}
                          disabled={Object.keys(quizAnswers).length === 0}
                          className="w-full py-3.5 bg-blue-500 text-white rounded-2xl text-xs font-bold shadow-lg hover:bg-gray-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          Corregir Test
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* BARRA LATERAL */}
            {!isEditing && (
              <aside className="space-y-6">
                {content.url && !content.url.includes('.mp3') && (
                  <div className="bg-card p-6 rounded-3xl border border-border shadow-sm text-center">
                    <div className="text-4xl text-primary mb-3"><i className="bi bi-file-earmark-pdf"></i></div>
                    <p className="text-[11px] font-black text-foreground uppercase mb-5 tracking-widest">Material de Estudio</p>
                    <a href={content.url} target="_blank" rel="noreferrer" className="block w-full py-3 bg-secondary text-secondary-foreground rounded-xl text-sm font-bold hover:opacity-90 transition-opacity shadow-sm">
                      Abrir documento
                    </a>
                  </div>
                )}
                
                {content.url && content.url.includes('.mp3') && (
                  <div className="bg-card p-6 rounded-3xl border border-border shadow-sm text-center overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <i className="bi bi-mic text-6xl"></i>
                    </div>
                    <p className="text-[10px] font-black uppercase text-primary mb-3 flex items-center justify-center gap-1.5 tracking-widest relative z-10">
                      <i className="bi bi-robot"></i> AI Podcast
                    </p>
                    <h4 className="text-foreground font-bold mb-5 leading-tight relative z-10">Escucha la lección</h4>
                    <audio 
                      ref={audioRef}
                      controls 
                      className="w-full h-12 rounded-xl relative z-10" 
                      src={content.url}
                      onCanPlay={() => {
                        const savedTime = content.userProgresses?.[0]?.lastTime || 0;
                        if (audioRef.current && savedTime > 0 && lastSavedSecond.current === 0) {
                          audioRef.current.currentTime = savedTime;
                          lastSavedSecond.current = savedTime;
                        }
                      }}
                      onTimeUpdate={async (e) => {
                        const target = e.target as HTMLAudioElement;
                        const currentSec = Math.floor(target.currentTime);
                        const totalDur = Math.floor(target.duration || 0);

                        if (currentSec > 0 && currentSec % 10 === 0 && currentSec !== lastSavedSecond.current) {
                          lastSavedSecond.current = currentSec;
                          try {
                            const token = localStorage.getItem('token');
                            await fetch(`${API_ROUTES.ENROLLMENTS.BASE}/video-progress`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                              body: JSON.stringify({ contentId: content.id, lastTime: Math.floor(Number(currentSec)), totalDuration: Math.floor(Number(totalDur)) })
                            });
                          } catch (err) { console.error(err); }
                        }
                      }}
                    />
                  </div>
                )}
              </aside>
            )}

            <div className="md:order-1">
              {isEditing ? (
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                  <p className="text-[10px] font-black uppercase text-gray-400">
                    Editor de Contenido
                  </p>
                  <input
                    value={formData.title}
                    onChange={(e) => set("title", e.target.value)}
                    placeholder="Título..."
                    className={inputClass}
                  />
                  <textarea
                    rows={10}
                    value={formData.summary}
                    onChange={(e) => set("summary", e.target.value)}
                    placeholder="Cuerpo..."
                    className={`${inputClass} resize-none`}
                  />
                  <input
                    value={formData.imageUrl}
                    onChange={(e) => set("imageUrl", e.target.value)}
                    placeholder="URL Imagen..."
                    className={inputClass}
                  />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="prose prose-gray max-w-none">
                    <p className="text-base md:text-lg leading-relaxed text-[#424245] whitespace-pre-wrap font-medium">
                      {content.summary || "Sin contenido."}
                    </p>
                  </div>

                  {content.imageUrl && (
                    <div className="overflow-hidden rounded-3xl border border-gray-100 shadow-md">
                      <img
                        ref={zoomRef}
                        src={content.imageUrl}
                        alt="Image"
                        className="w-full h-auto cursor-zoom-in"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-card rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl border border-border animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
              <i className="bi bi-trash3"></i>
            </div>
            <h2 className="text-2xl font-extrabold text-foreground mb-2 text-center tracking-tight">¿Eliminar contenido?</h2>
            <p className="text-sm text-muted-foreground mb-8 text-center leading-relaxed">
              Esta acción eliminará la lección de forma permanente y no se puede deshacer.
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={handleDelete} disabled={deleting} className="w-full py-4 rounded-xl font-bold bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity shadow-sm disabled:opacity-60">
                {deleting ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
              <button onClick={() => setShowDeleteModal(false)} className="w-full py-4 rounded-xl font-bold text-muted-foreground hover:bg-muted transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .content-layout {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 40px;
        }
        @media (max-width: 1024px) {
          .content-layout {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .action-box {
            order: -1;
          }
        }
      `}</style>
    </div>
  );
}
