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
  const [imageType, setImageType] = useState<"link" | "file">("link");

  const [options, setOptions] = useState({
    generateSummary: true,
    generateQuiz: false,
    generatePodcast: false,
  });

  const [formData, setFormData] = useState({
    title: "",
    file: null as File | null,
    imageUrl: "",
    imageFile: null as File | null,
  });

  // El botón de generar se activa solo si hay título y archivo PDF
  const isReady = formData.title.trim().length > 0 && formData.file !== null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isReady) return;
    
    setLoading(true);
    const data = new FormData();
    data.append("title", formData.title);
    data.append("options", JSON.stringify(options));

    // Solo enviamos el archivo PDF
    if (formData.file) {
      data.append("file", formData.file);
    }

    // Imagen de Portada (Sigue permitiendo ambos métodos para flexibilidad visual)
    if (imageType === "file" && formData.imageFile) {
      data.append("imageFile", formData.imageFile);
    } else if (imageType === "link" && formData.imageUrl) {
      data.append("imageUrl", formData.imageUrl);
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_ROUTES.CONTENT.CREATE(id as string), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });

      if (res.ok) {
        router.push(`/dashboard/administrator/admin/courses/${id}`);
        router.refresh();
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.message || "No se pudo procesar el PDF"}`);
      }
    } catch (error) {
      alert("Fallo de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f5f5f7]" style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" }}>
      <Sidebar role="ADMIN" />
      <main className="flex-1 p-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <header className="mb-12">
            <Link href={`/dashboard/administrator/admin/courses/${id}`} className="group text-[#0071e3] text-sm font-semibold hover:underline mb-6 inline-flex items-center gap-2 cursor-pointer">
              <i className="bi bi-arrow-left-circle-fill transition-transform group-hover:-translate-x-1.5"></i>
              <span>Volver al curso</span>
            </Link>
            <div className="flex items-center gap-4 mt-4">
              <div className="p-4 bg-[#d9ff00] rounded-3xl shadow-lg">
                <i className="bi bi-robot text-[#005596] text-3xl"></i>
              </div>
              <div>
                <h1 className="text-4xl font-black text-[#1d1d1f] tracking-tight">Generador de Contenido IA</h1>
                <p className="text-[#86868b] text-lg">Sube un documento y nuestra IA creará la lección completa.</p>
              </div>
            </div>
          </header>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 1. TÍTULO */}
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
              <label className="block text-[11px] font-black uppercase tracking-widest text-[#86868b] mb-2 ml-1">Título de la Unidad</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-6 py-5 rounded-2xl bg-[#f5f5f7] border-2 border-transparent focus:border-blue-300 outline-none font-bold text-[#1d1d1f]"
                placeholder="Ej: Manual Operativo"
              />
            </div>

            {/* 2. SUBIDA DE PDF (Única fuente) */}
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
              <label className="block text-[11px] font-black uppercase tracking-widest text-[#86868b] mb-4 ml-1">Documento PDF (Fuente principal)</label>
              <div className="border-2 border-dashed border-gray-200 rounded-[2rem] p-12 text-center relative bg-gray-50/50 hover:border-blue-400 transition-colors cursor-pointer">
                <input 
                  type="file" 
                  accept=".pdf" 
                  required
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })} 
                />
                <i className="bi bi-file-earmark-pdf-fill text-5xl text-[#005596] mb-4 block"></i>
                <p className="text-base font-bold text-[#1d1d1f]">
                  {formData.file ? formData.file.name : "Selecciona o arrastra el PDF aquí"}
                </p>
                <p className="text-xs text-[#86868b] mt-2">Este archivo será analizado para generar el resumen y los tests.</p>
              </div>
            </div>

            {/* 3. IMAGEN DE PORTADA */}
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
              <label className="block text-[11px] font-black uppercase tracking-widest text-[#86868b] mb-4 ml-1">Imagen de Portada (Opcional)</label>
              <div className="flex gap-4 mb-6">
                <button type="button" onClick={() => setImageType("link")} className={`flex-1 p-5 rounded-2xl border-2 transition-all font-black text-sm flex items-center justify-center gap-3 cursor-pointer ${imageType === "link" ? "border-[#005596] bg-blue-50 text-[#005596]" : "border-gray-100 bg-white text-gray-400"}`}>
                  <i className="bi bi-link-45deg text-xl"></i> URL IMAGEN
                </button>
                <button type="button" onClick={() => setImageType("file")} className={`flex-1 p-5 rounded-2xl border-2 transition-all font-black text-sm flex items-center justify-center gap-3 cursor-pointer ${imageType === "file" ? "border-[#005596] bg-blue-50 text-[#005596]" : "border-gray-100 bg-white text-gray-400"}`}>
                  <i className="bi bi-image text-xl"></i> SUBIR ARCHIVO
                </button>
              </div>
              {imageType === "link" ? (
                <input type="url" value={formData.imageUrl} placeholder="https://..." className="w-full px-6 py-5 bg-[#f5f5f7] rounded-2xl border-2 border-transparent focus:border-blue-300 outline-none font-bold" onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} />
              ) : (
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center relative bg-gray-50/50 hover:border-blue-300 transition-colors cursor-pointer">
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setFormData({ ...formData, imageFile: e.target.files?.[0] || null })} />
                  <p className="text-sm font-bold">{formData.imageFile ? formData.imageFile.name : "Subir imagen personalizada"}</p>
                </div>
              )}
            </div>

            {/* 4. OPCIONES IA */}
            {formData.file && (
              <div className="bg-white p-8 rounded-[32px] border border-[#d9ff00] shadow-xl shadow-lime-500/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 mb-6">
                    <span className="flex h-3 w-3 rounded-full bg-green-500 animate-pulse"></span>
                    <h3 className="text-xl font-black text-[#1d1d1f]">Motor IA Preparado</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {[
                    { key: "generateSummary", label: "Resumen IA", icon: "bi-text-paragraph", color: "bg-blue-100", text: "text-[#005596]", desc: "Extrae lo más importante." },
                    { key: "generateQuiz", label: "Test IA", icon: "bi-patch-question", color: "bg-orange-100", text: "text-orange-600", desc: "Preguntas automáticas." },
                    { key: "generatePodcast", label: "Podcast IA", icon: "bi-mic", color: "bg-purple-100", text: "text-purple-600", desc: "Comentario narrado." }
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setOptions({ ...options, [opt.key]: !options[opt.key as keyof typeof options] })}
                      className={`p-6 rounded-3xl text-left border-2 transition-all duration-300 active:scale-[0.98] cursor-pointer ${options[opt.key as keyof typeof options] ? "border-[#d9ff00] bg-white shadow-md" : "border-gray-50 opacity-40 grayscale"}`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${opt.color}`}>
                        <i className={`bi ${opt.icon} text-xl ${opt.text}`}></i>
                      </div>
                      <p className="font-black text-sm text-[#1d1d1f]">{opt.label}</p>
                      <p className="text-[10px] text-gray-400 mt-1 leading-tight">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading || !isReady}
              className="w-full py-6 bg-[#005596] text-white rounded-[2rem] font-black uppercase tracking-widest text-lg hover:bg-[#d9ff00] hover:text-[#005596] transition-all shadow-xl disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer active:scale-[0.99]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="bi bi-arrow-repeat animate-spin"></i> Procesando documento...
                </span>
              ) : "Generar Lección con IA"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}