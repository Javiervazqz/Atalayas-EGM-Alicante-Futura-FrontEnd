"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/ui/Sidebar";
import { API_ROUTES } from "@/lib/utils";

export default function NewAIContentPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sourceType, setSourceType] = useState<'file' | 'link'>('file');
  
  const [options, setOptions] = useState({
    generateSummary: true,
    generateQuiz: false,
    generatePodcast: false,
  });

  const [formData, setFormData] = useState({
    title: '',
    url: '',
    file: null as File | null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación visual premium
    if (!formData.title.trim()) return alert("El título de la lección es obligatorio");

    setLoading(true);

    if (!id) {
      console.error("No se encontró el ID del curso");
      setLoading(false);
      return;
    }

    const data = new FormData();
    data.append("title", formData.title);

    // Enviamos las opciones de IA como un string JSON que el backend parseará
    data.append("options", JSON.stringify(options));
    data.append('title', formData.title);
    data.append('options', JSON.stringify(options));

    if (sourceType === 'file' && formData.file) {
      data.append('file', formData.file);
    } else if (sourceType === 'link' && formData.url) {
      data.append('externalUrl', formData.url);
    }

    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch(API_ROUTES.CONTENT.CREATE(id as string), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data, 
      });

      if (res.ok) {
        router.push(`/dashboard/administrator/admin/courses/${id}`);
        router.refresh();
      } else {
        const errorData = await res.json();
        alert(
          `Error del servidor: ${errorData.message || "No se pudo generar el contenido"}`,
        );
      }
    } catch (error) {
      console.error("Error crítico:", error);
      alert("Fallo de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background font-sans">
      <Sidebar role="ADMIN" />
      
      <main className="flex-1 p-6 lg:p-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          
          <header className="mb-10">
            <Link href={`/dashboard/administrator/admin/courses/${id}`} className="text-secondary font-bold text-sm mb-6 flex items-center gap-2 hover:opacity-80 transition-opacity">
              <i className="bi bi-chevron-left"></i> Volver a Moderación
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 mt-4">
              <div className="w-20 h-20 bg-secondary/10 rounded-3xl flex items-center justify-center shrink-0 border border-secondary/20 shadow-sm">
                <i className="bi bi-robot text-secondary text-4xl"></i>
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight mb-2">Generador de Contenido IA</h1>
                <p className="text-muted-foreground text-base font-medium">Sube un documento o enlace y deja que la IA cree la lección mágicamente.</p>
              </div>
            </div>
          </header>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 1. DATOS BÁSICOS (TÍTULO) */}
            <div className="bg-card p-6 lg:p-10 rounded-3xl border border-border shadow-sm">
              <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-3 ml-1">
                Nombre de la Unidad / Lección
              </label>
              <input 
                type="text" 
                required
                value={formData.title} 
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-6 py-5 rounded-2xl bg-background border border-input focus:border-primary focus:ring-2 focus:ring-ring outline-none font-bold text-foreground text-lg transition-all placeholder:text-muted-foreground/50"
                placeholder="Ej: Manual de Bienvenida v2"
              />
            </div>

            {/* 2. FUENTE DEL CONTENIDO (SELECTOR Y INPUTS) */}
            <div className="bg-card p-6 lg:p-10 rounded-3xl border border-border shadow-sm">
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button 
                  type="button"
                  onClick={() => setSourceType('file')}
                  className={`flex-1 p-5 rounded-2xl border-2 transition-all font-bold text-sm flex items-center justify-center gap-3 cursor-pointer ${sourceType === 'file' ? 'border-primary bg-primary/5 text-primary shadow-sm' : 'border-border bg-background text-muted-foreground hover:border-primary/30'}`}
                >
                  <i className="bi bi-file-earmark-pdf text-xl"></i> Subir PDF
                </button>
                <button
                  type="button"
                  onClick={() => setSourceType('link')}
                  className={`flex-1 p-5 rounded-2xl border-2 transition-all font-bold text-sm flex items-center justify-center gap-3 cursor-pointer ${sourceType === 'link' ? 'border-primary bg-primary/5 text-primary shadow-sm' : 'border-border bg-background text-muted-foreground hover:border-primary/30'}`}
                >
                  <i className="bi bi-link-45deg text-xl"></i> Enlace Web
                </button>
              </div>

              {sourceType === 'file' ? (
                <div className="border-2 border-dashed border-border rounded-3xl p-12 text-center hover:border-primary hover:bg-primary/5 transition-all cursor-pointer relative bg-muted/30 group">
                  <input 
                    type="file" 
                    accept=".pdf"
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    onChange={(e) => setFormData({...formData, file: e.target.files?.[0] || null})}
                  />
                  <i className={`bi bi-cloud-arrow-up text-5xl mb-4 block transition-colors ${formData.file ? 'text-primary' : 'text-muted-foreground/30 group-hover:text-primary/50'}`}></i>
                  <p className="text-base font-bold text-foreground mb-1">
                    {formData.file ? formData.file.name : "Arrastra tu PDF aquí o haz click"}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">{formData.file ? 'Archivo listo para procesar' : 'Máx: 10MB (Formatos: .pdf)'}</p>
                </div>
              ) : (
                <div className="relative">
                    <i className="bi bi-link-45deg absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground text-xl"></i>
                    <input 
                      type="url"
                      value={formData.url}
                      placeholder="https://ejemplo.com/articulo-interesante"
                      className="w-full pl-14 pr-6 py-5 bg-background rounded-2xl border border-input focus:border-primary focus:ring-2 focus:ring-ring outline-none font-bold text-foreground transition-all placeholder:text-muted-foreground/50"
                      onChange={(e) => setFormData({...formData, url: e.target.value})}
                    />
                </div>
              )}
            </div>

            {/* 3. OPCIONES DE IA */}
            <div className="bg-card p-6 lg:p-10 rounded-3xl border border-border shadow-sm">
              <h3 className="text-xl font-bold text-foreground mb-6">¿Qué quieres que genere la IA?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                
                {/* Resumen */}
                <button
                  type="button" 
                  onClick={() => setOptions({...options, generateSummary: !options.generateSummary})}
                  className={`p-6 rounded-3xl text-left border-2 transition-all duration-300 cursor-pointer active:scale-[0.98] flex flex-col items-start ${
                    options.generateSummary 
                      ? 'border-primary bg-primary/5 shadow-sm' 
                      : 'border-border bg-background opacity-70 grayscale hover:opacity-100 hover:border-primary/50'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${options.generateSummary ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    <i className="bi bi-text-paragraph text-2xl"></i>
                  </div>
                  <p className="font-bold text-base text-foreground mb-1">Resumen IA</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">Extrae los puntos clave y crea el resumen de la lección.</p>
                </button>

                {/* Quiz */}
                <button
                  type="button"
                  onClick={() => setOptions({...options, generateQuiz: !options.generateQuiz})}
                  className={`p-6 rounded-3xl text-left border-2 transition-all duration-300 cursor-pointer active:scale-[0.98] flex flex-col items-start ${
                    options.generateQuiz 
                      ? 'border-secondary bg-secondary/5 shadow-sm' 
                      : 'border-border bg-background opacity-70 grayscale hover:opacity-100 hover:border-secondary/50'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${options.generateQuiz ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    <i className="bi bi-patch-question text-2xl"></i>
                  </div>
                  <p className="font-bold text-base text-foreground mb-1">Test IA</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">Crea preguntas interactivas automáticas para el usuario.</p>
                </button>

                {/* Podcast */}
                <button
                  type="button"
                  onClick={() => setOptions({...options, generatePodcast: !options.generatePodcast})}
                  className={`p-6 rounded-3xl text-left border-2 transition-all duration-300 cursor-pointer active:scale-[0.98] flex flex-col items-start ${
                    options.generatePodcast 
                      ? 'border-indigo-500 bg-indigo-500/5 shadow-sm' 
                      : 'border-border bg-background opacity-70 grayscale hover:opacity-100 hover:border-indigo-500/50'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${options.generatePodcast ? 'bg-indigo-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                    <i className="bi bi-mic text-2xl"></i>
                  </div>
                  <p className="font-bold text-base text-foreground mb-1">Podcast IA</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">Genera un audio explicativo con voz sintetizada realista.</p>
                </button>
              </div>
            </div>

            {/* BOTÓN SUBMIT */}
            <div className="pt-4">
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-6 bg-secondary text-secondary-foreground rounded-[2rem] font-extrabold uppercase tracking-widest text-base hover:opacity-90 transition-all shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? (
                  <><i className="bi bi-arrow-repeat animate-spin text-2xl"></i> Procesando con IA de Atalayas...</>
                ) : (
                  <><i className="bi bi-magic text-xl"></i> Generar Lección </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
