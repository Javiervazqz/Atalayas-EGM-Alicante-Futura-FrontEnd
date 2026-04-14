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
  };

  const set = (key: string, value: any) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

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
      <Sidebar role="ADMIN" />

      <main className="flex-1 h-screen overflow-y-auto w-full">
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
                <i className="bi bi-book-fill text-blue-400"></i>
              </div>

              <div className="flex-1">
                <h1 className="text-xl md:text-3xl font-extrabold text-[#1d1d1f] leading-tight">
                  {formData.title || content?.title}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-block mt-2 text-[12px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                    Unidad de aprendizaje
                  </span>{" "}
                  {saveSuccess && (
                    <span className="text-green-600 text-[10px] font-bold animate-pulse">
                      ✓ Guardado
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-0 border-gray-100">
                {!isEditing ? (
                  <>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold text-red-500 bg-red-50"
                    >
                      Eliminar
                    </button>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex-1 md:flex-none px-5 py-2 rounded-xl text-xs font-bold bg-[#0071e3] text-white"
                    >
                      Editar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        hydrateForm(content);
                        setIsEditing(false);
                      }}
                      className="flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold bg-gray-100"
                    >
                      Descartar
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 md:flex-none px-5 py-2 rounded-xl text-xs font-bold bg-black text-white"
                    >
                      {saving ? "..." : "Guardar"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="content-layout">
            {!isEditing && (
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

                {/* TEST UBICADO EN EL ASIDE */}
                {content.quiz && (
                  <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                    <h3 className="text-sm font-black mb-5 flex items-center gap-2">
                      <i className="bi bi-patch-question text-orange-500"></i>{" "}
                      Test de Unidad
                    </h3>
                    <div className="space-y-6">
                      {getQuizQuestions(content.quiz).map(
                        (pregunta: any, index: number) => (
                          <div key={index} className="space-y-2">
                            <p className="text-xs font-bold text-gray-800 leading-tight">
                              {index + 1}. {pregunta.question}
                            </p>
                            <div className="grid gap-1.5">
                              {pregunta.options.map(
                                (opcion: string, i: number) => (
                                  <button
                                    key={i}
                                    onClick={() =>
                                      !quizSubmitted &&
                                      setQuizAnswers((prev) => ({
                                        ...prev,
                                        [index]: opcion,
                                      }))
                                    }
                                    className={`text-left p-3 rounded-xl border-2 transition-all text-[11px] font-medium cursor-pointer ${
                                      quizAnswers[index] === opcion
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-gray-50 bg-[#f5f5f7]"
                                    }`}
                                  >
                                    {opcion}
                                  </button>
                                ),
                              )}
                            </div>
                          </div>
                        ),
                      )}

                      {/* RESULTADO O BOTÓN DE ACCIÓN */}
                      {quizSubmitted ? (
                        <div className="pt-4 border-t border-gray-100">
                          <div className="bg-blue-600 text-white p-4 rounded-2xl text-center">
                            <p className="text-[10px] font-bold uppercase opacity-80">
                              Tu resultado
                            </p>
                            <p className="text-2xl font-black">
                              {quizScore} /{" "}
                              {getQuizQuestions(content.quiz).length}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setQuizSubmitted(false);
                              setQuizAnswers({});
                            }}
                            className="w-full mt-3 text-[11px] font-bold text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            Reintentar
                          </button>
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
                  </div>
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
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="bg-white rounded-t-[2.5rem] md:rounded-[2.5rem] p-8 max-w-sm w-full animate-in slide-in-from-bottom-10"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-black text-center mb-6">
              ¿Eliminar unidad?
            </h2>
            <div className="space-y-3">
              <button
                onClick={handleDelete}
                className="w-full py-4 rounded-2xl font-bold bg-red-500 text-white"
              >
                {deleting ? "..." : "Confirmar"}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="w-full py-4 font-bold text-gray-400"
              >
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
