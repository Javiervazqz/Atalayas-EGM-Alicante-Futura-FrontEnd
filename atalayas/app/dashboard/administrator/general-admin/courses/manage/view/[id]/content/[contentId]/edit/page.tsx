'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import PageHeader from '@/components/ui/pageHeader';
import { API_ROUTES } from '@/lib/utils';

export default function GeneralAdminContentEdit() {
    const params = useParams();
    const router = useRouter();
    const courseId = params?.id as string;
    const contentId = params?.contentId as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        summary: '',
        description: '',
        type: 'video',
        url: '',
        imageUrl: '',
        duration: '',
        order: 0,
        isPublished: true
    });

    useEffect(() => {
        const fetchContent = async () => {
            if (!courseId || !contentId) return;
            try {
                setLoading(true);
                const token = localStorage.getItem("token");

                const url = typeof API_ROUTES.CONTENT.GET_BY_ID === 'function'
                    ? API_ROUTES.CONTENT.GET_BY_ID(courseId, contentId)
                    : `${API_ROUTES.CONTENT.GET_ALL}/${contentId}`;

                const res = await fetch(url, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                const content = data.content || data.data || data;

                setFormData({
                    title: content.title || '',
                    summary: content.summary || '',
                    description: content.description || '',
                    type: content.type || 'video',
                    url: content.url || '',
                    imageUrl: content.imageUrl || '',
                    duration: content.duration || '',
                    order: content.order || 0,
                    isPublished: content.isPublished !== undefined ? content.isPublished : true
                });
            } catch (error) {
                console.error("Error fetching content:", error);
                setError("Error al cargar el contenido");
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, [courseId, contentId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const token = localStorage.getItem("token");

            // Usar la misma URL que el GET (la que funciona)
            const url = typeof API_ROUTES.CONTENT.GET_BY_ID === 'function'
                ? API_ROUTES.CONTENT.GET_BY_ID(courseId, contentId)
                : `${API_ROUTES.CONTENT.GET_ALL}/${contentId}`;

            console.log("URL para actualizar:", url);

            const res = await fetch(url, {
                method: 'PUT',  // Si no funciona, cambia a 'POST'
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                throw new Error('Error al guardar los cambios');
            }

            setSuccess("Contenido actualizado correctamente");

            setTimeout(() => {
                router.push(`/dashboard/administrator/general-admin/courses/manage/view/${courseId}`);
            }, 2000);

        } catch (error) {
            console.error("Error updating content:", error);
            setError("Error al guardar los cambios");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex min-h-screen bg-background items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="flex min-h-screen bg-background font-sans text-foreground">
            <Sidebar role="GENERAL_ADMIN" />

            <main className="flex-1 overflow-auto flex flex-col relative">
                <PageHeader
                    title="Editar Contenido"
                    description={`Editando: ${formData.title || 'Nuevo contenido'}`}
                    icon={<i className="bi bi-pencil-square"></i>}
                    backUrl={`/dashboard/administrator/general-admin/courses/manage/view/${courseId}`}
                />

                <div className="p-6 lg:p-10 flex-1 max-w-4xl mx-auto w-full">
                    <div className="mb-6 flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-full px-3 py-1.5 w-fit">
                        <i className="bi bi-shield-lock"></i>
                        <span>Modo edición - Administrador General</span>
                    </div>

                    {success && (
                        <div className="mb-6 bg-green-500/10 border border-green-500 text-green-700 rounded-2xl p-4 flex items-center gap-3">
                            <i className="bi bi-check-circle-fill text-green-600"></i>
                            <span className="text-sm font-medium">{success}</span>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 bg-red-500/10 border border-red-500 text-red-700 rounded-2xl p-4 flex items-center gap-3">
                            <i className="bi bi-exclamation-triangle-fill text-red-600"></i>
                            <span className="text-sm font-medium">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                            <label className="block">
                                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground block mb-2">
                                    Título del contenido *
                                </span>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all"
                                    placeholder="Ej: Introducción al curso"
                                />
                            </label>

                            <label className="block">
                                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground block mb-2">
                                    Resumen / Descripción corta
                                </span>
                                <textarea
                                    name="summary"
                                    value={formData.summary}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all"
                                    placeholder="Breve descripción de la lección..."
                                />
                            </label>

                            <label className="block">
                                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground block mb-2">
                                    Descripción completa
                                </span>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={6}
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all"
                                    placeholder="Contenido detallado de la lección..."
                                />
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-card border border-border rounded-2xl p-6">
                                <label className="block">
                                    <span className="text-xs font-black uppercase tracking-widest text-muted-foreground block mb-2">
                                        Tipo de contenido
                                    </span>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all"
                                    >
                                        <option value="video">Video</option>
                                        <option value="audio">Audio</option>
                                        <option value="text">Texto</option>
                                        <option value="pdf">PDF</option>
                                        <option value="quiz">Quiz</option>
                                    </select>
                                </label>
                            </div>

                            <div className="bg-card border border-border rounded-2xl p-6">
                                <label className="block">
                                    <span className="text-xs font-black uppercase tracking-widest text-muted-foreground block mb-2">
                                        Orden / Posición
                                    </span>
                                    <input
                                        type="number"
                                        name="order"
                                        value={formData.order}
                                        onChange={handleChange}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all"
                                        placeholder="1, 2, 3..."
                                    />
                                </label>
                            </div>

                            <div className="bg-card border border-border rounded-2xl p-6">
                                <label className="block">
                                    <span className="text-xs font-black uppercase tracking-widest text-muted-foreground block mb-2">
                                        Duración (minutos)
                                    </span>
                                    <input
                                        type="text"
                                        name="duration"
                                        value={formData.duration}
                                        onChange={handleChange}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all"
                                        placeholder="Ej: 15"
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="bg-card border border-border rounded-2xl p-6">
                            <label className="block">
                                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground block mb-2">
                                    URL del recurso (video, audio, PDF)
                                </span>
                                <input
                                    type="url"
                                    name="url"
                                    value={formData.url}
                                    onChange={handleChange}
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all"
                                    placeholder="https://ejemplo.com/recurso.mp4"
                                />
                            </label>
                        </div>

                        <div className="bg-card border border-border rounded-2xl p-6">
                            <label className="block">
                                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground block mb-2">
                                    URL de la imagen / miniatura
                                </span>
                                <input
                                    type="url"
                                    name="imageUrl"
                                    value={formData.imageUrl}
                                    onChange={handleChange}
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all"
                                    placeholder="https://ejemplo.com/imagen.jpg"
                                />
                            </label>

                            {formData.imageUrl && (
                                <div className="mt-4">
                                    <img
                                        src={formData.imageUrl}
                                        alt="Preview"
                                        className="w-32 h-32 object-cover rounded-xl border border-border"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="bg-card border border-border rounded-2xl p-6">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="isPublished"
                                    checked={formData.isPublished}
                                    onChange={handleChange}
                                    className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20"
                                />
                                <span className="text-sm font-medium text-foreground">Publicar este contenido</span>
                            </label>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 bg-primary text-white py-3.5 rounded-xl font-black text-[11px] uppercase tracking-widest hover:opacity-90 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <i className="bi bi-arrow-repeat animate-spin"></i>
                                        Guardando...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        <i className="bi bi-check-lg"></i>
                                        Guardar Cambios
                                    </span>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => router.push(`/dashboard/administrator/general-admin/courses/manage/view/${courseId}`)}
                                className="flex-1 bg-muted text-foreground py-3.5 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-border/60 transition-all"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}