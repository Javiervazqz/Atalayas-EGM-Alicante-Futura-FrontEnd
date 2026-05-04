'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import PageHeader from '@/components/ui/pageHeader';
import { API_ROUTES } from '@/lib/utils';

export default function NewCoursePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [companies, setCompanies] = useState<any[]>([]);

    // Estados para el Selector de Empresas
    const [companySearch, setCompanySearch] = useState('');
    const [isCompanyListOpen, setIsCompanyListOpen] = useState(false);
    const [companyError, setCompanyError] = useState(false);

    // NUEVO: Estado para el error del título
    const [titleError, setTitleError] = useState(false);

    const companyRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState({
        title: '',
        isPublic: false,
        category: 'BASICO' as 'BASICO' | 'ESPECIALIZADO',
        selectedCompanyId: null as string | null,
        file: null as File | null,
    });

    useEffect(() => {
        fetchCompanies();
        const handleClickOutside = (event: MouseEvent) => {
            if (companyRef.current && !companyRef.current.contains(event.target as Node)) {
                setIsCompanyListOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchCompanies = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(API_ROUTES.COMPANIES.GET_ALL, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setCompanies(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error cargando empresas:", err);
        }
    };

    const filteredCompanies = companies.filter(comp =>
        comp.name.toLowerCase().includes(companySearch.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        let hasError = false;

        // VALIDACIÓN DE TÍTULO
        if (!formData.title.trim()) {
            setTitleError(true);
            hasError = true;
        }

        // VALIDACIÓN DE EMPRESA (Si es privado)
        if (!formData.isPublic && !formData.selectedCompanyId) {
            setCompanyError(true);
            hasError = true;
        }

        if (hasError) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
<<<<<<< enrollment
            const payload = {
                title: formData.title.trim(),
                isPublic: formData.isPublic,
                category: formData.category,
                companyId: formData.isPublic ? null : formData.selectedCompanyId,
                fileUrl: formData.file ? formData.file.name : null,
=======

            if (!token) {
                throw new Error("No hay sesión iniciada");
            }
            if (!token) throw new Error("No hay sesión iniciada");

            // Payload simplificado según requerimiento: Siempre público y Onboarding
            const payload = {
                title: formData.title.trim(),
                isPublic: true,
                category: 'BASICO',
                companyId: null, // General admin no tiene companyId o se envía null
>>>>>>> dev
            };

            console.log("Enviando payload:", payload);
            console.log("URL:", API_ROUTES.COURSES.CREATE);

            // 1. Usamos FormData para poder enviar el archivo y los campos de texto juntos
            const data = new FormData();
            data.append('title', formData.title.trim());
            data.append('isPublic', 'true'); // FormData envía strings
            data.append('category', 'BASICO');
            
            // Si hay un archivo, lo adjuntamos. 
            // IMPORTANTE: El nombre 'file' debe coincidir con lo que espera @UploadedFile() en NestJS
            if (formData.file) {
                data.append('file', formData.file);
            }

            // 2. Realizamos una única petición POST
            // NOTA: No pongas 'Content-Type': 'application/json', el navegador lo pondrá como multipart/form-data automáticamente
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
                    description="Crea cursos visibles para todas las empresas."
                    icon={<i className="bi bi-globe-americas"></i>}
                    backUrl="/dashboard/administrator/general-admin/courses/manage"
                />

                <div className="p-6 lg:p-12 flex-1 max-w-2xl mx-auto w-full">
                    <form onSubmit={handleSubmit} className="bg-card p-6 lg:p-10 rounded-[32px] border border-border/60 shadow-sm space-y-8">

                        {/* TÍTULO */}
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
                                className={`w-full px-5 py-4 rounded-2xl bg-background border outline-none font-bold text-sm ${titleError ? 'border-destructive' : 'border-border focus:border-primary/40'}`}
                                placeholder="Ej: Manual de Bienvenida Global..."
                            />
                        </div>

                        {/* SUBIDA DE IMAGEN (FILE) */}
                        <div className="space-y-3">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                Imagen de Portada
                            </label>
                            <div className="relative h-32 w-full border-2 border-dashed border-border/60 rounded-[24px] flex items-center justify-center bg-muted/20 hover:bg-muted/40 transition-all cursor-pointer group">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                />
                                <div className="flex flex-col items-center gap-2 px-6">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all ${formData.file ? 'bg-green-500 text-white' : 'bg-card text-primary shadow-sm'}`}>
                                        <i className={`bi ${formData.file ? 'bi-image-fill' : 'bi-camera-fill'}`}></i>
                                    </div>
                                    <p className="font-bold text-xs text-foreground truncate max-w-[250px]">
                                        {formData.file ? formData.file.name : 'Subir imagen de portada'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* BOTÓN SUBMIT */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-secondary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-95 transition-all disabled:opacity-50"
                            >
                                {loading ? 'Subiendo...' : 'Publicar Curso Global'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}