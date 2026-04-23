'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import PageHeader from '@/components/ui/pageHeader';
import { API_ROUTES } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

const inputClass = "w-full px-5 py-3 bg-background border border-input focus:border-primary focus:ring-4 focus:ring-primary/5 rounded-xl outline-none transition-all text-foreground text-sm font-medium placeholder:text-muted-foreground/50 shadow-sm";
const labelClass = "text-[10px] font-black uppercase text-primary tracking-[0.2em] mb-2 block";

export default function AdminContentDetail() {
  const params = useParams();
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);

  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const [formData, setFormData] = useState<any>({
    title: "",
    summary: "",
    imageUrl: "",
    url: "",
    quiz: { questions: [] },
  });

  useEffect(() => {
    const fetchContent = async () => {
      if (!params.id || !params.contentId) return;
      try {
        const res = await fetch(API_ROUTES.CONTENT.GET_BY_ID(params.id as string, params.contentId as string), {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        const finalData = data.content || data.data || data;
        
        setContent(finalData);
        setFormData({
          title: finalData.title || "",
          summary: finalData.summary || "",
          imageUrl: finalData.imageUrl || "",
          url: finalData.url || "",
          quiz: {
            questions: Array.isArray(finalData.quiz) ? finalData.quiz : (finalData.quiz?.questions || [])
          },
            podcast: finalData.podcast || null,
        });
      } catch (error) { 
        console.error("Error fetching content:", error); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchContent();
  }, [params.contentId, params.id]);

  const addQuestion = () => {
    const newQuestions = [...formData.quiz.questions, { question: "", options: ["", "", ""], correctAnswer: "" }];
    setFormData({ ...formData, quiz: { questions: newQuestions } });
  };

  const removeQuestion = (index: number) => {
    const newQuestions = formData.quiz.questions.filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, quiz: { questions: newQuestions } });
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const newQuestions = [...formData.quiz.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setFormData({ ...formData, quiz: { questions: newQuestions } });
  };

  const handleQuizSubmit = () => {
    const questions = content?.quiz?.questions || (Array.isArray(content?.quiz) ? content.quiz : []);
    let correctCount = 0;
    questions.forEach((q: any, index: number) => {
      if (quizAnswers[index] === q.correctAnswer) correctCount++;
    });
    setQuizScore(correctCount);
    setQuizSubmitted(true);
  };

  const currentQuestions = content?.quiz?.questions || (Array.isArray(content?.quiz) ? content.quiz : []);

  return (
    <div className="flex h-screen bg-[#fcfcfd] font-sans text-foreground overflow-hidden">
      <Sidebar role="ADMIN" />

      <main className="flex-1 flex flex-col min-w-0 relative">
        {loading ? (
          /* SPINNER SOLO EN EL CONTENIDO */
          <div className="flex-1 flex items-center justify-center bg-[#fcfcfd]">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <PageHeader 
              title={isEditing ? "Modo Editor" : content?.title}
              description="Gestión y visualización de unidad didáctica"
              icon={<i className="bi bi-file-earmark-text"></i>}
              backUrl={`/dashboard/administrator/admin/courses/${params.id}`}
              action={
                <button 
                  onClick={() => setIsEditing(!isEditing)} 
                  className={`${isEditing ? 'bg-emerald-500 shadow-emerald-200' : 'bg-primary'} text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 shadow-lg active:scale-95`}
                >
                  {isEditing ? (<span><i className="bi bi-check-lg mr-2"></i>Guardar Cambios</span>) : (<span><i className="bi bi-pencil-square mr-2"></i>Editar Contenido</span>)}
                </button>
              }
            />

            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 overflow-y-auto bg-slate-200/50 p-4 md:p-8 lg:p-12 no-scrollbar">
                <div className="max-w-4xl mx-auto bg-white shadow-2xl shadow-slate-300/50 rounded-sm min-h-screen mb-20 p-10 md:p-16 lg:p-24 transition-all">
                  
                  {isEditing ? (
                    <div className="space-y-12 text-left animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="space-y-2">
                        <label className={labelClass}>Título de la Unidad</label>
                        <input 
                          value={formData.title} 
                          onChange={e => setFormData({...formData, title: e.target.value})} 
                          className={`${inputClass} text-2xl font-bold py-6 border-slate-100`} 
                        />
                      </div>

                      <div className="space-y-2">
                        <label className={labelClass}>Cuerpo del Resumen (Markdown)</label>
                        <textarea 
                          rows={15} 
                          value={formData.summary} 
                          onChange={e => setFormData({...formData, summary: e.target.value})} 
                          className={`${inputClass} font-mono text-xs leading-loose p-8 bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-primary/20`} 
                        />
                      </div>

                      <div className="pt-10 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <label className={labelClass}>Configuración del Test</label>
                                <p className="text-xs text-slate-400">Gestiona las preguntas evaluativas de esta unidad</p>
                            </div>
                            <button 
                                onClick={addQuestion}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary transition-all"
                            >
                                <i className="bi bi-plus-lg"></i> Añadir Pregunta
                            </button>
                        </div>

                        <div className="space-y-6">
                          {formData.quiz.questions.map((q: any, idx: number) => (
                            <div key={idx} className="p-6 bg-slate-50 rounded-[32px] border border-slate-200/60 relative group">
                              <button 
                                onClick={() => removeQuestion(idx)}
                                className="absolute top-4 right-4 w-8 h-8 bg-white text-red-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:text-red-600 shadow-sm"
                              >
                                <i className="bi bi-trash text-sm"></i>
                              </button>

                              <div className="space-y-4">
                                <div>
                                    <span className="text-[9px] font-black text-slate-400 mb-2 block tracking-tighter">PREGUNTA #0{idx+1}</span>
                                    <input 
                                        placeholder="Escribe la pregunta..."
                                        className={inputClass}
                                        value={q.question}
                                        onChange={(e) => updateQuestion(idx, 'question', e.target.value)}
                                    />
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {q.options.map((opt: string, optIdx: number) => (
                                        <div key={optIdx}>
                                            <input 
                                                placeholder={`Opción ${optIdx + 1}`}
                                                className={`${inputClass} bg-white! py-2! text-xs`}
                                                value={opt}
                                                onChange={(e) => {
                                                    const newOpts = [...q.options];
                                                    newOpts[optIdx] = e.target.value;
                                                    updateQuestion(idx, 'options', newOpts);
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-100">
                                    <span className="text-[9px] font-black uppercase text-slate-400 ml-2">Correcta:</span>
                                    <select 
                                        className="flex-1 bg-transparent text-xs font-bold outline-none cursor-pointer text-primary"
                                        value={q.correctAnswer}
                                        onChange={(e) => updateQuestion(idx, 'correctAnswer', e.target.value)}
                                    >
                                        <option value="">Selecciona la respuesta correcta</option>
                                        {q.options.map((o: string, i: number) => (
                                            <option key={i} value={o}>{o || `Opción ${i+1}`}</option>
                                        ))}
                                    </select>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="animate-in fade-in duration-700 text-left">
                      <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-10 text-slate-900 leading-tight">
                        {content.title}
                      </h1>
                      
                      {content.imageUrl && (
                        <div className="mb-12 rounded-[40px] overflow-hidden shadow-2xl shadow-slate-200 border border-slate-100">
                          <img src={content.imageUrl} className="w-full h-auto object-cover" alt="Cover" />
                        </div>
                      )}

                      <ReactMarkdown
                        components={{
                          h2: ({ ...props }) => (
                            <h2 className="text-2xl font-black text-slate-900 mt-16 mb-6 tracking-tight border-b border-slate-100 pb-3" {...props} />
                          ),
                          p: ({ ...props }) => (
                            <p className="text-[17px] leading-[1.8] text-slate-600 mb-8" {...props} />
                          ),
                          ul: ({ ...props }) => (
                            <ul className="space-y-4 mb-10 mt-2 list-none" {...props} />
                          ),
                          li: ({ ...props }) => (
                            <li className="flex items-start gap-3 text-[16.5px] text-slate-600">
                              <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                              <span {...props} />
                            </li>
                          ),
                          strong: ({ ...props }) => (
                            <strong className="font-bold text-slate-900" {...props} />
                          )
                        }}
                      >
                        {content.summary}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>

              <aside className="w-80 border-l border-slate-100 bg-white p-8 flex flex-col gap-8 overflow-y-auto no-scrollbar">
                <div className="flex flex-col gap-1">
                  <h4 className={labelClass}>Recursos de aprendizaje</h4>
                </div>

                {currentQuestions.length > 0 && (
                  <button 
                    onClick={() => setShowQuizModal(true)}
                    className="group w-full p-6 bg-slate-900 rounded-[32px] text-white flex flex-col gap-4 hover:bg-primary transition-all duration-500 shadow-xl shadow-indigo-100 hover:-translate-y-1"
                  >
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-inner">
                      <i className="bi bi-patch-question text-2xl"></i>
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Cuestionario</p>
                      <p className="text-base font-bold tracking-tight">Realizar Evaluación</p>
                    </div>
                  </button>
                )}

                {content.url?.includes('.mp3') && (
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-[32px] p-6 space-y-5 transition-all hover:bg-emerald-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                          <i className="bi bi-headphones"></i>
                        </div>
                        <div>
                            <span className="text-[9px] font-black uppercase text-emerald-700 block tracking-tight">Audio Guía</span>
                            <span className="text-[8px] font-medium text-emerald-600/60 uppercase">Disponible offline</span>
                        </div>
                      </div>
                    </div>
                    <audio 
                      ref={audioRef} 
                      controls 
                      className="w-full h-10 accent-emerald-600" 
                      src={content.url} 
                    />
                  </div>
                )}

                {content.url && !content.url.includes('.mp3') && (
                  <div className="space-y-4">
                    <p className={labelClass}>Material Descargable</p>
                    <a 
                      href={content.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-5 p-5 bg-white rounded-[28px] hover:bg-slate-50 transition-all border border-slate-100 group shadow-sm hover:shadow-md"
                    >
                      <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                        <i className="bi bi-file-earmark-pdf text-2xl"></i>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black uppercase tracking-tight text-slate-700">Documento PDF</span>
                        <span className="text-[10px] font-bold text-slate-400">Ver material original</span>
                      </div>
                    </a>
                  </div>
                )}
                
                <div className="mt-auto pt-8 border-t border-slate-50">
                    <button 
                      onClick={() => setShowDeleteModal(true)} 
                      className="flex items-center justify-center gap-3 w-full py-4 text-[9px] font-black uppercase text-red-400 hover:text-red-600 transition-all tracking-[0.2em] hover:bg-red-50 rounded-[20px] border border-transparent hover:border-red-100"
                    >
                      <i className="bi bi-trash3 text-xs"></i> Eliminar Unidad
                    </button>
                </div>
              </aside>
            </div>
          </>
        )}
      </main>

      {/* MODALES SE MANTIENEN FUERA DEL MAIN */}
      {showQuizModal && (
        <div className="fixed inset-0 z-100 flex justify-end animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setShowQuizModal(false)} />
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-black tracking-tight text-slate-900">Test de Evaluación</h3>
                <p className="text-[10px] font-black uppercase text-primary tracking-widest mt-1">0{currentQuestions.length} Preguntas</p>
              </div>
              <button onClick={() => setShowQuizModal(false)} className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center hover:rotate-90 transition-all hover:bg-slate-200">
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar pb-32">
              {currentQuestions.map((q: any, idx: number) => (
                <div key={idx} className="space-y-5">
                  <p className="font-bold text-base leading-tight text-slate-900"><span className="text-primary mr-2">Q0{idx+1}.</span> {q.question}</p>
                  <div className="grid gap-3">
                    {q.options.map((opt: string, i: number) => (
                      <button 
                        key={i} 
                        onClick={() => !quizSubmitted && setQuizAnswers({...quizAnswers, [idx]: opt})}
                        className={`text-left px-6 py-5 rounded-[24px] border-2 text-[11px] font-black transition-all ${quizAnswers[idx] === opt ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-indigo-100' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-8 border-t border-slate-100 bg-white/90 backdrop-blur-md">
              {!quizSubmitted ? (
                <button onClick={handleQuizSubmit} className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-primary transition-all hover:scale-[1.02] active:scale-95">Finalizar y Evaluar</button>
              ) : (
                <div className="text-center space-y-4">
                  <div className="text-5xl font-black text-primary animate-bounce">{quizScore} / {currentQuestions.length}</div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Resultado de la prueba</p>
                  <button onClick={() => {setQuizSubmitted(false); setQuizAnswers({});}} className="text-[10px] font-black uppercase underline text-slate-400 hover:text-slate-900 transition-colors">Intentar de nuevo</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-110 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[48px] p-12 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-300 border border-white/20">
             <div className="w-24 h-24 bg-red-50 text-red-500 rounded-[32px] flex items-center justify-center mx-auto mb-8 text-4xl shadow-inner">
               <i className="bi bi-exclamation-octagon"></i>
             </div>
             <h2 className="text-2xl font-black mb-3 text-slate-900 tracking-tight">¿Eliminar unidad?</h2>
             <p className="text-sm text-slate-400 mb-10 leading-relaxed font-medium">Esta acción no se puede deshacer. Se perderán todos los datos y archivos.</p>
             <div className="flex flex-col gap-3">
               <button className="w-full py-5 bg-red-500 text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-100 hover:scale-[1.02] active:scale-95">Confirmar Eliminación</button>
               <button onClick={() => setShowDeleteModal(false)} className="w-full py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-900 transition-colors">Volver atrás</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}