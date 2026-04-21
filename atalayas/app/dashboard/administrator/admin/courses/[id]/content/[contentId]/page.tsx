"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/ui/Sidebar";
import { API_ROUTES } from "@/lib/utils";
import mediumZoom from "medium-zoom";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

const appleFont = "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji'";

export default function AdminContentDetail() {
  const params = useParams();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const [formData, setFormData] = useState<any>({
    title: "",
    summary: "",
    imageUrl: "",
    url: "",
    quiz: { questions: [] }
  });

  useEffect(() => {
    const fetchContent = async () => {
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
          }
        });
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [params.contentId, params.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(API_ROUTES.CONTENT.GET_BY_ID(params.id as string, params.contentId as string), {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const updated = await res.json();
        setContent(updated.content || updated);
        setIsEditing(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } finally { setSaving(false); }
  };

  const ResourcesList = () => (
    <div className="flex flex-col gap-4">
      {content?.podcast?.url && (
        <div className="bg-gray-900 p-5 rounded-2xl text-white shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
            <p className="text-[9px] font-bold opacity-50 tracking-widest uppercase">Audio Lección</p>
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
          className="group flex items-center justify-between p-4 bg-orange-50 border border-orange-100 rounded-2xl hover:bg-orange-100 transition-all text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-sm">
              <i className="bi bi-patch-question-fill text-xl"></i>
            </div>
            <div>
              <p className="text-[10px] font-bold text-orange-600 uppercase">Autoevaluación</p>
              <p className="text-sm font-bold text-gray-900">Probar Test</p>
            </div>
          </div>
          <i className="bi bi-chevron-right text-orange-300 group-hover:translate-x-1 transition-transform"></i>
        </button>
      )}

      {content?.url && (
        <a href={content.url} target="_blank" className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-center gap-3 group cursor-pointer">
          <i className="bi bi-file-earmark-pdf text-2xl text-red-500"></i>
          <div>
            <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Documento PDF</p>
            <p className="text-[10px] text-gray-500 tracking-tighter">Descargar</p>
          </div>
        </a>
      )}
    </div>
  );

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#f5f5f7]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;

  const questions = Array.isArray(content?.quiz) ? content.quiz : (content?.quiz?.questions || []);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f5f7]" style={{ fontFamily: appleFont }}>
      <Sidebar role="ADMIN" />
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0 z-20">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/administrator/admin/courses/${params.id}`} className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
              <i className="bi bi-chevron-left text-xl"></i>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{content?.title}</h1>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Gestión de contenido {saveSuccess && "• Guardado"}</p>
            </div>
          </div>
          <button onClick={() => setIsEditing(true)} className="px-6 py-2 bg-black text-white rounded-xl text-xs font-bold shadow-md hover:bg-gray-800 transition-all active:scale-95 cursor-pointer">Editar Unidad</button>
        </header>

        {/* Cambiado a flex-col en móvil y flex-row en desktop para que el aside se vea abajo en móvil */}
        <div className="flex-1 flex flex-col xl:flex-row overflow-hidden">
          <div className="flex-1 overflow-y-auto bg-[#e4e4e7] p-4 md:p-10 custom-scrollbar">
            <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-sm p-6 md:p-20 min-h-full mb-10">
              <article className="markdown-body">
                <ReactMarkdown>{content?.summary || ""}</ReactMarkdown>
              </article>
              {content?.imageUrl && <img src={content.imageUrl} className="w-full mt-12 rounded-lg shadow-sm border border-gray-100" />}
              
              {/* Bloque visible SOLO en móvil (debajo del contenido) */}
              <div className="mt-10 pt-10 border-t xl:hidden">
                <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest mb-6">Material Complementario</h3>
                <ResourcesList />
              </div>
            </div>
          </div>

          {/* Aside lateral fijo SOLO en desktop */}
          <aside className="w-80 border-l border-gray-200 bg-white p-6 hidden xl:flex flex-col gap-6 overflow-y-auto">
            <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest">Material Complementario</h3>
            <ResourcesList />
          </aside>
        </div>
      </main>

      {isEditing && (
        <ContentEditor 
          formData={formData} 
          setFormData={setFormData} 
          onSave={handleSave} 
          onCancel={() => setIsEditing(false)} 
          saving={saving}
        />
      )}

      {showQuizModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer" onClick={() => setShowQuizModal(false)} />
          <div className="relative bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-8 custom-scrollbar">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-gray-900">Cuestionario (Vista Previa)</h2>
              <button onClick={() => setShowQuizModal(false)} className="text-gray-400 hover:text-red-500 cursor-pointer"><i className="bi bi-x-circle-fill text-2xl"></i></button>
            </div>
            
            <div className="space-y-8">
              {questions.map((q: any, i: number) => (
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
                          className={`text-left p-4 rounded-xl border-2 transition-all font-medium text-sm cursor-pointer ${style}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 pt-6 border-t">
              {!quizSubmitted ? (
                <button 
                  onClick={() => setQuizSubmitted(true)}
                  className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-blue-600 transition-all disabled:opacity-50 cursor-pointer"
                  disabled={Object.keys(quizAnswers).length < questions.length}
                >
                  Finalizar Test
                </button>
              ) : (
                <button onClick={() => setShowQuizModal(false)} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold cursor-pointer">Cerrar Previsualización</button>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .markdown-body { font-family: ${appleFont} !important; font-size: 1.1rem; line-height: 1.75; color: #374151; }
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

function ContentEditor({ formData, setFormData, onSave, onCancel, saving }: any) {
  const [activeTab, setActiveTab] = useState<"resumen" | "media" | "quiz">("resumen");
  const questions = Array.isArray(formData.quiz?.questions) ? formData.quiz.questions : [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="bg-white w-full max-w-6xl h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-200">
        
        <div className="px-10 py-6 border-b flex justify-between items-center bg-gray-50/50">
          <h2 className="text-2xl font-black text-gray-900">Editor de la unidad</h2>
          <div className="flex gap-3">
            <button onClick={onCancel} className="px-6 py-2.5 font-bold text-gray-400 cursor-pointer">Descartar</button>
            <button onClick={onSave} className="px-8 py-2.5 bg-blue-600 text-white rounded-2xl font-bold cursor-pointer">{saving ? "Guardando..." : "Guardar cambios"}</button>
          </div>
        </div>

        <nav className="flex px-10 gap-8 border-b bg-white">
          {["resumen", "media", "quiz"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} className={`py-4 text-[11px] font-black uppercase tracking-widest border-b-2 transition-all cursor-pointer ${activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400"}`}>
              {tab === "quiz" ? `test (${questions.length})` : tab}
            </button>
          ))}
        </nav>

        <div className="flex-1 overflow-y-auto p-10 bg-white custom-scrollbar">
          {activeTab === "resumen" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 h-full">
              <textarea 
                className="w-full p-8 bg-[#f5f5f7] rounded-[2rem] outline-none font-medium text-gray-700 leading-relaxed resize-none border-2 border-transparent focus:border-blue-500 transition-all" 
                value={formData.summary} 
                onChange={(e) => setFormData({...formData, summary: e.target.value})} 
              />
              <div className="border-l pl-10 overflow-y-auto hidden lg:block">
                <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-4">Vista Previa</p>
                <article className="markdown-body">
                  <ReactMarkdown>{formData.summary}</ReactMarkdown>
                </article>
              </div>
            </div>
          )}

          {activeTab === "media" && (
            <div className="max-w-xl mx-auto space-y-8 py-10">
              <div className="space-y-6 bg-gray-50 p-8 rounded-[2.5rem]">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">URL Imagen Ilustrativa</label>
                  <input className="w-full p-4 bg-white rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none shadow-sm" value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">URL Documento PDF</label>
                  <input className="w-full p-4 bg-white rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none shadow-sm" value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value})} />
                </div>
              </div>
            </div>
          )}

          {activeTab === "quiz" && (
            <div className="max-w-3xl mx-auto space-y-8 pb-20">
              {questions.map((q: any, i: number) => (
                <div key={i} className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[10px] font-black text-blue-600 uppercase">Pregunta {i+1}</span>
                    <button onClick={() => { const n = [...questions]; n.splice(i, 1); setFormData({...formData, quiz: {questions: n}}); }} className="text-red-400 font-bold text-xs cursor-pointer">Eliminar</button>
                  </div>
                  <input className="w-full font-bold text-lg bg-transparent border-b-2 border-gray-200 focus:border-blue-500 mb-6 outline-none pb-2" value={q.question} onChange={(e) => { const n = [...questions]; n[i].question = e.target.value; setFormData({...formData, quiz: {questions: n}}); }} />
                  <div className="grid gap-3">
                    {q.options.map((opt: string, idx: number) => (
                      <div key={idx} className="flex gap-3">
                        <button onClick={() => { const n = [...questions]; n[i].correctAnswer = opt; setFormData({...formData, quiz: {questions: n}}); }} className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center border-2 transition-all cursor-pointer ${q.correctAnswer === opt && opt !== "" ? "bg-green-500 border-green-500 text-white" : "bg-white border-gray-100 text-gray-300"}`}>
                          {q.correctAnswer === opt && opt !== "" ? <i className="bi bi-check-lg"></i> : idx+1}
                        </button>
                        <input className="flex-1 p-3 bg-white rounded-xl text-sm font-bold border-2 border-transparent focus:border-blue-500 outline-none shadow-sm" value={opt} onChange={(e) => { const n = [...questions]; n[i].options[idx] = e.target.value; setFormData({...formData, quiz: {questions: n}}); }} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button onClick={() => setFormData({...formData, quiz: {questions: [...questions, { question: "", options: ["", "", "", ""], correctAnswer: "" }]}})} className="w-full py-6 border-2 border-dashed border-gray-200 rounded-[2rem] text-gray-400 font-bold hover:bg-blue-50 transition-all cursor-pointer">+ Añadir Pregunta</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}