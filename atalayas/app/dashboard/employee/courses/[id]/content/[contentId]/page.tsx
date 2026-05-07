'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/ui/Sidebar';
import PageHeader from '@/components/ui/pageHeader';
import { API_ROUTES } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import zoom from 'medium-zoom';

interface LabProps { data: any; }

const InteractiveLab = dynamic<LabProps>(
  () => import("@/components/interactiveLab").then((mod) => mod.default),
  { ssr: false, loading: () => <div className="text-white font-black animate-pulse">CARGANDO MOTOR GRÁFICO...</div> }
);

const labelClass = "text-[10px] font-black uppercase text-primary tracking-[0.2em] mb-2 block";
const tabBtnClass = "pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative";

type TabType = "multimedia" | "lectura" | "evaluacion";

export default function EmployeeContentDetail() {
  const params = useParams();
  const audioRef = useRef<HTMLAudioElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("lectura");
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showLabModal, setShowLabModal] = useState(false);
  const [isLabStarted, setIsLabStarted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isCorrected, setIsCorrected] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch(API_ROUTES.CONTENT.GET_BY_ID(params.id as string, params.contentId as string), {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        const raw = data?.data || data?.content || data || {};
        setContent(raw);
      } catch (error) {
        console.error("Error fetching content:", error);
      } finally {
        setLoading(false);
      }
    };
    if (params.id && params.contentId) fetchContent();
  }, [params.id, params.contentId]);

  useEffect(() => {
  if (activeTab === "lectura" && imageRef.current) {
    const zoomInstance = zoom(imageRef.current, { background: "rgba(0,0,0,0.9)", margin: 40 });
    return () => { zoomInstance.detach(); }; // ← llaves añadidas
  }
}, [content?.imageUrl, activeTab]);

