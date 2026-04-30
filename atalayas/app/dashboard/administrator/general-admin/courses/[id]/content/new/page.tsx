'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import PageHeader from '@/components/ui/pageHeader';
import { API_ROUTES } from '@/lib/utils';

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
    if (!formData.title.trim()) return;

    setLoading(true);
    const data = new FormData();
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
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: data,
      });

      if (res.ok) {
        router.push(`/dashboard/administrator/general-admin/courses/${id}`);
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-muted/30 font-sans text-foreground transition-colors duration-300">
      <Sidebar role="GENERAL_ADMIN" />
      
      <main className="flex-1 overflow-auto flex flex-col relative">
        <PageHeader 
          title="Generador IA"
          description="Transforma documentos técnicos o enlaces en lecciones interactivas completas."
          icon={<i className="bi bi-robot"></i>}
          backUrl={`/dashboard/administrator/general-admin/courses/${id}`}
        />

        <div className="p-6 lg:p-12 flex-1 max-w-4xl mx-auto w-full">
          <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* NOMBRE DE LA LECCIÓN */}
            <div className="bg-card p-8 rounded-[32px] border border-border/60 shadow-sm">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4 ml-1">Título de la Unidad</label>
              <input 
                type="text" 
                required
                value={formData.title} 
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-6 py-5 rounded-[20px] bg-background border border-border focus:border-primary/40 focus:ring-4 focus:ring-primary/5 outline-none font-bold text-lg text-foreground transition-all placeholder:text-muted-foreground/30"
                placeholder="Ej: Protocolos de Seguridad y Salud v2"
              />
            </div>

            {/* FUENTE DE DATOS */}
            <div className="bg-card p-8 rounded-[32px] border border-border/60 shadow-sm">
              <div className="flex gap-4 mb-8 bg-muted/50 p-1.5 rounded-[22px] border border-border/40">
                <button 
                  type="button"
                  onClick={() => setSourceType('file')}
                  className={`flex-1 py-4 rounded-[18px] transition-all font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 cursor-pointer ${sourceType === 'file' ? 'bg-card text-primary shadow-md border border-border/60' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <i className="bi bi-file-earmark-pdf"></i> Archivo PDF
                </button>
                <button 
                  type="button"
                  onClick={() => setSourceType('link')}
                  className={`flex-1 py-4 rounded-[18px] transition-all font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 cursor-pointer ${sourceType === 'link' ? 'bg-card text-primary shadow-md border border-border/60' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <i className="bi bi-link-45deg"></i> Enlace Externo
                </button>
              </div>

              {sourceType === 'file' ? (
                <div className="border-2 border-dashed border-border/60 rounded-[28px] p-16 text-center hover:border-primary/40 transition-all cursor-pointer relative bg-muted/20 group">
                  <input 
                    type="file" 
                    accept=".pdf"
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    onChange={(e) => setFormData({...formData, file: e.target.files?.[0] || null})}
                  />
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl transition-all ${formData.file ? 'bg-green-500 text-white shadow-lg' : 'bg-card text-muted-foreground/40 group-hover:scale-110 group-hover:text-primary'}`}>
                    <i className={`bi ${formData.file ? 'bi-check-lg' : 'bi-cloud-arrow-up'}`}></i>
                  </div>
                  <p className="text-sm font-bold text-foreground">
                    {formData.file ? formData.file.name : "Suelte el documento aquí o haga clic para explorar"}
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-2">Máximo 15MB · Formato PDF</p>
                </div>
              ) : (
                <div className="relative group">
                    <i className="bi bi-link-45deg absolute left-6 top-1/2 -translate-y-1/2 text-primary text-2xl opacity-40 group-focus-within:opacity-100 transition-opacity"></i>
                    <input 
                      type="url"
                      value={formData.url}
                      placeholder="https://ejemplo.com/articulo-formativo"
                      className="w-full pl-16 pr-8 py-6 bg-background rounded-[20px] border border-border focus:border-primary/40 focus:ring-4 focus:ring-primary/5 outline-none font-bold text-foreground transition-all"
                      onChange={(e) => setFormData({...formData, url: e.target.value})}
                    />
                </div>
              )}
            </div>

            {/* OPCIONES IA (CHECK CARDS) */}
            <div className="bg-card p-8 rounded-[32px] border border-border/60 shadow-sm">
              <h3 className="text-xs font-black text-foreground uppercase tracking-[0.2em] mb-8 text-center sm:text-left ml-1">Servicios de Inteligencia a Generar</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {[
                  { id: 'generateSummary', label: 'Resumen IA', icon: 'bi-text-paragraph', color: 'text-primary', desc: 'Extrae conceptos clave automáticamente.' },
                  { id: 'generateQuiz', label: 'Test IA', icon: 'bi-patch-question', color: 'text-orange-500', desc: '5 preguntas de opción múltiple.' },
                  { id: 'generatePodcast', label: 'Audio IA', icon: 'bi-mic', color: 'text-purple-500', desc: 'Voz sintética para aprendizaje móvil.' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button" 
                    onClick={() => setOptions({...options, [opt.id]: !options[opt.id as keyof typeof options]})}
                    className={`p-6 rounded-[24px] text-left border-2 transition-all duration-300 cursor-pointer group relative overflow-hidden ${
                      options[opt.id as keyof typeof options] 
                        ? 'border-primary bg-primary/5 shadow-lg' 
                        : 'border-border/60 bg-muted/10 opacity-60 grayscale hover:opacity-100 hover:border-primary/30'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-all ${options[opt.id as keyof typeof options] ? 'bg-primary text-white' : 'bg-card text-muted-foreground'}`}>
                      <i className={`bi ${opt.icon} text-lg`}></i>
                    </div>
                    <p className="font-black text-[11px] uppercase tracking-widest text-foreground">{opt.label}</p>
                    <p className="text-[10px] text-muted-foreground font-medium mt-1 leading-tight">{opt.desc}</p>
                    {options[opt.id as keyof typeof options] && <i className="bi bi-check-circle-fill absolute top-4 right-4 text-primary"></i>}
                  </button>
                ))}
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading || !formData.title.trim()}
              className="w-full py-6 bg-secondary text-white rounded-[24px] font-black uppercase tracking-[0.3em] text-xs hover:opacity-95 transition-all shadow-xl shadow-secondary/20 disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none cursor-pointer active:scale-[0.98] flex items-center justify-center gap-4"
            >
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Procesando Algoritmo...</>
              ) : (
                <><i className="bi bi-magic text-lg"></i> Generar Currículo Inteligente</>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}