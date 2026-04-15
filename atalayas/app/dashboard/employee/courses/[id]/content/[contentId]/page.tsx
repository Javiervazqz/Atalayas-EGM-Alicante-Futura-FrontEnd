"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/ui/Sidebar";
import { API_ROUTES } from "@/lib/utils";
import mediumZoom from "medium-zoom";
import Link from "next/link";

const appleFont =
  "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif";

export default function EmployeeContentDetail() {
  const params = useParams();
  const router = useRouter();
  const zoomRef = useRef<HTMLImageElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // --- NUEVO ESTADO PARA EL MODAL ---
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

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
      } catch (error) {
        console.error("❌ Error cargando el contenido:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [params.contentId, params.id]);

  useEffect(() => {
    if (zoomRef.current && content?.imageUrl) {
      const zoom = mediumZoom(zoomRef.current, {
        background: "rgba(0,0,0,0.8)",
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

  if (loading)
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  if (!content) return null;

  return (
    <div
      className="flex flex-col md:flex-row min-h-screen bg-[#f5f5f7]"
      style={{ fontFamily: appleFont }}
    >
      <Sidebar role="EMPLOYEE" />

      <main className="flex-1 h-screen overflow-y-auto w-full">
        <div className="bg-white border-b border-black/5 py-6 md:py-8">
          <div className="max-w-5xl mx-auto px-6">
            <Link
              href={`/dashboard/employee/courses/${params.id}`}
              className="group text-[#0071e3] text-sm font-semibold hover:underline mb-4 inline-flex items-center gap-2"
            >
              <i className="bi bi-arrow-left-circle-fill transition-transform group-hover:-translate-x-1"></i>
              <span>Volver al curso</span>
            </Link>

            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl shrink-0">
                <i className="bi bi-book-fill text-blue-400"></i>
              </div>

              <div className="flex-1">
                <h1 className="text-xl md:text-3xl font-extrabold text-[#1d1d1f] leading-tight">
                  {content?.title}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-block mt-2 text-[12px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                    Unidad de aprendizaje
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="content-layout">
            <aside className="action-box space-y-4 md:order-2">
              {content.podcast?.url && (
                <div className="bg-[#1d1d1f] p-5 rounded-[2rem] text-white shadow-xl">
                  <span className="relative flex h-2 w-2 mb-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                  <p className="text-[9px] font-black uppercase opacity-50 mb-2 flex items-center gap-1">
                    <i className="bi bi-mic-fill"></i> Podcast de la lección
                  </p>
                  <audio
                    ref={audioRef}
                    controls
                    className="w-full h-8 invert opacity-80"
                    src={content.podcast.url}
                  />
                </div>
              )}

              {content.quiz && (
                <button
                  onClick={() => setShowQuizModal(true)}
                  className="w-full group bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-500">
                      <i className="bi bi-patch-question-fill text-xl"></i>
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-black uppercase text-gray-400">Autoevaluación</p>
                      <p className="text-sm font-bold text-gray-800">Realizar Test</p>
                    </div>
                  </div>
                  <i className="bi bi-caret-down-square-fill text-gray-300 group-hover:text-orange-500 transition-colors"></i>
                </button>
              )}

              {content.url && !content.url.includes(".mp3") && (
                <div className="bg-white p-4 rounded-3xl border border-black/5 text-center">
                  <p className="text-[9px] font-bold text-gray-400 uppercase mb-3">
                    Material Adjunto
                  </p>
                  <a
                    href={content.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block w-full py-2.5 bg-[#f5f5f7] text-black rounded-xl text-[11px] font-bold hover:bg-gray-200 transition-all"
                  >
                    <i className="bi bi-file-earmark-pdf"></i> Abrir Documento
                  </a>
                </div>
              )}
            </aside>

            <div className="md:order-1">
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
            </div>
          </div>
        </div>
      </main>

      {/* --- NUEVO: MODAL DEL TEST CON FONDO DIFUMINADO --- */}
      {showQuizModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-6">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity"
            onClick={() => !quizSubmitted && setShowQuizModal(false)}
          />

          <div className="relative bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl p-8 md:p-10">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-black text-gray-900">Test de Unidad</h2>
                <p className="text-sm text-gray-500">Valida tus conocimientos</p>
              </div>
              <button 
                onClick={() => setShowQuizModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="space-y-8">
              {getQuizQuestions(content.quiz).map((pregunta: any, index: number) => (
                <div key={index} className="space-y-4">
                  <p className="text-base font-bold text-gray-800 leading-tight">
                    <span className="text-blue-500 mr-2">{index + 1}.</span>
                    {pregunta.question}
                  </p>
                  <div className="grid gap-3">
                    {pregunta.options.map((opcion: string, i: number) => (
                      <button
                        key={i}
                        onClick={() => !quizSubmitted && setQuizAnswers(prev => ({ ...prev, [index]: opcion }))}
                        className={`text-left p-4 rounded-2xl border-2 transition-all text-sm font-semibold ${
                          quizAnswers[index] === opcion
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-50 bg-[#f5f5f7] text-gray-600 hover:border-gray-200"
                        }`}
                      >
                        {opcion}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 pt-6 border-t border-gray-100">
              {quizSubmitted ? (
                <div className="flex flex-col md:flex-row items-center gap-6 bg-blue-600 p-6 rounded-[2rem] text-white">
                  <div className="flex-1 text-center md:text-left">
                    <p className="text-[10px] font-black uppercase opacity-70">Resultado</p>
                    <p className="text-2xl font-black">{quizScore} / {getQuizQuestions(content.quiz).length} aciertos</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setQuizSubmitted(false); setQuizAnswers({}); }} className="px-5 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl font-bold text-xs transition-colors">Reintentar</button>
                    <button onClick={() => setShowQuizModal(false)} className="px-5 py-2.5 bg-white text-blue-600 rounded-xl font-bold text-xs shadow-lg transition-transform active:scale-95">Finalizar</button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleQuizSubmit}
                  disabled={Object.keys(quizAnswers).length === 0}
                  className="w-full py-5 bg-[#1d1d1f] text-white rounded-2xl font-bold shadow-xl hover:bg-blue-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Corregir Test
                </button>
              )}
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