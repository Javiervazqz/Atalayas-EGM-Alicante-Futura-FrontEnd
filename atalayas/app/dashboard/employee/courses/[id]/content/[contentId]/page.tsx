'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import { API_ROUTES } from '@/lib/utils';
import Link from 'next/link';

export default function ContentDetailPage() {
  const { id: courseId, contentId } = useParams();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reading' | 'quiz' | 'podcast'>('reading');

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(API_ROUTES.CONTENT.GET_BY_ID(contentId as string), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setContent(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (contentId) fetchContent();
  }, [contentId]);

  if (loading) return <div className="p-10 animate-pulse text-[#005596] font-bold">Preparando tu formación...</div>;

  return (
    <div className="flex min-h-screen bg-[#f5f5f7]">
      <Sidebar role="EMPLOYEE" />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* HEADER DINÁMICO */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/employee/courses/${courseId}`} className="text-gray-400 hover:text-[#005596] transition-colors">
              <i className="bi bi-arrow-left-circle-fill text-2xl"></i>
            </Link>
            <div>
              <span className="text-[10px] font-black text-[#005596] bg-blue-50 px-2 py-0.5 rounded uppercase tracking-tighter">
                Lección {content?.order}
              </span>
              <h1 className="text-lg font-bold text-[#1d1d1f] leading-tight">{content?.title}</h1>
            </div>
          </div>

          <nav className="flex bg-gray-100 p-1 rounded-2xl">
            <button 
              onClick={() => setActiveTab('reading')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'reading' ? 'bg-white text-[#005596] shadow-sm' : 'text-gray-500'}`}
            >
              Lectura
            </button>
            {content?.quiz && (
              <button 
                onClick={() => setActiveTab('quiz')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'quiz' ? 'bg-white text-[#005596] shadow-sm' : 'text-gray-500'}`}
              >
                IA Quiz
              </button>
            )}
            {content?.podcast && (
              <button 
                onClick={() => setActiveTab('podcast')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'podcast' ? 'bg-white text-[#005596] shadow-sm' : 'text-gray-500'}`}
              >
                Audio IA
              </button>
            )}
          </nav>
        </header>

        {/* CONTENIDO PRINCIPAL */}
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="max-w-4xl mx-auto py-12 px-6">
            
            {/* VISTA DE LECTURA (Summary + Portada) */}
            {activeTab === 'reading' && (
              <div className="animate-in fade-in duration-500">
                {content?.url && (
                  <img 
                    src={content.url} 
                    alt="Portada" 
                    className="w-full h-64 object-cover rounded-[32px] mb-10 shadow-lg border border-gray-100"
                  />
                )}
                <div className="prose prose-blue max-w-none">
                  <h2 className="text-3xl font-black text-[#1d1d1f] mb-6">Resumen Ejecutivo</h2>
                  <div className="text-gray-600 text-lg leading-relaxed whitespace-pre-line">
                    {content?.summary || "No hay resumen disponible para esta lección."}
                  </div>
                </div>
              </div>
            )}

            {/* VISTA DE QUIZ IA */}
            {activeTab === 'quiz' && (
              <div className="animate-in slide-in-from-bottom-4 duration-500 bg-[#f8fafc] p-8 rounded-[32px] border border-blue-100">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-[#d9ff00] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <i className="bi bi-lightning-charge-fill text-[#005596] text-2xl"></i>
                  </div>
                  <h2 className="text-2xl font-black text-[#1d1d1f]">Pon a prueba tu conocimiento</h2>
                  <p className="text-gray-500 text-sm">Cuestionario generado por IA basado en el material del curso.</p>
                </div>
                {/* Aquí renderizarías el JSON del quiz */}
                <div className="space-y-4">
                  {content.quiz.questions?.map((q: any, i: number) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100">
                      <p className="font-bold text-[#005596] mb-3">{q.question}</p>
                      {/* Lógica de opciones... */}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VISTA DE PODCAST IA */}
            {activeTab === 'podcast' && (
              <div className="animate-in zoom-in-95 duration-500 bg-[#005596] p-12 rounded-[40px] text-center text-white relative overflow-hidden">
                <div className="relative z-10">
                  <i className="bi bi-mic-fill text-5xl text-[#d9ff00] mb-6 block"></i>
                  <h2 className="text-2xl font-black mb-2">Podcast de la Lección</h2>
                  <p className="text-blue-200 mb-8 max-w-md mx-auto">Escucha el resumen de voz generado por nuestra IA mientras realizas otras tareas.</p>
                  
                  <audio controls className="w-full max-w-md mx-auto h-12 rounded-full">
                    <source src={content.podcast.audioUrl} type="audio/mpeg" />
                    Tu navegador no soporta el audio.
                  </audio>
                </div>
                {/* Decoración fondo */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
              </div>
            )}

          </div>
        </div>

        {/* FOOTER DE PROGRESO */}
        <footer className="bg-white border-t border-gray-100 px-8 py-4 shrink-0 flex justify-between items-center">
          <p className="text-xs text-gray-400 font-medium">Atalayas EGM · Formación Continua</p>
          <button className="bg-[#005596] text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#d9ff00] hover:text-[#005596] transition-all shadow-lg">
            Finalizar Lección
          </button>
        </footer>
      </main>
    </div>
  );
}