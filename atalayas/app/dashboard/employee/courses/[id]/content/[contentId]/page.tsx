'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import PageHeader from '@/components/ui/pageHeader';
import { API_ROUTES } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

// Mantenemos tus constantes de estilo para que la UI sea idéntica
const labelClass = "text-[10px] font-black uppercase text-primary tracking-[0.2em] mb-2 block";
const tabBtnClass = "pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative";

type TabType = 'multimedia' | 'lectura' | 'evaluacion';

export default function EmployeeContentDetail() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const audioRef = useRef<HTMLAudioElement>(null);
  const fromTaskId = searchParams.get('fromTask');

  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('lectura');
  
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isCorrected, setIsCorrected] = useState(false);

  // 1. Carga de datos
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
        console.error("Error:", error); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchContent();
  }, [params.contentId, params.id]);

  // 2. Lógica de Onboarding (Autocompletar tarea)
  useEffect(() => {
    if (fromTaskId && !loading) {
      const autoConfirmTask = async () => {
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
      };
      autoConfirmTask();
    }
  }, [fromTaskId, loading]);

  const questions = content?.quiz?.questions || (Array.isArray(content?.quiz) ? content.quiz : []);
  
  const score = questions.reduce((acc: number, q: any, idx: number) => {
    return userAnswers[idx] === q.correctAnswer ? acc + 1 : acc;
  }, 0);

  if (loading) return (
    <div className="flex h-screen bg-background items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex h-screen bg-background font-sans text-foreground overflow-hidden">
      <Sidebar role="EMPLOYEE" />

      <main className="flex-1 flex flex-col min-w-0 relative">
        <PageHeader 
          title={content?.title || "Cargando..."}
          description='Unidad de aprendizaje'
          icon={<i className="bi bi-book"></i>}
          backUrl={`/dashboard/employee/courses/${params.id}`}
        />

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto bg-muted/30 p-8 no-scrollbar">
            <div className="max-w-4xl mx-auto bg-card shadow-xl border border-border/50 rounded-[2.5rem] overflow-hidden mb-10">
              
              {/* NAVEGACIÓN POR PESTAÑAS (Igual que en Admin) */}
              <div className="flex px-12 pt-8 border-b border-border gap-8">
                {(['lectura', 'multimedia', 'evaluacion'] as TabType[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`${tabBtnClass} ${activeTab === tab ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {tab}
                    {activeTab === tab && <span className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full" />}
                  </button>
                ))}
              </div>

              <div className="p-8 md:p-16">
                <div className="animate-in fade-in duration-500">
                  
                  {/* TAB: MULTIMEDIA */}
                  {activeTab === 'multimedia' && (
                    <div className="space-y-6">
                      {content?.videoUrl ? (
                        <div className="aspect-video rounded-[2rem] overflow-hidden bg-black shadow-2xl">
                          <video key={content.videoUrl} controls className="w-full h-full object-cover">
                            <source src={content.videoUrl} type="video/mp4" />
                          </video>
                        </div>
                      ) : (
                        <div className="p-20 border-2 border-dashed border-border rounded-[2rem] text-center text-muted-foreground italic text-sm">
                          Esta unidad no incluye video explicativo.
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB: LECTURA */}
                  {activeTab === 'lectura' && (
                    <div className="space-y-10">
                      {content?.imageUrl && (
                        <div className="relative group">
                          <img src={content.imageUrl} className="w-full aspect-21/9 object-cover rounded-[2rem] shadow-lg border border-border/50" alt="Cover" />
                        </div>
                      )}
                      <div className="prose dark:prose-invert max-w-none">
                        <ReactMarkdown
                          components={{
                            h2: ({ ...props }) => <h2 className="text-2xl font-black text-foreground mt-10 mb-6" {...props} />,
                            p: ({ ...props }) => <p className="text-[17px] leading-[1.8] text-muted-foreground mb-6 whitespace-pre-wrap" {...props} />,
                            li: ({ ...props }) => (
                              <li className="flex items-start gap-3 text-[16px] text-muted-foreground mb-4">
                                <span className="mt-2.5 w-2 h-2 rounded-full bg-primary/40 shrink-0" />
                                <span {...props} />
                              </li>
                            ),
                            blockquote: ({ ...props }) => <blockquote className="border-l-4 border-primary bg-muted/40 p-6 rounded-r-2xl my-8 italic shadow-inner" {...props} />
                          }}
                        >
                          {content?.summary}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}

                  {/* TAB: EVALUACIÓN */}
                  {activeTab === 'evaluacion' && (
                    <div className="bg-orange-500/5 border border-orange-500/10 rounded-[2rem] p-12 text-center space-y-6">
                      <div className="w-20 h-20 bg-orange-500 text-white rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-orange-500/20">
                        <i className="bi bi-patch-question text-4xl"></i>
                      </div>
                      <h4 className="text-2xl font-black italic">Pon a prueba tu conocimiento</h4>
                      <p className="text-muted-foreground max-w-xs mx-auto text-sm">Completa el cuestionario para validar lo aprendido en esta unidad.</p>
                      <button 
                        onClick={() => setShowQuizModal(true)} 
                        className="bg-orange-500 text-white px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all"
                      >
                        Iniciar Autoevaluación
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ASIDE DERECHO (RECURSOS) */}
          <aside className="w-80 border-l border-border bg-card p-6 flex flex-col gap-6 overflow-y-auto">
            
            {content?.podcast?.url && (
              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <i className="bi bi-mic-fill"></i>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase text-emerald-600 tracking-widest">Audio Guía</p>
                    <p className="text-[11px] font-bold opacity-70">Resumen Locutado</p>
                  </div>
                </div>
                <audio ref={audioRef} src={content.podcast.url} controls className="w-full h-8 accent-emerald-500" />
              </div>
            )}

            <h4 className={labelClass}>Material Descargable</h4>

            {content?.url?.toLowerCase().includes('.pdf') && (
              <a href={content.url} target="_blank" rel="noopener noreferrer"
                className="group w-full p-4 bg-muted/50 border border-border rounded-2xl flex items-center gap-4 hover:border-primary transition-all">
                <div className="w-10 h-10 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center shrink-0">
                  <i className="bi bi-file-earmark-pdf text-xl"></i>
                </div>
                <div className="text-left overflow-hidden">
                  <p className="text-[8px] font-black uppercase text-muted-foreground">Formato PDF</p>
                  <p className="text-xs font-bold text-foreground truncate">Descargar Material</p>
                </div>
              </a>
            )}
          </aside>
        </div>
      </main>

      {/* MODAL DEL QUIZ (Misma estructura que Admin pero con lógica de respuesta) */}
      {showQuizModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-card border border-border rounded-[32px] p-8 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="flex justify-between items-center mb-8 shrink-0">
              <h3 className="text-2xl font-black italic">Cuestionario</h3>
              <button onClick={() => setShowQuizModal(false)} className="text-muted-foreground hover:text-foreground">
                <i className="bi bi-x-circle text-2xl"></i>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-10 no-scrollbar">
              {questions.map((q: any, qIdx: number) => (
                <div key={qIdx} className="space-y-4">
                  <p className="font-bold text-lg"><span className="text-primary/30 mr-2">Q.0{qIdx + 1}</span> {q.question}</p>
                  <div className="grid gap-2">
                    {q.options.map((opt: string, oIdx: number) => {
                      const isSelected = userAnswers[qIdx] === opt;
                      const isCorrect = opt === q.correctAnswer;
                      
                      let btnClass = "w-full p-4 rounded-xl border text-left text-sm transition-all ";
                      if (isCorrected) {
                        if (isCorrect) btnClass += "border-emerald-500 bg-emerald-500/10 text-emerald-700";
                        else if (isSelected) btnClass += "border-destructive bg-destructive/10 text-destructive-foreground";
                        else btnClass += "border-border opacity-50";
                      } else {
                        btnClass += isSelected ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-border hover:border-primary/40';
                      }

                      return (
                        <button 
                          key={oIdx} 
                          disabled={isCorrected}
                          onClick={() => setUserAnswers({...userAnswers, [qIdx]: opt})}
                          className={btnClass}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {isCorrected && (
                <div className="p-6 bg-primary/10 rounded-2xl text-center">
                  <p className="text-sm font-bold text-primary uppercase tracking-widest">Resultado</p>
                  <p className="text-3xl font-black">{score} / {questions.length}</p>
                </div>
              )}
            </div>

            <div className="pt-6 mt-6 border-t border-border">
              {!isCorrected ? (
                <button 
                  onClick={() => setIsCorrected(true)} 
                  className="w-full bg-primary text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-primary/20"
                >
                  Finalizar y Corregir
                </button>
              ) : (
                <button 
                  onClick={() => { setShowQuizModal(false); setIsCorrected(false); setUserAnswers({}); }}
                  className="w-full bg-muted text-foreground py-4 rounded-xl font-black uppercase text-[10px] tracking-widest"
                >
                  Cerrar Evaluación
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}