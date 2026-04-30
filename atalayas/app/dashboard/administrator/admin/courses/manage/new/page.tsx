'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/ui/Sidebar";
import PageHeader from "@/components/ui/pageHeader";
import { API_ROUTES } from "@/lib/utils";

export default function NewCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [useAi, setUseAi] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    isPublic: false,
    category: "BASICO",
    file: null as File | null
  });

  const user = typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("user") || '{"companyId": null}')
    : { companyId: null };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validaciones
    if (!formData.title.trim()) {
      alert("El título es obligatorio");
      return;
    }

    if (useAi && !formData.file) {
      alert("Sube un PDF para usar la IA.");
      return;
    }

    setLoading(true);
    setLoadingStep("Iniciando creación...");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No hay sesión iniciada");
      }

      // Preparar datos para enviar
      const courseData = {
        title: formData.title,
        isPublic: formData.isPublic,
        category: formData.category,
        companyId: user.companyId
      };

      console.log("Enviando datos:", courseData);
      console.log("URL:", API_ROUTES.COURSES.CREATE);

      // 1. Crear el curso
      setLoadingStep("Creando curso...");
      const resCourse = await fetch(API_ROUTES.COURSES.CREATE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(courseData),
      });

      // Verificar respuesta
      if (!resCourse.ok) {
        const errorText = await resCourse.text();
        console.error("Error respuesta:", resCourse.status, errorText);
        throw new Error(`Error al crear el curso: ${resCourse.status} ${errorText}`);
      }

      const newCourse = await resCourse.json();
      console.log("Curso creado exitosamente:", newCourse);

      // 2. Procesar con IA si está activado y hay archivo
      if (useAi && formData.file && newCourse.id) {
        setLoadingStep("🧠 Procesando Podcast con IA...");

        const aiFormData = new FormData();
        aiFormData.append("title", `Módulo 1: ${formData.title}`);
        aiFormData.append("file", formData.file);

        try {
          const aiResponse = await fetch(`http://localhost:3000/courses/${newCourse.id}/content/ai`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`
            },
            body: aiFormData,
          });

          if (!aiResponse.ok) {
            console.warn("El curso se creó pero hubo error en el procesamiento de IA");
          } else {
            console.log("Contenido IA procesado correctamente");
          }
        } catch (aiError) {
          console.error("Error en procesamiento IA:", aiError);
          // No detenemos el flujo, el curso ya está creado
        }
      }

      // 3. Redirigir a la lista de cursos
      router.push("/dashboard/administrator/admin/courses/manage");

    } catch (err) {
      console.error("Error detallado:", err);
      alert(err instanceof Error ? err.message : "Error en el proceso de creación.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background font-sans">
      <Sidebar role="ADMIN" />
      <main className="flex-1 overflow-auto flex flex-col">
        <PageHeader
          title="Nuevo Curso"
          description="Crea contenido formativo apoyado por Inteligencia Artificial."
          icon={<i className="bi bi-plus-circle-fill"></i>}
          backUrl="/dashboard/administrator/admin/courses/manage"
        />

        <div className="p-6 lg:p-10 max-w-3xl mx-auto w-full">
          <form onSubmit={handleSubmit} className="bg-card p-8 lg:p-10 rounded-[2.5rem] border border-border shadow-sm space-y-8">
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                Nombre del curso
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-6 py-4 rounded-2xl bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold transition-all"
                placeholder="Ej: Prevención de Riesgos"
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, category: 'BASICO' })}
                className={`p-4 rounded-2xl border-2 font-bold transition-all flex items-center justify-center gap-2 ${formData.category === 'BASICO' ? 'border-primary bg-primary/5 text-primary' : 'border-transparent bg-muted/50 text-muted-foreground'}`}
                disabled={loading}
              >
                <i className="bi bi-book text-xl"></i>
                Onboarding
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, category: 'ESPECIALIZADO' })}
                className={`p-4 rounded-2xl border-2 font-bold transition-all flex items-center justify-center gap-2 ${formData.category === 'ESPECIALIZADO' ? 'border-primary bg-primary/5 text-primary' : 'border-transparent bg-muted/50 text-muted-foreground'}`}
                disabled={loading}
              >
                <i className="bi bi-mortarboard text-xl"></i>
                Especialización
              </button>
            </div>

            <div className="space-y-4">
              <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                Material PDF
              </label>
              <label className={`relative h-32 w-full border-2 border-dashed rounded-3xl flex items-center justify-center transition-all cursor-pointer group ${loading ? 'border-border opacity-50 cursor-not-allowed' : 'border-border hover:border-primary'}`}>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                  className="hidden"
                  disabled={loading}
                />
                <div className="text-center">
                  <i className="bi bi-file-pdf text-3xl text-muted-foreground mb-2 block"></i>
                  <p className="font-bold text-foreground">
                    {formData.file ? formData.file.name : "Seleccionar PDF"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Click para subir
                  </p>
                </div>
              </label>
            </div>

            {formData.file && (
              <div
                onClick={() => !loading && setUseAi(!useAi)}
                className={`p-5 cursor-pointer rounded-2xl border-2 transition-all flex items-center justify-between ${useAi ? 'border-indigo-500 bg-indigo-50/50' : 'border-transparent bg-muted/50'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${useAi ? 'bg-indigo-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                    <i className="bi bi-mic"></i>
                  </div>
                  <div className="flex flex-col">
                    <p className={`font-bold ${useAi ? 'text-indigo-900' : 'text-foreground'}`}>
                      Podcast con IA
                    </p>
                    <p className="text-[9px] uppercase font-black opacity-50">
                      Resumen auditivo
                    </p>
                  </div>
                </div>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${useAi ? 'bg-indigo-500' : 'bg-muted-foreground/30'}`}>
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${useAi ? 'left-6' : 'left-1'}`} />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg hover:opacity-90 disabled:opacity-50 shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <i className="bi bi-arrow-repeat animate-spin"></i>
                  {loadingStep}
                </>
              ) : (
                <>
                  <i className="bi bi-plus-circle"></i>
                  Crear Curso
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}