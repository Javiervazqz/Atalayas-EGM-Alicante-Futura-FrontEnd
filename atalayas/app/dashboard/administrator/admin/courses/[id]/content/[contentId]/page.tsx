"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/ui/Sidebar";
import { API_ROUTES } from "@/lib/utils";
import mediumZoom from "medium-zoom";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

const appleFont =
  "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif";

const inputClass =
  "w-full px-5 py-3.5 bg-[#f5f5f7] border-2 border-transparent focus:border-[#0071e3] focus:bg-white rounded-2xl outline-none transition-all text-[#424245] text-sm placeholder:text-[#c7c7cc]";

export default function AdminContentDetail() {
  const params = useParams();
  const router = useRouter();
  const zoomRef = useRef<HTMLImageElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Estados de datos y carga
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Estados del Quiz (Estructura Employee)
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Estado del Formulario
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
        const res = await fetch(API_ROUTES.CONTENT.GET_BY_ID(courseId, contentId), {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
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
      const zoom = mediumZoom(zoomRef.current, {
        background: "rgba(0,0,0,0.8)",
        margin: 24,
      });
      return () => {
        zoom.detach(); 
      };
    }
  }, [content?.imageUrl, isEditing]);

  const handleSave = async () => {
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
      if (res.ok) router.push(`/dashboard/administrator/admin/courses/${params.id}`);
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
  };

  if (loading) return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f5f5f7]" style={{ fontFamily: appleFont }}>
      <Sidebar role="ADMIN" />

      <main className="flex-1 h-screen overflow-y-auto w-full">
        {/* HEADER */}
        <div className="bg-white border-b border-black/5 py-6 md:py-8">
          <div className="max-w-5xl mx-auto px-6">
            <Link
              href={`/dashboard/administrator/admin/courses/${params.id}`}
              className="group text-[#0071e3] text-sm font-semibold hover:underline mb-4 inline-flex items-center gap-2"
            >
              <i className="bi bi-arrow-left-circle-fill transition-transform group-hover:-translate-x-1"></i>
              <span>Volver</span>
            </Link>

            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl shrink-0">
                <i className="bi bi-person-workspace text-blue-400"></i>
              </div>

              <div className="flex-1">
                <h1 className="text-xl md:text-3xl font-extrabold text-[#1d1d1f] leading-tight text-balance">
                  {formData.title}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-block mt-2 text-[12px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                    Administrador
                  </span>
                  {saveSuccess && <span className="text-green-600 text-[10px] font-bold animate-pulse">✓ Cambios guardados</span>}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0">
                {!isEditing ? (
                  <>
                    <button onClick={() => setShowDeleteModal(true)} className="px-4 py-2 rounded-xl text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-colors">Eliminar</button>
                    <button onClick={() => setIsEditing(true)} className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0071e3] text-white hover:bg-[#0077ed] transition-shadow shadow-md">Editar Unidad</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { hydrateForm(content); setIsEditing(false); }} className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-100">Cancelar</button>
                    <button onClick={handleSave} disabled={saving} className="px-5 py-2 rounded-xl text-xs font-bold bg-black text-white active:scale-95 transition-all">{saving ? "Guardando..." : "Guardar Cambios"}</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="content-layout">
            
            {/* ASIDE DERECHO (Solo visible cuando no se edita) */}
            {!isEditing && (
              <aside className="action-box space-y-4 md:order-2">
                {content.podcast?.url && (
                  <div className="bg-[#1d1d1f] p-5 rounded-[2rem] text-white shadow-xl">
                    <p className="text-[9px] font-black uppercase opacity-50 mb-3 tracking-widest flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                      Audio Lección
                    </p>
                    <audio ref={audioRef} controls className="w-full h-8 invert opacity-80" src={content.podcast.url} />
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
                        <p className="text-[10px] font-black uppercase text-gray-400">Previsualizar</p>
                        <p className="text-sm font-bold text-gray-800">Probar Test</p>
                      </div>
                    </div>
                    <i className="bi bi-play-circle-fill text-gray-300 group-hover:text-orange-500 transition-colors"></i>
                  </button>
                )}

                {content.url && !content.url.includes(".mp3") && (
                  <div className="bg-white p-5 rounded-[2rem] border border-black/5 text-center shadow-sm">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-3 tracking-widest">Recursos PDF</p>
                    <a
                      href={content.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 bg-[#f5f5f7] text-black rounded-2xl text-[11px] font-bold hover:bg-gray-200 transition-all border border-gray-100"
                    >
                      <i className="bi bi-file-earmark-pdf-fill text-red-500"></i> Abrir Material
                    </a>
                  </div>
                )}
              </aside>
            )}

            {/* CUERPO PRINCIPAL */}
            <div className="md:order-1">
              {isEditing ? (
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">Campos de la unidad</p>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 ml-2 uppercase">Título</label>
                    <input
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 ml-2 uppercase">URL de Imagen</label>
                    <input
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                      className={inputClass}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 ml-2 uppercase">Contenido (Markdown)</label>
                    <textarea
                      rows={18}
                      value={formData.summary}
                      onChange={(e) => setFormData({...formData, summary: e.target.value})}
                      className={`${inputClass} resize-none font-mono text-xs leading-relaxed`}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="markdown-container text-base md:text-lg leading-relaxed text-[#424245] font-medium">
                    <ReactMarkdown>{content.summary || "Sin resumen disponible."}</ReactMarkdown>
                  </div>

                  {content.imageUrl && (
                    <div className="group relative overflow-hidden rounded-[2.5rem] border border-gray-100 shadow-lg">
                      <img ref={zoomRef} src={content.imageUrl} alt="Imagen del contenido" className="w-full h-auto cursor-zoom-in transition-transform duration-500 group-hover:scale-[1.02]" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* MODAL TEST (ESTILO EMPLOYEE) */}
      {showQuizModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => !quizSubmitted && setShowQuizModal(false)} />
          <div className="relative bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl p-8 md:p-10">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Previsualización</h2>
                <p className="text-sm text-gray-500">Comprueba que las preguntas sean correctas</p>
              </div>
              <button onClick={() => setShowQuizModal(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors">
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="space-y-8">
              {getQuizQuestions(content.quiz).map((pregunta: any, index: number) => (
                <div key={index} className="space-y-4">
                  <p className="text-base font-bold text-gray-800 leading-snug">
                    <span className="text-blue-500 mr-2">{index + 1}.</span> {pregunta.question}
                  </p>
                  <div className="grid gap-3">
                    {pregunta.options.map((opcion: string, i: number) => (
                      <button
                        key={i}
                        onClick={() => !quizSubmitted && setQuizAnswers(prev => ({ ...prev, [index]: opcion }))}
                        className={`text-left p-4 rounded-2xl border-2 transition-all text-sm font-semibold ${
                          quizAnswers[index] === opcion ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm" : "border-gray-50 bg-[#f5f5f7] text-gray-600 hover:border-gray-200"
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
                    <p className="text-[10px] font-black uppercase opacity-70">Nota simulada</p>
                    <p className="text-2xl font-black">{quizScore} / {getQuizQuestions(content.quiz).length} correctas</p>
                  </div>
                  <button onClick={() => { setQuizSubmitted(false); setQuizAnswers({}); }} className="px-5 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl font-bold text-xs transition-colors">Reiniciar prueba</button>
                </div>
              ) : (
                <button 
                   onClick={handleQuizSubmit} 
                   disabled={Object.keys(quizAnswers).length === 0}
                   className="w-full py-5 bg-[#1d1d1f] text-white rounded-2xl font-bold shadow-xl hover:bg-blue-600 transition-all disabled:opacity-30"
                >
                  Corregir como Administrador
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-110 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
              <i className="bi bi-exclamation-triangle-fill"></i>
            </div>
            <h2 className="text-xl font-black text-center mb-2">¿Confirmar eliminación?</h2>
            <p className="text-gray-500 text-sm text-center mb-8 px-4">Esta acción no se puede deshacer y el contenido desaparecerá del curso.</p>
            <div className="space-y-3">
              <button onClick={handleDelete} className="w-full py-4 rounded-2xl font-bold bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-200">
                {deleting ? "Eliminando..." : "Eliminar permanentemente"}
              </button>
              <button onClick={() => setShowDeleteModal(false)} className="w-full py-4 font-bold text-gray-400 hover:text-gray-600">Cancelar</button>
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

        .markdown-container :global(strong) {
          color: #1d1d1f;
          font-weight: 800;
          display: block;
          margin-top: 1.8rem;
          margin-bottom: 0.6rem;
          font-size: 1.4rem;
          letter-spacing: -0.02em;
        }

        .markdown-container :global(p strong) {
          display: inline;
          font-size: inherit;
          margin: 0;
          color: #000;
        }

        .markdown-container :global(ul) {
          margin: 1.5rem 0;
          padding-left: 0;
          list-style: none;
        }

        .markdown-container :global(li) {
          position: relative;
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }

        .markdown-container :global(li::before) {
          content: "•";
          position: absolute;
          left: 0;
          color: #0071e3;
          font-weight: bold;
          font-size: 1.4rem;
          line-height: 1;
        }

        .markdown-container :global(p) {
          margin-bottom: 1.4rem;
          white-space: pre-wrap;
        }

        @media (max-width: 1024px) {
          .content-layout { grid-template-columns: 1fr; gap: 24px; }
          .action-box { order: -1; }
        }
      `}</style>
    </div>
  );
}