// Ahora verificamos si content.quiz es un array y tiene elementos
const hasQuiz = Array.isArray(content?.quiz) && content.quiz.length > 0;  const hasVideo = !!content?.videoUrl;

  return (
    <div className="flex h-screen bg-background font-sans text-foreground overflow-hidden">
      <Sidebar role="EMPLOYEE" />

      <main className="flex-1 flex flex-col min-w-0 relative">
        <PageHeader
          title={content?.title || "Cargando..."}
          description="Unidad de aprendizaje"
          icon={<i className="bi bi-book"></i>}
          backUrl={`/dashboard/employee/courses/${params.id}`}
        />

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto bg-muted/30 p-8 no-scrollbar">
            <div className="max-w-4xl mx-auto bg-card shadow-xl border border-border/50 rounded-[2.5rem] overflow-hidden mb-10">
              
              {/* Navegación de Pestañas Condicional */}
              <div className="flex px-12 pt-8 border-b border-border gap-8">
                <button onClick={() => setActiveTab("lectura")} className={`${tabBtnClass} ${activeTab === "lectura" ? "text-primary" : "text-muted-foreground"}`}>
                  Lectura
                  {activeTab === "lectura" && <span className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full" />}
                </button>
                
                {hasVideo && (
                  <button onClick={() => setActiveTab("multimedia")} className={`${tabBtnClass} ${activeTab === "multimedia" ? "text-primary" : "text-muted-foreground"}`}>
                    Multimedia
                    {activeTab === "multimedia" && <span className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full" />}
                  </button>
                )}

                {hasQuiz && (
                  <button onClick={() => setActiveTab("evaluacion")} className={`${tabBtnClass} ${activeTab === "evaluacion" ? "text-primary" : "text-muted-foreground"}`}>
                    Evaluación
                    {activeTab === "evaluacion" && <span className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full" />}
                  </button>
                )}
              </div>

              <div className="p-8 md:p-16">
                {activeTab === "lectura" && (
                  <div className="animate-in fade-in duration-500 space-y-10">
                    {content?.imageUrl && (
                      <img ref={imageRef} src={content.imageUrl} className="w-full aspect-video object-cover rounded-[2rem] shadow-lg border border-border/50" alt="Cover" />
                    )}
                    <div className="prose dark:prose-invert max-w-none">
                      <ReactMarkdown components={{
                        h2: ({node, ...props}) => <h2 className="text-2xl font-black text-foreground mt-10 mb-6" {...props} />,
                        p: ({node, ...props}) => <p className="text-[17px] leading-[1.8] text-muted-foreground mb-6" {...props} />,
                        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-primary bg-muted/40 p-6 rounded-r-2xl my-8 italic" {...props} />,
                      }}>
                        {content?.summary}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}

                {activeTab === "multimedia" && hasVideo && (
                  <div className="aspect-video rounded-[2rem] overflow-hidden bg-black shadow-2xl">
                    <video key={content.videoUrl} controls className="w-full h-full object-cover">
                      <source src={content.videoUrl} type="video/mp4" />
                    </video>
                  </div>
                )}

                {activeTab === "evaluacion" && hasQuiz && (
                  <div className="bg-orange-500/5 border border-orange-500/10 rounded-[2rem] p-12 text-center space-y-6">
                    <div className="w-20 h-20 bg-orange-500 text-white rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-orange-500/20">
                      <i className="bi bi-patch-question text-4xl"></i>
                    </div>
                    <h4 className="text-2xl font-black italic">¿Listo para el test?</h4>
                    <button onClick={() => setShowQuizModal(true)} className="bg-orange-500 text-white px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all">
                      Iniciar Autoevaluación
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="w-80 border-l border-border bg-card p-6 flex flex-col gap-6 overflow-y-auto no-scrollbar">
            {content?.podcast?.url && (
              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg"><i className="bi bi-mic-fill"></i></div>
                  <div>
                    <p className="text-[9px] font-black uppercase text-emerald-600">Audio Guía</p>
                    <p className="text-[11px] font-bold opacity-70">Escuchar unidad</p>
                  </div>
                </div>
                <audio ref={audioRef} src={content.podcast.url} controls className="w-full h-8 accent-emerald-500" />
              </div>
            )}

            <h4 className={labelClass}>Materiales</h4>
            {content?.url?.toLowerCase().includes(".pdf") && (
              <a href={content.url} target="_blank" rel="noopener noreferrer" className="w-full p-4 bg-muted/50 border border-border rounded-2xl flex items-center gap-4 hover:border-primary transition-all">
                <div className="w-10 h-10 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center shrink-0"><i className="bi bi-file-earmark-pdf text-xl"></i></div>
                <div className="text-left overflow-hidden">
                  <p className="text-[8px] font-black uppercase text-muted-foreground">Recurso PDF</p>
                  <p className="text-xs font-bold text-foreground truncate">Descargar Guía</p>
                </div>
              </a>
            )}

            {content?.practiceLab && (
              <button onClick={() => setShowLabModal(true)} className="w-full p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-center gap-4 hover:border-blue-500 transition-all text-left">
                <div className="w-10 h-10 bg-blue-500 text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20"><i className="bi bi-controller text-xl"></i></div>
                <div className="overflow-hidden">
                  <p className="text-[8px] font-black uppercase text-blue-600">Simulador IA</p>
                  <p className="text-xs font-bold text-foreground truncate">Práctica Interactiva</p>
                </div>
              </button>
            )}
          </aside>
        </div>
      </main>

      {/* Modales de Lab y Quiz (Lógica de vista estudiante) */}
      {showLabModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl md:p-4">
          <div className="bg-card border border-border md:rounded-[40px] w-full max-w-6xl h-full md:h-[90vh] relative overflow-hidden flex flex-col">
            <button onClick={() => { setShowLabModal(false); setIsLabStarted(false); }} className="absolute top-4 right-4 z-50 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white"><i className="bi bi-x-lg"></i></button>
            <div className="flex-1 bg-slate-950 overflow-hidden">
              {!isLabStarted ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-20 h-20 bg-blue-500/20 text-blue-500 rounded-3xl flex items-center justify-center"><i className="bi bi-controller text-4xl"></i></div>
                  <h3 className="text-2xl font-black text-white">{content?.practiceLab?.scenarioTitle}</h3>
                  <button onClick={() => setIsLabStarted(true)} className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs">Empezar Práctica</button>
                </div>
              ) : (
                <div className="w-full h-full"><InteractiveLab data={content.practiceLab} /></div>
              )}
            </div>
          </div>
        </div>
      )}

      {showQuizModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-card border border-border rounded-[32px] p-8 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black italic">Evaluación de Unidad</h3>
              <button onClick={() => setShowQuizModal(false)}><i className="bi bi-x-circle text-2xl"></i></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-10 no-scrollbar">
              {content?.quiz?.map((q: any, qIdx: number) => (
                <div key={qIdx} className="space-y-4">
                  <p className="font-bold text-lg">{q.question}</p>
                  <div className="grid gap-2">
                    {q.options.map((opt: string, oIdx: number) => {
                      const isSelected = userAnswers[qIdx] === opt;
                      const isCorrect = isCorrected && opt === q.correctAnswer;
                      const isWrong = isCorrected && isSelected && opt !== q.correctAnswer;
                      return (
                        <button
                          key={oIdx}
                          disabled={isCorrected}
                          onClick={() => setUserAnswers({ ...userAnswers, [qIdx]: opt })}
                          className={`w-full p-4 rounded-xl border text-left text-sm transition-all 
                            ${isSelected ? "border-primary bg-primary/5" : "border-border"}
                            ${isCorrect ? "border-emerald-500 bg-emerald-500/10" : ""}
                            ${isWrong ? "border-red-500 bg-red-500/10" : ""}
                          `}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            {!isCorrected && (
              <div className="pt-6 mt-6 border-t border-border">
                <button onClick={() => setIsCorrected(true)} className="w-full bg-primary text-white py-4 rounded-xl font-black uppercase text-xs">Enviar Respuestas</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}