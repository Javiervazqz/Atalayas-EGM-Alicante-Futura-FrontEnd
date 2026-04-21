'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import { API_ROUTES } from '@/lib/utils';
import mediumZoom from 'medium-zoom';
import Link from 'next/link';

export default function EmployeeContentDetail() {
  const params = useParams();
  const router = useRouter();
  const zoomRef = useRef<HTMLImageElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // --- ESTADO PARA EL MODAL DE QUIZ ---
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
        const res = await fetch(API_ROUTES.CONTENT.GET_BY_ID(courseId, contentId), {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
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
        </div>
      </main>
    </div>
  );
}