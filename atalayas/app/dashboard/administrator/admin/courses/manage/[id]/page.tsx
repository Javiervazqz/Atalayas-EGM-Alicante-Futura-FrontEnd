'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import { API_ROUTES } from '@/lib/utils';

export default function EditCoursePage() {
    const router = useRouter();
    const params = useParams();
    const courseId = params.id;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [titleError, setTitleError] = useState(false);

    const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};

    const [formData, setFormData] = useState({
        title: '',
        isPublic: false,
        category: 'BASICO',
        file: null as File | null
    });

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                const token = localStorage.getItem('token');
                const baseUrl = API_ROUTES.COURSES.GET_ALL.replace(/\/$/, "");
                const res = await fetch(`${baseUrl}/${courseId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    setFormData({
                        title: data.title || '',
                        isPublic: false, 
                        category: data.category?.toUpperCase() === 'ESPECIALIZADO' ? 'ESPECIALIZADO' : 'BASICO',
                        file: null
                    });
                } else {
                    router.push('/dashboard/administrator/admin/courses/manage');
                }
            } catch (err) {
                console.error("Error al cargar:", err);
            } finally {
                setFetching(false);
            }
        };

        if (courseId) fetchCourseData();
    }, [courseId, router]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            setTitleError(true);
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const baseUrl = API_ROUTES.COURSES.GET_ALL.replace(/\/$/, "");
            const targetUrl = `${baseUrl}/${courseId}`;

            const payload = {
                title: formData.title.trim(),
                isPublic: false,
                category: formData.category,
                fileUrl: formData.file ? formData.file.name : null,
                companyId: user.companyId || null
            };

            const res = await fetch(targetUrl, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                window.location.href = '/dashboard/administrator/admin/courses/manage';
            } else {
                const errorData = await res.json().catch(() => ({}));
                alert("Error al guardar: " + (errorData.message || "Error del servidor"));
                setLoading(false);
            }
        } catch (err) {
            alert("Error de conexión.");
            setLoading(false);
        }
    };

    if (fetching) return (
        <div className="flex min-h-screen bg-background items-center justify-center font-sans">
            <div className="font-bold text-secondary animate-pulse text-lg flex items-center gap-3">
               <i className="bi bi-arrow-repeat animate-spin text-2xl"></i> Cargando información...
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-background font-sans">
            <Sidebar role="ADMIN" />

            <main className="flex-1 p-6 lg:p-12 overflow-y-auto">
                <div className="max-w-2xl mx-auto">
                    <header className="mb-10">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="text-secondary font-bold text-sm mb-6 flex items-center gap-2 hover:opacity-80 transition-opacity bg-transparent border-none cursor-pointer"
                        >
                            <i className="bi bi-chevron-left"></i> Volver
                        </button>
                        <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">Editar Curso</h1>
                        <p className="text-muted-foreground mt-2 text-base">Modifica los detalles del contenido formativo de tu empresa.</p>
                    </header>

                    <form onSubmit={handleSubmit} className="bg-card p-6 lg:p-10 rounded-3xl border border-border shadow-sm space-y-8">

                        {/* 1. TÍTULO CON VALIDACIÓN ROJA */}
                        <div>
                            <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2 ml-1">Nombre del Curso</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={e => {
                                    setFormData({ ...formData, title: e.target.value });
                                    if (titleError) setTitleError(false);
                                }}
                                className={`w-full px-5 py-4 rounded-2xl bg-background border outline-none font-bold text-foreground transition-all text-sm placeholder:text-muted-foreground/50 ${titleError ? 'border-destructive bg-destructive/5' : 'border-input focus:border-primary focus:ring-2 focus:ring-ring'}`}
                                placeholder="Título del curso..."
                            />
                            {titleError && (
                                <p className="text-destructive text-xs font-bold mt-2 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                                    <i className="bi bi-exclamation-triangle-fill text-[10px]"></i> Error: El nombre del curso es obligatorio
                                </p>
                            )}
                        </div>

                        {/* 2. CATEGORÍA CON ICONOS */}
                        <div className="space-y-4">
                            <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Tipo de Formación</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, category: 'BASICO' })}
                                    className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-2 cursor-pointer transition-all font-bold text-sm ${formData.category === 'BASICO' ? 'border-primary bg-primary/5 text-primary shadow-sm' : 'border-border bg-background text-muted-foreground hover:border-primary/50'}`}
                                >
                                    <i className="bi bi-book"></i> Onboarding
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, category: 'ESPECIALIZADO' })}
                                    className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-2 cursor-pointer transition-all font-bold text-sm ${formData.category === 'ESPECIALIZADO' ? 'border-secondary bg-secondary/5 text-secondary shadow-sm' : 'border-border bg-background text-muted-foreground hover:border-secondary/50'}`}
                                >
                                    <i className="bi bi-mortarboard"></i> Especialización
                                </button>
                            </div>
                        </div>

                        {/* 3. MATERIAL PDF */}
                        <div className="space-y-3">
                            <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Material Base (Opcional)</label>
                            <div className="relative h-[4.5rem] w-full border-2 border-dashed border-border rounded-2xl flex items-center justify-center bg-background hover:bg-muted transition-all cursor-pointer group">
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={e => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                />
                                <p className="font-bold text-sm text-foreground px-4 truncate flex items-center">
                                    <i className={`bi ${formData.file ? 'bi-file-earmark-check-fill text-emerald-500' : 'bi-file-earmark-pdf text-primary'} text-lg mr-2 group-hover:scale-110 transition-transform`}></i>
                                    {formData.file ? formData.file.name : 'Sustituir documento base'}
                                </p>
                            </div>
                        </div>

                        {/* 4. BOTÓN DE ACCIÓN */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-secondary text-secondary-foreground rounded-2xl font-bold text-base hover:opacity-90 transition-opacity active:scale-[0.98] cursor-pointer shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <><i className="bi bi-arrow-repeat animate-spin text-xl"></i> Guardando...</>
                                ) : (
                                    'Guardar Cambios'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}