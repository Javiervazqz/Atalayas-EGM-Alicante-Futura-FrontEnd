'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import PageHeader from '@/components/ui/pageHeader';
import { API_ROUTES, fetchWithApiFallback } from '@/lib/utils';

export default function NewCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [titleError, setTitleError] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    isPublic: true, // Por defecto público según el contexto
    category: 'BASICO' as 'BASICO' | 'ESPECIALIZADO',
    file: null as File | null,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setTitleError(true);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Sesión expirada");

      // Construcción del FormData para envío multimedia
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('isPublic', 'true');
      data.append('category', formData.category);
      
      if (formData.file) {
        data.append('file', formData.file);
      }

      const res = await fetch(API_ROUTES.COURSES.CREATE, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Nota: No definir Content-Type aquí, el navegador lo hará automáticamente
        },
        body: data,
      });

      if (!res.ok) throw new Error("Error al crear el curso");

      router.push('/dashboard/administrator/general-admin/courses/manage');
      router.refresh();
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-6 py-4 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.08] focus:border-primary focus:ring-4 focus:ring-primary/5 rounded-[1.5rem] outline-none transition-all text-[15px] font-bold text-foreground placeholder:text-muted-foreground/40";

  return (
    <div className="flex h-screen bg-[#f5f5f7] dark:bg-[#0d0d0f] font-sans text-foreground overflow-hidden">
      <Sidebar role="GENERAL_ADMIN" />

      <main className="flex-1 flex flex-col min-w-0 bg-white/40 dark:bg-transparent backdrop-blur-3xl overflow-y-auto no-scrollbar">
        <PageHeader
          title="Nuevo Curso Público"
          description="Diseña y publica contenido formativo accesible para toda la red."
          icon={<i className="bi bi-globe-americas"></i>}
          backUrl="/dashboard/administrator/general-admin/courses/manage"
        />

        <div className="p-6 lg:p-12 flex-1 max-w-3xl mx-auto w-full">
          <form 
            onSubmit={handleSubmit} 
            className="bg-white dark:bg-[#1c1c1e] p-8 lg:p-12 rounded-[2.5rem] border border-gray-200/50 dark:border-white/6 shadow-[0_20px_50px_rgba(0,0,0,0.02)] space-y-10"
          >
            {/* TÍTULO */}
            <div className="space-y-3">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">
                Identificación del Curso
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={e => {
                  setFormData({ ...formData, title: e.target.value });
                  if (titleError) setTitleError(false);
                }}
                className={`${inputClass} ${titleError ? 'border-red-500/50 bg-red-500/2' : ''}`}
                placeholder="Ej: Programa de Onboarding 2026..."
              />
              {titleError && (
                <p className="text-red-500 text-[11px] font-bold ml-2 animate-in fade-in slide-in-from-left-2">
                  Es necesario asignar un nombre al curso
                </p>
              )}
            </div>

            {/* SUBIDA DE IMAGEN (FILE) */}
            <div className="space-y-3">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">
                Identidad Visual (Portada)
              </label>
              <div className="relative group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                  className="absolute inset-0 opacity-0 cursor-pointer z-20"
                />
                <div className={`
                  relative h-48 w-full border-2 border-dashed rounded-[2rem] 
                  flex flex-col items-center justify-center transition-all duration-300
                  ${formData.file 
                    ? 'border-primary/40 bg-primary/2' 
                    : 'border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/1 group-hover:bg-gray-100 dark:group-hover:bg-white/3'}
                `}>
                  <div className={`
                    w-16 h-16 rounded-[1.2rem] flex items-center justify-center text-2xl mb-4 transition-all
                    ${formData.file ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/20' : 'bg-white dark:bg-white/5 text-muted-foreground shadow-sm'}
                  `}>
                    <i className={`bi ${formData.file ? 'bi-check-lg' : 'bi-image'}`}></i>
                  </div>
                  
                  <div className="text-center px-6">
                    <p className="text-[13px] font-bold text-foreground">
                      {formData.file ? formData.file.name : 'Seleccionar imagen de portada'}
                    </p>
                    <p className="text-[11px] font-medium text-muted-foreground mt-1">
                      {formData.file ? `${(formData.file.size / 1024).toFixed(1)} KB` : 'Formatos recomendados: JPG, PNG (Max 2MB)'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* BOTÓN SUBMIT */}
            <div className="pt-6 border-t border-gray-100 dark:border-white/5">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-primary text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 disabled:opacity-50 disabled:scale-100"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Procesando...
                  </span>
                ) : (
                  'Publicar Curso Global'
                )}
              </button>
            </div>
          </form>
          
          <p className="text-center mt-8 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">
            Este curso será visible instantáneamente para todos los usuarios de la plataforma
          </p>
        </div>
      </main>
    </div>
  );
}