"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/ui/Sidebar";
import { API_ROUTES } from "@/lib/utils";
import mediumZoom from "medium-zoom";
import Link from "next/link";

const appleFont =
  "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif";
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
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
        const res = await fetch(API_ROUTES.CONTENT.GET_BY_ID(courseId as string, contentId as string), {
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
  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary" />
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
              className="flex items-center gap-1 text-secondary text-sm font-semibold hover:opacity-80 transition-opacity mb-6 inline-flex">
              <i className="bi bi-chevron-left"></i> Volver al curso
            </Link>

            <div className="flex items-center gap-6 flex-wrap">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                <i className="bi bi-journal-text"></i>
              </div>
              <div className="flex-1 min-w-[250px]">
                <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight mb-2">
                  {content.title}
                </h1>
                <span className="inline-flex items-center text-[10px] font-bold px-3 py-1 rounded-full bg-secondary/10 text-secondary uppercase tracking-wider">
                  Lección {content.order || 1}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CUERPO DINÁMICO (Con Grid de Tailwind en vez de style jsx) */}
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-10 lg:py-12">
          <div className={`grid grid-cols-1 ${hasResources ? 'lg:grid-cols-[1fr_300px]' : ''} gap-10 lg:gap-16`}>
            
            {/* COLUMNA IZQUIERDA: CONTENIDO */}
            <article>
              <h3 className="text-xl font-bold text-foreground mb-6">
                Desarrollo de la unidad
              </h3>

              <div className="prose prose-slate max-w-none">
                <p className="text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {content.summary || 'Sin contenido proporcionado'}
                </p>
              </div>
            </article>

            {/* COLUMNA DERECHA: RECURSOS EXTRA (Solo si hay) */}
            {hasResources && (
              <aside className="space-y-6">
                <h4 className="text-[11px] font-black text-muted-foreground uppercase tracking-widest px-1">Material Extra</h4>
                
                {content.url && (
                  <div className="bg-card p-6 rounded-3xl border border-border shadow-sm text-center hover:border-secondary transition-colors">
                    <div className="text-4xl text-primary mb-3"><i className="bi bi-file-earmark-pdf"></i></div>
                    <p className="text-[11px] font-black text-foreground uppercase mb-5">Guía PDF</p>
                    <a href={content.url} target="_blank" rel="noopener noreferrer"
                      className="block w-full py-3 bg-secondary text-secondary-foreground rounded-xl text-xs font-bold hover:opacity-90 transition-opacity shadow-sm">
                      Abrir PDF
                    </a>
                  </div>
                )}
                
                {content.podcast && (
                  <div className="bg-foreground p-6 rounded-3xl text-background shadow-xl">
                    <div className="flex items-center gap-3 mb-5">
                      <span className="text-xl text-secondary"><i className="bi bi-mic-fill"></i></span>
                      <p className="text-[10px] font-black opacity-80 tracking-widest uppercase text-background">Podcast</p>
                    </div>
                    <button className="w-full py-3 bg-background text-foreground rounded-xl text-xs font-bold hover:opacity-90 transition-opacity">
                      Escuchar Resumen
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}