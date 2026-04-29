'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import PageHeader from '@/components/ui/pageHeader';
import { API_ROUTES } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

const inputClass = "w-full px-4 py-2.5 bg-background border border-border focus:border-primary focus:ring-4 focus:ring-primary/5 rounded-xl outline-none transition-all text-foreground text-sm font-medium shadow-sm placeholder:text-muted-foreground/40";
const labelClass = "text-[10px] font-black uppercase text-primary tracking-[0.2em] mb-2 block";

export default function AdminContentDetail() {
  const params = useParams();
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);

  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Estados para el Quiz
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isCorrected, setIsCorrected] = useState(false);
  
  const [formData, setFormData] = useState<any>({
    title: "",
    summary: "",
    imageUrl: "",
    url: "",
    quiz: { questions: [] },
  });

  const sanitizeData = (data: any) => {
    const raw = data?.data || data?.content || data || {};
    let cleanQuestions = [];
    if (raw.quiz) {
      const source = Array.isArray(raw.quiz) ? raw.quiz : (raw.quiz.questions || []);
      cleanQuestions = source.map((q: any) => ({
        question: q.question || "",
        options: Array.isArray(q.options) ? [...q.options] : ["", "", "", ""],
        correctAnswer: q.correctAnswer || ""
      }));
    }
    return {
      ...raw,
      title: raw.title || "Sin título",
      summary: raw.summary || "",
      url: raw.url || "",
      quiz: { questions: cleanQuestions }
    };
  };

  useEffect(() => {
    const fetchContent = async () => {
      if (!params.id || !params.contentId) return;
      try {
        const res = await fetch(API_ROUTES.CONTENT.GET_BY_ID(params.id as string, params.contentId as string), {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        const cleanData = sanitizeData(data);
        setContent(cleanData);
        setFormData(JSON.parse(JSON.stringify(cleanData)));
      } catch (error) { 
        console.error("Error cargando unidad:", error); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchContent();
  }, [params.contentId, params.id]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        summary: formData.summary,
        url: formData.url,
        imageUrl: formData.imageUrl,
        quiz: formData.quiz
      };

      const res = await fetch(API_ROUTES.CONTENT.UPDATE(params.id as string, params.contentId as string), {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}` 
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const result = await res.json();
        setContent(sanitizeData(result));
        setIsEditing(false);
      }
    } catch (error) {
      alert("Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(API_ROUTES.CONTENT.DELETE(params.id as string, params.contentId as string), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (res.ok) {
        router.push(`/dashboard/administrator/admin/courses/${params.id}`);
      } else {
        alert("No se pudo eliminar la unidad");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleDiscard = () => {
    setFormData(JSON.parse(JSON.stringify(content)));
    setIsEditing(false);
  };

  const updateQuestionText = (index: number, text: string) => {
    const newQuestions = [...formData.quiz.questions];
    newQuestions[index].question = text;
    setFormData({ ...formData, quiz: { questions: newQuestions } });
  };

  const updateOptionText = (qIndex: number, oIndex: number, text: string) => {
    const newQuestions = [...formData.quiz.questions];
    newQuestions[qIndex].options[oIndex] = text;
    setFormData({ ...formData, quiz: { questions: newQuestions } });
  };

  const updateCorrectAnswer = (qIndex: number, text: string) => {
    const newQuestions = [...formData.quiz.questions];
    newQuestions[qIndex].correctAnswer = text;
    setFormData({ ...formData, quiz: { questions: newQuestions } });
  };

  const handleSelectOption = (qIdx: number, option: string) => {
    if (isCorrected) return;
    setUserAnswers(prev => ({ ...prev, [qIdx]: option }));
  };

  const resetQuiz = () => {
    setUserAnswers({});
    setIsCorrected(false);
    setShowQuizModal(false);
  };

  const score = content?.quiz?.questions.reduce((acc: number, q: any, idx: number) => {
    return userAnswers[idx] === q.correctAnswer ? acc + 1 : acc;
  }, 0);

  const totalQuestions = content?.quiz?.questions.length || 0;

  return (
    <div className="flex h-screen bg-background font-sans text-foreground overflow-hidden">
      <Sidebar role="ADMIN" />

      <main className="flex-1 flex flex-col min-w-0 relative">
        <PageHeader 
          title={isEditing ? "Modo Editor" : content?.title || "Cargando..."}
          description="Gestión de unidad didáctica"
          icon={<i className="bi bi-file-earmark-text"></i>}
          backUrl={`/dashboard/administrator/admin/courses/${params.id}`}
          action={
            <div className="flex gap-3">
              {isEditing && (
                <button onClick={handleDiscard} className="bg-muted text-foreground px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-muted/80">
                  Descartar
                </button>
              )}
              <button 
                onClick={isEditing ? handleSave : () => setIsEditing(true)} 
                disabled={loading}
                className={`${isEditing ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-primary shadow-primary/20'} text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95`}
              >
                {isEditing ? "Guardar Cambios" : "Editar Unidad"}
              </button>
            </div>
          }
        />

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto bg-muted/30 p-8 no-scrollbar">
            <div className="max-w-4xl mx-auto bg-card shadow-xl border border-border/50 rounded-xl p-8 md:p-16 mb-10">
              {isEditing ? (
                <div className="space-y-10">
                  <section className="space-y-6">
  <h3 className="text-lg font-black border-l-4 border-primary pl-4 uppercase tracking-tighter">Información General</h3>
  
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Título */}
    <div className="md:col-span-2">
      <label className={labelClass}>Título de la Unidad</label>
      <input 
        value={formData.title} 
        onChange={e => setFormData({...formData, title: e.target.value})} 
        className={inputClass} 
        placeholder="Ej: Introducción a la IA"
      />
    </div>

    {/* Input de Image URL */}
    <div className="space-y-2">
      <label className={labelClass}>URL de la Imagen de Portada</label>
      <input 
        value={formData.imageUrl} 
        onChange={e => setFormData({...formData, imageUrl: e.target.value})} 
        className={inputClass} 
        placeholder="https://ejemplo.com/imagen.jpg"
      />
    </div>

    {/* Previsualización de Imagen */}
    <div className="space-y-2">
      <label className={labelClass}>Previsualización</label>
      <div className="h-[42px] rounded-xl border border-border bg-muted/20 flex items-center px-4 overflow-hidden">
        {formData.imageUrl ? (
          <div className="flex items-center gap-3 w-full">
            <img 
              src={formData.imageUrl} 
              alt="Preview" 
              className="w-6 h-6 rounded shadow-sm object-cover"
              onError={(e) => (e.currentTarget.src = "https://placehold.co/400x400?text=Error")}
            />
            <span className="text-[10px] text-muted-foreground truncate flex-1">{formData.imageUrl}</span>
          </div>
        ) : (
          <span className="text-[10px] text-muted-foreground italic">No hay imagen seleccionada</span>
        )}
      </div>
    </div>
  </div>

  {/* Contenido Markdown */}
  <div>
    <label className={labelClass}>Contenido (Markdown)</label>
    <textarea 
      rows={12} 
      value={formData.summary} 
      onChange={e => setFormData({...formData, summary: e.target.value})} 
      className={`${inputClass} font-mono text-xs leading-relaxed`} 
      placeholder="# Escribe aquí el contenido..."
    />
  </div>
</section>

                  <section className="space-y-6 pt-10 border-t border-border">
                    <h3 className="text-lg font-black border-l-4 border-orange-400 pl-4 uppercase tracking-tighter text-orange-500">Editor de Quiz</h3>
                    <div className="space-y-12">
                      {formData.quiz.questions.map((q: any, qIdx: number) => (
                        <div key={qIdx} className="bg-muted/20 p-6 rounded-2xl border border-border/50 space-y-4">
                          <input value={q.question} onChange={e => updateQuestionText(qIdx, e.target.value)} className={inputClass} placeholder="Pregunta..." />
                          <div className="grid grid-cols-2 gap-4">
                            {q.options.map((opt: string, oIdx: number) => (
                              <input key={oIdx} value={opt} onChange={e => updateOptionText(qIdx, oIdx, e.target.value)} className={`${inputClass} text-xs`} placeholder={`Opción ${oIdx+1}`} />
                            ))}
                          </div>
                          <select value={q.correctAnswer} onChange={e => updateCorrectAnswer(qIdx, e.target.value)} className={inputClass}>
                            <option value="">Selecciona la correcta</option>
                            {q.options.map((opt: string, oIdx: number) => <option key={oIdx} value={opt}>{opt}</option>)}
                          </select>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              ) : (
                <div className="prose dark:prose-invert max-w-none">
                  <h1 className="text-4xl font-black mb-8 border-b-4 border-primary/10 pb-4">{content?.title}</h1>
                   <ReactMarkdown
                    components={{
                      h2: ({ ...props }) => <h2 className="text-2xl font-black text-foreground mt-14 mb-6 flex items-center gap-3" {...props} />,
                      h3: ({ ...props }) => <h3 className="text-xl font-bold text-foreground/90 mt-10 mb-4" {...props} />,
                      p: ({ ...props }) => <p className="text-[17px] leading-[1.8] text-muted-foreground mb-8 whitespace-pre-wrap" {...props} />,
                      ul: ({ ...props }) => <ul className="my-8 space-y-4" {...props} />,
                      li: ({ ...props }) => (
                        <li className="flex items-start gap-3 text-[16px] text-muted-foreground leading-relaxed">
                          <span className="mt-2.5 w-2 h-2 rounded-full bg-primary/40 shrink-0" />
                          <span {...props} />
                        </li>
                      ),
                      blockquote: ({ ...props }) => (
                        <blockquote className="border-l-4 border-primary bg-muted/40 p-6 rounded-r-2xl my-10 italic text-foreground/80 shadow-inner" {...props} />
                      )
                    }}
                  >
                    {content?.summary}
                  </ReactMarkdown> 
                </div>
              )}
            </div>
          </div>

          <aside className="w-80 border-l border-border bg-card p-6 flex flex-col gap-6">
            <h4 className={labelClass}>Recursos</h4>
            {content?.podcast?.url && (
              <div className="relative group overflow-hidden bg-linear-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-[2rem] p-5 transition-all hover:shadow-xl hover:shadow-emerald-500/5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <i className="bi bi-mic-fill text-lg"></i>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-tighter">Audio Podcast</p>
                    <p className="text-xs font-bold opacity-80">Locución por IA</p>
                  </div>
                </div>
                <audio ref={audioRef} src={content.podcast.url} controls className="w-full h-8 accent-emerald-500 mb-2" />
              </div>
            )}
            {content?.quiz?.questions?.length > 0 && (
              <button onClick={() => setShowQuizModal(true)} className="w-full p-4 bg-orange-400 text-white rounded-2xl flex items-center gap-4 hover:bg-orange-500 transition-all shadow-lg active:scale-95">
                <i className="bi bi-patch-question text-2xl"></i>
                <div className="text-left">
                  <p className="text-[8px] font-bold uppercase opacity-70">Evaluación</p>
                  <p className="text-sm font-bold">Probar Test</p>
                </div>
              </button>
            )}

            {content?.url?.toLowerCase().includes('.pdf') && (
              <a href={content.url} target="_blank" rel="noopener noreferrer"
                className="group w-full p-3 bg-muted border border-border rounded-2xl flex items-center gap-3 hover:border-primary transition-all active:scale-95">
                <div className="w-10 h-10 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <i className="bi bi-file-earmark-pdf text-xl"></i>
                </div>
                <div className="text-left overflow-hidden">
                  <p className="text-[8px] font-bold uppercase text-muted-foreground tracking-tighter">Material PDF</p>
                  <p className="text-xs font-bold text-foreground truncate">Ver documento</p>
                </div>
              </a>
            )} 
            <button onClick={() => setShowDeleteModal(true)} className="mt-auto py-3 text-[9px] font-black uppercase text-destructive border-t border-border tracking-widest hover:text-red-500">
              Eliminar Unidad
            </button>
          </aside>
        </div>
      </main>

      {/* MODAL DEL QUIZ INTERACTIVO */}
      {showQuizModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-card border border-border rounded-[32px] p-8 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="flex justify-between items-center mb-8 shrink-0">
              <div>
                <h3 className="text-2xl font-black">Simulación de Test</h3>
                <p className="text-xs text-muted-foreground">Prueba la experiencia del estudiante</p>
              </div>
              <button onClick={resetQuiz} className="text-muted-foreground hover:text-foreground transition-colors">
                <i className="bi bi-x-circle text-2xl"></i>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-10 no-scrollbar">
              {content?.quiz?.questions.map((q: any, qIdx: number) => (
                <div key={qIdx} className="space-y-4">
                  <p className="font-bold text-lg flex gap-3">
                    <span className="text-primary/40">0{qIdx + 1}.</span>
                    {q.question}
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    {q.options.map((opt: string, oIdx: number) => {
                      const isSelected = userAnswers[qIdx] === opt;
                      const isCorrect = opt === q.correctAnswer;
                      let variantClasses = "border-border hover:border-primary/50 bg-muted/30";
                      if (isSelected) variantClasses = "border-primary bg-primary/5 ring-2 ring-primary/20";
                      if (isCorrected) {
                        if (isCorrect) variantClasses = "border-emerald-500 bg-emerald-500/10 text-emerald-700 ring-2 ring-emerald-500/20 font-bold";
                        else if (isSelected && !isCorrect) variantClasses = "border-destructive bg-destructive/10 text-destructive ring-2 ring-destructive/20";
                        else variantClasses = "border-border opacity-50 bg-muted/10";
                      }
                      return (
                        <button key={oIdx} disabled={isCorrected} onClick={() => handleSelectOption(qIdx, opt)}
                          className={`w-full p-4 rounded-2xl border text-left text-sm transition-all flex items-center justify-between group ${variantClasses}`}>
                          {opt}
                          {isCorrected && isCorrect && <i className="bi bi-check-circle-fill text-emerald-500"></i>}
                          {isCorrected && isSelected && !isCorrect && <i className="bi bi-x-circle-fill text-destructive"></i>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 mt-6 border-t border-border shrink-0 space-y-4">
              {isCorrected && (
                <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/10 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase text-primary tracking-widest">Resultado Final</p>
                      <p className="text-sm font-bold">Has acertado {score} de {totalQuestions} preguntas</p>
                    </div>
                  </div>
                  <p className="text-2xl font-black text-primary">{Math.round((score / totalQuestions) * 100)}%</p>
                </div>
              )}
              <div className="flex gap-4">
                {!isCorrected ? (
                  <button onClick={() => setIsCorrected(true)} disabled={Object.keys(userAnswers).length < totalQuestions}
                    className="flex-1 bg-primary text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-primary/20 disabled:opacity-50 transition-all active:scale-95">
                    Corregir Cuestionario
                  </button>
                ) : (
                  <button onClick={() => { setIsCorrected(false); setUserAnswers({}); }}
                    className="flex-1 bg-muted text-foreground py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95">
                    Reiniciar Intento
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ELIMINAR */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-[32px] p-8 max-w-sm w-full shadow-2xl text-center">
            <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="bi bi-exclamation-triangle text-3xl"></i>
            </div>
            <h3 className="text-xl font-black mb-2">¿Eliminar Unidad?</h3>
            <p className="text-sm text-muted-foreground mb-8">Esta acción es irreversible.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-6 py-3 rounded-xl bg-muted text-foreground text-[10px] font-black uppercase tracking-widest transition-all">
                Cancelar
              </button>
              <button onClick={handleDelete} disabled={isDeleting} className="flex-1 px-6 py-3 rounded-xl bg-destructive text-white text-[10px] font-black uppercase tracking-widest shadow-lg transition-all disabled:opacity-50">
                {isDeleting ? "Eliminando..." : "Sí, Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}