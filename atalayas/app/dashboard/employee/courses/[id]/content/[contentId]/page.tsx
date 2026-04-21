"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Sidebar from "@/components/ui/Sidebar";
import { API_ROUTES } from "@/lib/utils";
import mediumZoom from "medium-zoom";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

const appleFont = "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji'";

export default function EmployeeContentDetail() {
  const params = useParams();
  const zoomRef = useRef<HTMLImageElement>(null);
  const searchParams = useSearchParams();
  const fromTaskId = searchParams.get('fromTask');

  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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
        const res = await fetch(API_ROUTES.CONTENT.GET_BY_ID(params.id as string, params.contentId as string), {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
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
      const zoom = mediumZoom(zoomRef.current, { background: "rgba(0,0,0,0.9)", margin: 24 });
      return () => { zoom.detach(); };
    }
  }, [content?.imageUrl]);

  const handleQuizSubmit = async () => {
  const questions = getQuizQuestions(content.quiz);
  let correctCount = 0;
  
  questions.forEach((q: any, index: number) => {
    if (quizAnswers[index] === q.correctAnswer) correctCount++;
  });

  setQuizScore(correctCount);
  setQuizSubmitted(true);

  // Solo disparamos la API si sacó el 100%
  if (correctCount === questions.length) {
    try {
      const courseId = params.id as string;
      const contentId = params.contentId as string;

      const res = await fetch(API_ROUTES.CONTENT.COMPLETE(courseId, contentId), {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}` 
        },
        body: JSON.stringify({ 
          score: correctCount,
          totalQuestions: questions.length
        }),
      });

      if (res.ok) {
  console.log("⭐ ¡Progreso guardado con éxito!");
  
  // OPCIÓN A: Si tienes un estado que controla si está completado
  setIsCompleted(true); 

  // OPCIÓN B: Si usas un objeto "content", actualiza su propiedad
  // setContent(prev => ({ ...prev, isCompleted: true }));
}
    } catch (error) {
      console.error("❌ Error al conectar con el servidor:", error);
    }
  }
};

  const ResourcesList = () => (
    <div className="flex flex-col gap-4">
      {content?.podcast?.url && (
        <div className="bg-gray-900 p-5 rounded-2xl text-white shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
            <p className="text-[9px] font-bold opacity-50 tracking-widest uppercase">Audio del contenido</p>
          </div>
          <audio src={content.podcast.url} controls className="w-full h-8 invert cursor-pointer" />
        </div>
      )}

      {content?.quiz && (
        <button 
          onClick={() => {
            setQuizAnswers({});
            setQuizSubmitted(false);
            setShowQuizModal(true);
          }} 
          className="group flex items-center justify-between p-4 bg-orange-50 border border-orange-100 rounded-2xl hover:bg-orange-100 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-sm">
              <i className="bi bi-patch-question-fill text-xl"></i>
            </div>
            <div className="text-left">
              <p className="text-[10px] font-bold text-orange-600 uppercase tracking-tight">Autoevaluación</p>
              <p className="text-sm font-bold text-gray-900">Realizar Test</p>
            </div>
          </div>
          <i className="bi bi-chevron-right text-orange-300 group-hover:translate-x-1 transition-transform"></i>
        </button>
      )}

      {content?.url && (
        <a href={content.url} target="_blank" className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-100 rounded-2xl hover:border-blue-500 transition-all group cursor-pointer">
          <i className="bi bi-file-earmark-pdf text-3xl text-red-500"></i>
          <div>
            <p className="text-sm font-bold text-gray-900">Documento PDF</p>
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Descargar Material</p>
          </div>
        </a>
      )}
    </div>
  );

  if (loading) return <div className="h-screen bg-[#f5f5f7] flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  if (!content) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f5f7]" style={{ fontFamily: appleFont }}>
      <Sidebar role="EMPLOYEE" />

      <main className="flex-1 flex flex-col min-w-0">    
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-6 md:px-8 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/employee/courses/${params.id}`} className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
              <i className="bi bi-chevron-left text-xl"></i>
            </Link>
            <div>
              <h1 className="text-base md:text-lg font-bold text-gray-900 truncate max-w-45 md:max-w-md">{content.title}</h1>
              <p className="text-[9px] md:text-[10px] font-bold text-blue-600 uppercase tracking-widest">Unidad de aprendizaje</p>
            </div>
          </div>
           {/* Si está completado*/}
            {(isCompleted) && (
              <div className="bg-green-100 text-green-700 p-4 rounded-lg flex items-center ">
                <i className="bi bi-trophy-fill text-yellow-300 mr-2"> </i><span>¡Has completado este contenido!</span>
              </div>
            )}
        </header>

        <div className="flex-1 flex flex-col xl:flex-row overflow-hidden">
          <div className="flex-1 overflow-y-auto bg-[#e4e4e7] p-4 md:p-10 custom-scrollbar">
            <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-sm min-h-full p-8 md:p-20 mb-10">
              <article className="markdown-body">
                <ReactMarkdown>{content.summary || "No hay descripción disponible."}</ReactMarkdown>
              </article>

              {content.imageUrl && (
                <div className="mt-12 pt-12 border-t border-gray-100">
                  <img ref={zoomRef} src={content.imageUrl} className="w-full rounded-lg shadow-sm cursor-zoom-in" alt="Content" />
                </div>
              )}

              {/* Visible en móvil al final del texto */}
              <div className="mt-12 pt-8 border-t border-gray-100 xl:hidden">
                <h3 className="text-xs font-black uppercase text-gray-400 tracking-tighter mb-6">Material Complementario</h3>
                <ResourcesList />
              </div>
            </div>
          </div>

          <aside className="w-80 border-l border-gray-200 bg-white p-6 hidden xl:flex flex-col gap-6 overflow-y-auto">
             <h3 className="text-xs font-black uppercase text-gray-400 tracking-tighter">Material Complementario</h3>
             <ResourcesList />
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
          font-family: ${appleFont} !important; 
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