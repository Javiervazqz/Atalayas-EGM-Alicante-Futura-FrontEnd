'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import PageHeader from '@/components/ui/pageHeader';
import { API_ROUTES } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import mediumZoom from 'medium-zoom';
import Link from 'next/link';

export default function EmployeeContentDetail() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const audioRef = useRef<HTMLAudioElement>(null);
  const zoomRef = useRef<HTMLImageElement>(null);
  
  const fromTaskId = searchParams.get('fromTask');

  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Estados para el Quiz
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isCorrected, setIsCorrected] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Helper para normalizar preguntas del quiz
  const getQuizQuestions = (quizSource: any) => {
    if (!quizSource) return [];
    if (Array.isArray(quizSource)) return quizSource;
    return quizSource.questions || [];
  };

  useEffect(() => {
    const fetchContent = async () => {
      if (!params.id || !params.contentId) return;
      try {
        const res = await fetch(API_ROUTES.CONTENT.GET_BY_ID(params.id as string, params.contentId as string), {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        const data = await res.json();
        const rawData = data?.data || data?.content || data || {};
        setContent(rawData);
      } catch (error) { 
        console.error("Error cargando unidad:", error); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchContent();

    const markAccess = async () => {
      const contentId = params.contentId as string;
      await fetch(`${API_ROUTES.ENROLLMENTS.BASE}/content-access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ contentId }),
      });
    };
    
    if (params.contentId) {
      markAccess();
    }
  }, [params.contentId, params.id]);

  // Autocompletar tarea de onboarding si viene de un link específico
  useEffect(() => {
    const autoConfirmTask = async () => {
      if (fromTaskId) {
        try {
          await fetch(API_ROUTES.ONBOARDING.TOGGLE, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ taskId: fromTaskId, done: true }),
          });
        } catch (err) {
          console.error("Error al autocompletar:", err);
        }
      }
    };
    autoConfirmTask();
  }, [fromTaskId]);

  useEffect(() => {
    if (zoomRef.current && content?.imageUrl) {
      const zoom = mediumZoom(zoomRef.current, {
        background: "rgba(250,250,249,0.95)", // Usando un fondo claro como tu app
        margin: 24,
      });
      return () => {
        zoom.detach();
      };
    }
  }, [content?.imageUrl]);

  const handleQuizSubmit = async () => {
    // 1. Mostrar resultados visualmente activando la corrección
    setIsCorrected(true);

    // 2. Enviar la puntuación al backend
    try {
      const token = localStorage.getItem('token');

      await fetch(
        API_ROUTES.CONTENT.COMPLETE(
          params.id as string,
          content.id
        ),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            score: score, // Usamos la constante 'score' que ya calculas abajo
            totalQuestions: totalQuestions, // Usamos la constante 'totalQuestions'
          }),
        });

      console.log("Quiz enviado al backend");
    } catch (error) {
      console.error("Error enviando quiz:", error);
    }
  };

  // Pantalla de carga (Solo una vez y con estilos corporativos)
  const handleSelectOption = (qIdx: number, option: string) => {
    if (isCorrected) return;
    setUserAnswers(prev => ({ ...prev, [qIdx]: option }));
  };

  const resetQuiz = () => {
    setUserAnswers({});
    setIsCorrected(false);
    setShowQuizModal(false);
  };

  const questions = getQuizQuestions(content?.quiz);
  const score = questions.reduce((acc: number, q: any, idx: number) => {
    return userAnswers[idx] === q.correctAnswer ? acc + 1 : acc;
  }, 0);
  const totalQuestions = questions.length;

  if (loading) return (
    <div className="flex h-screen bg-background font-sans items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex h-screen bg-background font-sans text-foreground overflow-hidden">
      <Sidebar role="EMPLOYEE" />

      <main className="flex-1 flex flex-col min-w-0 relative">
        <PageHeader 
          title={content?.title || "Unidad Didáctica"}
          description={`Lección ${content?.order || ''}`}
          icon={<i className="bi bi-book"></i>}
          backUrl={`/dashboard/employee/courses/${params.id}`}
        />

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto bg-muted/30 p-8 no-scrollbar">
            <div className="max-w-4xl mx-auto bg-card shadow-xl border border-border/50 rounded-xl p-8 md:p-16 mb-10">
              
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

                {content?.imageUrl && (
                  <div className="mt-12 rounded-3xl overflow-hidden border border-border shadow-2xl">
                    <img 
                      ref={zoomRef}
                      src={content.imageUrl} 
                      alt="Ilustración de la unidad" 
                      className="w-full h-auto cursor-zoom-in"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="w-80 border-l border-border bg-card p-6 flex flex-col gap-6">
            <h4 className="text-[10px] font-black uppercase text-primary tracking-[0.2em] mb-2 block">Recursos</h4>
            
            {content?.podcast?.url && (
              <div className="relative group overflow-hidden bg-linear-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-[2rem] p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg">
                    <i className="bi bi-mic-fill text-lg"></i>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-emerald-600 tracking-tighter">Audio Podcast</p>
                    <p className="text-xs font-bold opacity-80">Resumen por IA</p>
                  </div>
                </div>
                <audio ref={audioRef} src={content.podcast.url} controls className="w-full h-8 accent-emerald-500 mb-2" />
              </div>
            )}

            {questions.length > 0 && (
              <button 
                onClick={() => setShowQuizModal(true)} 
                className="w-full p-4 bg-orange-400 text-white rounded-2xl flex items-center gap-4 hover:bg-orange-500 transition-all shadow-lg active:scale-95"
              >
                <i className="bi bi-patch-question text-2xl"></i>
                <div className="text-left">
                  <p className="text-[8px] font-bold uppercase opacity-70">Evaluación</p>
                  <p className="text-sm font-bold">Realizar Test</p>
                </div>
              </button>
            )}

            {content?.url?.toLowerCase().includes('.pdf') && (
              <a href={content.url} target="_blank" rel="noopener noreferrer"
                className="group w-full p-3 bg-muted border border-border rounded-2xl flex items-center gap-3 hover:border-primary transition-all active:scale-95">
                <div className="w-10 h-10 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center shrink-0">
                  <i className="bi bi-file-earmark-pdf text-xl"></i>
                </div>
                <div className="text-left overflow-hidden">
                  <p className="text-[8px] font-black uppercase text-muted-foreground tracking-tighter">Material PDF</p>
                  <p className="text-xs font-bold text-foreground truncate">Descargar guía</p>
                </div>
              </a>
            )}
          </aside>
        </div>
      </main>

      {/* MODAL DEL QUIZ INTERACTIVO */}
      {showQuizModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-card border border-border rounded-[32px] p-8 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="flex justify-between items-center mb-8 shrink-0">
              <div>
                <h3 className="text-2xl font-black">Cuestionario de Unidad</h3>
                <p className="text-xs text-muted-foreground">Responde correctamente para completar la lección</p>
              </div>
              <button onClick={resetQuiz} className="text-muted-foreground hover:text-foreground transition-colors">
                <i className="bi bi-x-circle text-2xl"></i>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-10 no-scrollbar">
              {questions.map((q: any, qIdx: number) => (
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
                        <button
                          key={oIdx}
                          disabled={isCorrected}
                          onClick={() => handleSelectOption(qIdx, opt)}
                          className={`w-full p-4 rounded-2xl border text-left text-sm transition-all flex items-center justify-between group ${variantClasses}`}
                        >
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
                <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/10 rounded-2xl animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center font-black">
                      {score}
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-primary tracking-widest">Tu Resultado</p>
                      <p className="text-sm font-bold">Has acertado {score} de {totalQuestions}</p>
                    </div>
                  </div>
                  <p className="text-2xl font-black text-primary">{Math.round((score / totalQuestions) * 100)}%</p>
                </div>
              )}

              <div className="flex gap-4">
                {!isCorrected ? (
                  <button
                    onClick={() => setIsCorrected(true)}
                    disabled={Object.keys(userAnswers).length < totalQuestions}
                    className="flex-1 bg-primary text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-primary/20 disabled:opacity-50 transition-all active:scale-95"
                  >
                    Enviar Respuestas
                  </button>
                ) : (
                  <button
                    onClick={() => { setIsCorrected(false); setUserAnswers({}); }}
                    className="flex-1 bg-muted text-foreground py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95"
                  >
                    Reintentar Test
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}