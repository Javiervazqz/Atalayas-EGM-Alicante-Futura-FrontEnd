'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import PageHeader from '@/components/ui/pageHeader';
import { API_ROUTES } from '@/lib/utils';

export default function NewCoursePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [titleError, setTitleError] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        imageFile: null as File | null,
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData({ ...formData, imageFile: file });
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // VALIDACIÓN DE TÍTULO
        if (!formData.title.trim()) {
            setTitleError(true);
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error("No hay sesión iniciada");
            }

            // Usamos FormData para enviar la imagen y los campos
            const data = new FormData();
            data.append('title', formData.title.trim());
            data.append('isPublic', 'true');
            data.append('category', 'BASICO');

            if (formData.imageFile) {
                data.append('file', formData.imageFile);
            }

            const resCourse = await fetch(API_ROUTES.COURSES.CREATE, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: data,
            });

            if (!resCourse.ok) {
                const errorText = await resCourse.text();
                throw new Error(errorText || "Error al crear el curso.");
            }

            router.push('/dashboard/administrator/general-admin/courses/manage');
        } catch (err) {
            console.error("Error:", err);
            alert(err instanceof Error ? err.message : "Error al crear el curso.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-muted/30 font-sans text-foreground">
            <Sidebar role="GENERAL_ADMIN" />

            <main className="flex-1 overflow-auto flex flex-col relative">
                <PageHeader
                    title="Nuevo Curso Público"
                    description="Crea cursos visibles para todas las empresas del sistema."
                    icon={<i className="bi bi-globe-americas"></i>}
                    backUrl="/dashboard/administrator/general-admin/courses/manage"
                />

                <div className="p-6 lg:p-12 flex-1 max-w-2xl mx-auto w-full">
                    <form onSubmit={handleSubmit} className="bg-card p-6 lg:p-10 rounded-[32px] border border-border/60 shadow-sm space-y-8">

                        {/* IMAGEN DE PORTADA */}
                        <div className="space-y-3">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                Imagen de Portada
                            </label>
                            <label className="relative h-40 w-full border-2 border-dashed border-border/60 rounded-[24px] flex items-center justify-center bg-muted/20 hover:bg-muted/40 transition-all cursor-pointer group overflow-hidden">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                />
                                {imagePreview ? (
                                    <>
                                        <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <div className="text-center text-white">
                                                <i className="bi bi-camera text-2xl mb-1 block"></i>
                                                <span className="text-[10px] font-bold">Cambiar imagen</span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 px-6">
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-card text-primary shadow-sm">
                                            <i className="bi bi-image-fill"></i>
                                        </div>
                                        <p className="font-bold text-xs text-foreground text-center">
                                            Seleccionar imagen de portada
                                        </p>
                                        <p className="text-[9px] text-muted-foreground">
                                            JPG, PNG, GIF hasta 5MB
                                        </p>
                                    </div>
                                )}
                            </label>
                        </div>

                        {/* NOMBRE DEL CURSO */}
                        <div className="space-y-3">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                Título del Curso
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={e => {
                                    setFormData({ ...formData, title: e.target.value });
                                    if (titleError) setTitleError(false);
                                }}
                                className={`w-full px-5 py-4 rounded-2xl bg-background border outline-none font-bold text-foreground transition-all text-sm placeholder:text-muted-foreground/40 ${titleError ? 'border-destructive bg-destructive/5' : 'border-border focus:border-primary/40 focus:ring-4 focus:ring-primary/5'
                                    }`}
                                placeholder="Ej: Manual de Bienvenida Global..."
                            />
                            {titleError && (
                                <p className="text-destructive text-[10px] font-bold mt-2 ml-2 flex items-center gap-1 animate-in fade-in slide-in-from-left-1">
                                    <i className="bi bi-exclamation-circle-fill"></i> El título es obligatorio.
                                </p>
                            )}
                        </div>

                        {/* Información adicional para cursos públicos */}
                        <div className="p-4 bg-muted/30 rounded-2xl border border-border/40">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center flex items-center justify-center gap-2">
                                <i className="bi bi-info-circle"></i>
                                Los cursos públicos son siempre del tipo "Onboarding" y visibles para todas las empresas
                            </p>
                        </div>

                        {/* BOTÓN SUBMIT */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4.5 bg-secondary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-95 transition-all active:scale-[0.98] shadow-md hover:shadow-secondary/20 disabled:opacity-50"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-3">
                                        <i className="bi bi-arrow-repeat animate-spin text-lg"></i> Creando curso...
                                    </span>
                                ) : (
                                    'Publicar Curso Global'
                                )}
                            </button>
                            <p className="text-center text-[10px] text-muted-foreground/60 mt-4 font-bold uppercase tracking-tighter">
                                Al publicar, el curso estará disponible inmediatamente en el catálogo público.
                            </p>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}