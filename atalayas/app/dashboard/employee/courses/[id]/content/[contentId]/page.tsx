'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import { API_ROUTES } from '@/lib/utils';
import mediumZoom from 'medium-zoom';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function EmployeeContentDetail() {
  const params = useParams();
  const zoomRef = useRef<HTMLImageElement>(null);
  const searchParams = useSearchParams();
  const fromTaskId = searchParams.get('fromTask');

  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // --- ESTADO PARA EL MODAL DE QUIZ ---
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false)

  const getQuizQuestions = (quizSource: any) => {
    if (!quizSource) return [];
    if (Array.isArray(quizSource)) return quizSource;
    return quizSource.questions || [];
  };

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const courseId = params.id as string;
        const contentId = params.contentId as string;
        const res = await fetch(API_ROUTES.CONTENT.GET_BY_ID(courseId, contentId), {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await res.json();
        setContent(data.content || data.data || data);
        if (data.isCompleted) {
          setQuizSubmitted(true);
          setQuizScore(data.quiz?.questions?.length || 0); // Visualmente mostramos éxito
        }
      } catch (error) {
        console.error("❌ Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [params.contentId, params.id]);

  useEffect(() => {
    const autoConfirmTask = async () => {
      if (fromTaskId) {
        try {
          const token = localStorage.getItem("token");
          await fetch(API_ROUTES.ONBOARDING.TOGGLE, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ taskId: fromTaskId, done: true }),
          });
          console.log("Tarea de onboarding completada automáticamente");
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

  const handleQuizSubmit = () => {
    const questions = getQuizQuestions(content.quiz);
    let correctCount = 0;
    questions.forEach((q: any, index: number) => {
      if (quizAnswers[index] === q.correctAnswer) correctCount++;
    });
    setQuizScore(correctCount);
    setQuizSubmitted(true);
  };

  // Pantalla de carga (Solo una vez y con estilos corporativos)
  if (loading) return (
    <div className="flex min-h-screen bg-background font-sans">
      <Sidebar role="EMPLOYEE" />
      <main className="flex-1 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
      </main>
    </div>
  );

  if (!content) return null;

  const hasResources = content.url || content.podcast;

  return (
    <div className="flex min-h-screen bg-background font-sans">
      <Sidebar role="EMPLOYEE" />

      <main className="flex-1 h-screen overflow-y-auto">

        {/* HEADER */}
        <div className="bg-card border-b border-border py-8 lg:py-10">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <Link href={`/dashboard/employee/courses/${params.id}`}
              className="flex items-center gap-1 text-secondary text-sm font-bold hover:opacity-80 transition-opacity mb-6 inline-flex">
              <i className="bi bi-chevron-left"></i> Volver al curso
            </Link>

            <div className="flex items-center gap-6 flex-wrap">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-3xl flex items-center justify-center text-3xl flex-shrink-0">
                <i className="bi bi-journal-text"></i>
              </div>
              <div className="flex-1 min-w-[250px]">
                <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight mb-2">
                  {content.title}
                </h1>
                <span className="inline-flex items-center text-[10px] font-black px-3 py-1 rounded-full bg-secondary/10 text-secondary uppercase tracking-wider">
                  Lección {content.order || 1}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CUERPO DINÁMICO */}
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-10 lg:py-12">
          <div className={`grid grid-cols-1 ${hasResources ? 'lg:grid-cols-[1fr_300px]' : ''} gap-10 lg:gap-16`}>

            {/* COLUMNA IZQUIERDA: CONTENIDO */}
            <article>
              <h3 className="text-xl font-bold text-foreground mb-6">
                Desarrollo de la unidad
              </h3>

              <div className="prose prose-slate max-w-none">
                <p className="text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {content.summary || 'Sin contenido proporcionado.'}
                </p>
              </div>

              {content.imageUrl && (
                <div className="mt-8 overflow-hidden rounded-3xl border border-border shadow-sm">
                  <img ref={zoomRef} src={content.imageUrl} alt={content.title} className="w-full h-auto cursor-zoom-in" />
                </div>
              )}
            </article>

            {/* COLUMNA DERECHA: RECURSOS EXTRA (Solo si hay) */}
            {hasResources && (
              <aside className="space-y-6">
                <h4 className="text-[11px] font-black text-muted-foreground uppercase tracking-widest px-1">Material Extra</h4>

                {content.url && (
                  <div className="bg-card p-6 rounded-3xl border border-border shadow-sm text-center hover:border-secondary/50 transition-colors">
                    <div className="text-4xl text-primary mb-3"><i className="bi bi-file-earmark-pdf"></i></div>
                    <p className="text-[11px] font-black text-foreground uppercase mb-5 tracking-widest">Guía PDF</p>
                    <a href={content.url} target="_blank" rel="noopener noreferrer"
                      className="block w-full py-3 bg-secondary text-secondary-foreground rounded-2xl text-sm font-bold hover:opacity-90 transition-opacity shadow-sm">
                      Abrir PDF
                    </a>
                  </div>
                )}

                {content.podcast && (
                  <div className="bg-indigo-600 p-6 rounded-3xl text-white shadow-xl shadow-indigo-600/20">
                    <div className="flex items-center gap-3 mb-5">
                      <span className="text-2xl text-indigo-300"><i className="bi bi-mic-fill"></i></span>
                      <p className="text-[10px] font-black opacity-80 tracking-widest uppercase text-white">Podcast IA</p>
                    </div>
                    <button className="w-full py-3.5 bg-white text-indigo-600 rounded-2xl text-sm font-bold hover:bg-indigo-50 transition-colors shadow-sm">
                      Escuchar Resumen
                    </button>
                  </div>
                )}
              </aside>
            )}
          </div>

          <aside className="w-80 border-l border-gray-200 bg-white p-6 hidden xl:flex flex-col gap-6 overflow-y-auto">
            <h3 className="text-xs font-black uppercase text-gray-400 tracking-tighter">Material Complementario</h3>
            {/*<ResourcesList /> */}
          </aside>
        </div>
      </main>

      {/* MODAL DEL QUIZ CON FEEDBACK VISUAL */}
      {showQuizModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer" onClick={() => !quizSubmitted && setShowQuizModal(false)} />
          <div className="relative bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-6 md:p-10 custom-scrollbar">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl md:text-2xl font-black text-gray-900">Cuestionario</h2>
              <button onClick={() => setShowQuizModal(false)} className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer">
                <i className="bi bi-x-circle-fill text-2xl"></i>
              </button>
            </div>

            <div className="space-y-8">
              {getQuizQuestions(content.quiz).map((q: any, i: number) => (
                <div key={i} className="space-y-4">
                  <p className="font-bold text-gray-800">{i + 1}. {q.question}</p>
                  <div className="grid gap-2">
                    {q.options.map((opt: string, idx: number) => {
                      const isSelected = quizAnswers[i] === opt;
                      const isCorrect = q.correctAnswer === opt;
                      let style = "border-gray-100 text-gray-600 hover:border-gray-300";

                      if (quizSubmitted) {
                        if (isCorrect) style = "border-green-500 bg-green-50 text-green-700";
                        else if (isSelected) style = "border-red-500 bg-red-50 text-red-700";
                        else style = "opacity-50 border-gray-100";
                      } else if (isSelected) {
                        style = "border-blue-500 bg-blue-50 text-blue-700";
                      }

                      return (
                        <button
                          key={idx}
                          disabled={quizSubmitted}
                          onClick={() => setQuizAnswers(prev => ({ ...prev, [i]: opt }))}
                          className={`text-left p-4 rounded-xl border-2 transition-all font-medium text-sm md:text-base cursor-pointer ${style}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 border-t pt-6">
              {quizSubmitted ? (
                <div className="space-y-4">
                  <div className={`${quizScore === getQuizQuestions(content.quiz).length ? 'bg-green-600' : 'bg-blue-600'} p-6 rounded-2xl text-white flex flex-col md:flex-row items-center justify-between gap-4 transition-colors`}>
                    <div>
                      <p className="text-sm opacity-80 uppercase font-bold tracking-tighter">
                        {quizScore === getQuizQuestions(content.quiz).length ? '¡Excelente!' : 'Tu puntuación'}
                      </p>
                      <p className="text-3xl font-black">{quizScore} / {getQuizQuestions(content.quiz).length}</p>
                    </div>

                    <div className="flex gap-2">
                      {quizScore < getQuizQuestions(content.quiz).length && (
                        <button
                          onClick={() => {
                            setQuizAnswers({});
                            setQuizSubmitted(false);
                          }}
                          className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-xl font-bold cursor-pointer transition-all"
                        >
                          Reintentar
                        </button>
                      )}
                      <button onClick={() => setShowQuizModal(false)} className="bg-white text-blue-600 px-6 py-2 rounded-xl font-bold cursor-pointer">
                        Cerrar
                      </button>
                    </div>
                  </div>

                  {quizScore < getQuizQuestions(content.quiz).length && (
                    <p className="text-center text-xs text-gray-500 font-medium">
                      Debes acertar todas las preguntas para completar esta unidad.
                    </p>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleQuizSubmit}
                  className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-blue-600 transition-all disabled:opacity-50 cursor-pointer"
                  disabled={Object.keys(quizAnswers).length < getQuizQuestions(content.quiz).length}
                >
                  Enviar Respuestas
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .markdown-body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; !important; 
          font-size: 1.1rem; 
          line-height: 1.75; 
          color: #374151; 
        }
        .markdown-body strong { 
          display: block; 
          font-size: 1.5rem; 
          font-weight: 800; 
          color: #111827; 
          margin-top: 2.5rem; 
          margin-bottom: 1rem; 
          letter-spacing: -0.02em; 
          line-height: 1.2;
        }
        .markdown-body p { margin-bottom: 1.5rem; }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d1d6; border-radius: 10px; }
      `}</style>
    </div>
  );
}