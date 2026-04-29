'use client';

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/ui/Sidebar";
import PageHeader from "@/components/ui/pageHeader";
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
    generateImage: true,
    generateVideo: false, // Nueva opción para Runway Gen-2
  });

  const [formData, setFormData] = useState({
    title: '',
    url: '',
    file: null as File | null,
  });

  const isReady = formData.title.trim().length > 0 && 
                  (sourceType === 'file' ? formData.file !== null : formData.url.trim().length > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return alert("El título es obligatorio");

    setLoading(true);
    const data = new FormData();
    data.append("title", formData.title);
    data.append("options", JSON.stringify(options));

    if (sourceType === 'file' && formData.file) {
      data.append('file', formData.file);
    } else if (sourceType === 'link' && formData.url) {
      data.append('externalUrl', formData.url);
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_ROUTES.CONTENT.CREATE(id as string), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data, 
      });

      if (res.ok) {
        router.push(`/dashboard/administrator/admin/courses/${id}`);
      } else {
        alert("No se pudo generar el contenido.");
      }
    } catch (error) {
      alert("Fallo de conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background font-sans text-foreground">
      <Sidebar role="ADMIN" />
      
      <main className="flex-1 overflow-auto flex flex-col relative">
        <PageHeader 
          title="Generar Contenido con IA"
          description="Crea contenidos completos con resúmenes, tests, audio, imágenes y clips de vídeo."
          icon={<i className="bi bi-robot"></i>}
          backUrl={`/dashboard/administrator/admin/courses/${id}`}
        />

        <div className="p-6 lg:p-10 max-w-4xl mx-auto w-full">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* COLUMNA IZQUIERDA: CONFIGURACIÓN */}
            <div className="lg:col-span-12 space-y-8">
              <div className="bg-card p-6 lg:p-8 rounded-3xl border border-border shadow-sm">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 ml-1">Nombre de la unidad</label>
                <input 
                  type="text" required value={formData.title} 
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-background border border-input rounded-xl px-5 py-3 text-sm font-semibold focus:border-primary outline-none transition-all shadow-sm"
                  placeholder="Ej: Normas de seguridad en planta"
                />
              </div>

              <div className="bg-card p-6 lg:p-8 rounded-3xl border border-border shadow-sm">
                <div className="flex gap-3 mb-6">
                  <button type="button" onClick={() => setSourceType('file')} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border ${sourceType === 'file' ? 'bg-primary text-white border-primary shadow-md' : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted'}`}>PDF</button>
                  <button type="button" onClick={() => setSourceType('link')} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border ${sourceType === 'link' ? 'bg-primary text-white border-primary shadow-md' : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted'}`}>URL</button>
                </div>

                {sourceType === 'file' ? (
                  <label className="border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 hover:border-primary transition-all group">
                    <input type="file" accept=".pdf" className="hidden" onChange={(e) => setFormData({...formData, file: e.target.files?.[0] || null})} />
                    <i className={`bi bi-cloud-arrow-up text-3xl mb-2 transition-colors ${formData.file ? 'text-primary' : 'text-muted-foreground/40 group-hover:text-primary/50'}`}></i>
                    <p className="text-sm font-bold text-foreground text-center">{formData.file ? formData.file.name : "Subir documento PDF"}</p>
                  </label>
                ) : (
                  <div className="relative">
                    <i className="bi bi-link-45deg absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg"></i>
                    <input type="url" value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value})} className="w-full pl-12 pr-5 py-3 bg-background rounded-xl border border-input focus:border-primary outline-none text-sm font-medium" placeholder="https://ejemplo.com/articulo" />
                  </div>
                )}
              </div>

              <div className="bg-card p-6 lg:p-8 rounded-3xl border border-border shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6 ml-1">¿Qué quieres generar?</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {[
                    { id: 'generateSummary', label: 'Resumen', icon: 'bi-text-left', color: 'bg-emerald-500' },
                    { id: 'generateImage', label: 'Imagen', icon: 'bi-image', color: 'bg-pink-500' },
                    { id: 'generateVideo', label: 'Vídeo', icon: 'bi-play-btn', color: 'bg-purple-600' },
                    { id: 'generateQuiz', label: 'Test', icon: 'bi-patch-question', color: 'bg-amber-500' },
                    { id: 'generatePodcast', label: 'Audio', icon: 'bi-mic', color: 'bg-indigo-500' }
                  ].map((opt) => (
                    <button
                      key={opt.id} type="button"
                      onClick={() => setOptions({...options, [opt.id]: !options[opt.id as keyof typeof options]})}
                      className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${options[opt.id as keyof typeof options] ? `border-primary bg-primary/5` : 'border-transparent bg-muted/40 opacity-60'}`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base ${options[opt.id as keyof typeof options] ? `${opt.color} text-white shadow-lg` : 'bg-muted text-muted-foreground'}`}>
                        <i className={`bi ${opt.icon}`}></i>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-tight">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <button 
                    type="submit" disabled={loading || !isReady} 
                    className="w-full py-4 bg-secondary text-secondary-foreground rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:opacity-90 shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {loading ? <><i className="bi bi-arrow-repeat animate-spin"></i> Generando...</> : <><i className="bi bi-lightning-charge-fill"></i> Crear Unidad</>}
                  </button>
            </div>
          </form>
        </div>
      </main>

      <style jsx>{`
        @keyframes pulse-bg {
          0% { opacity: 0.1; }
          50% { opacity: 0.3; }
          100% { opacity: 0.1; }
        }
      `}</style>
    </div>
  );
}