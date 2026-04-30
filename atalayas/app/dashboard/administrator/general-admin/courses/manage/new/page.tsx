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
            const payload = {
                title: formData.title.trim(),
                isPublic: formData.isPublic,
                category: formData.category,
                companyId: formData.isPublic ? null : formData.selectedCompanyId,
                fileUrl: formData.file ? formData.file.name : null,
            };

            const resCourse = await fetch(API_ROUTES.COURSES.CREATE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            if (!resCourse.ok) throw new Error("Error al crear el curso");

            router.push('/dashboard/administrator/general-admin/courses/manage');
        } catch (err) {
            console.error(err);
            alert("Error al crear el curso.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-muted/30 font-sans text-foreground transition-colors duration-300">
            <Sidebar role="GENERAL_ADMIN" />

            <main className="flex-1 overflow-auto flex flex-col relative">
                <PageHeader
                    title="Nuevo Curso Público"
                    description="Los cursos creados aquí serán visibles para todas las empresas del sistema."
                    icon={<i className="bi bi-globe-americas"></i>}
                    backUrl="/dashboard/administrator/general-admin/courses/manage"
                />

                <div className="p-6 lg:p-12 flex-1 max-w-2xl mx-auto w-full">
                    <form onSubmit={handleSubmit} className="bg-card p-6 lg:p-10 rounded-[32px] border border-border/60 shadow-sm space-y-8 transition-colors duration-300">

                        {/* INFO BOX: CONFIGURACIÓN AUTOMÁTICA */}
                        <div className="p-5 bg-primary/5 border border-primary/20 rounded-[24px] flex items-center gap-4">
                            <div className="w-12 h-12 bg-card rounded-[18px] flex items-center justify-center text-primary shadow-sm text-xl">
                                <i className="bi bi-info-circle-fill"></i>
                            </div>
                            <div>
                                <h3 className="font-black text-[11px] uppercase tracking-widest text-primary">Configuración de Administrador</h3>
                                <p className="text-muted-foreground/70 text-[10px] font-bold uppercase tracking-wider mt-0.5">
                                    Visibilidad: Pública • Tipo: Onboarding (Básico)
                                </p>
                            </div>
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
                                className={`w-full px-5 py-4 rounded-2xl bg-background border outline-none font-bold text-foreground transition-all text-sm placeholder:text-muted-foreground/40 ${titleError ? 'border-destructive bg-destructive/5' : 'border-border focus:border-primary/40 focus:ring-4 focus:ring-primary/5'}`}
                                placeholder="Ej: Manual de Bienvenida Global..."
                            />
                            {titleError && (
                                <p className="text-destructive text-[10px] font-bold mt-2 ml-2 flex items-center gap-1 animate-in fade-in slide-in-from-left-1">
                                    <i className="bi bi-exclamation-circle-fill"></i> El título es obligatorio.
                                </p>
                            )}
                        </div>

                        {/* SUBIDA DE PDF */}
                        <div className="space-y-3">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                Material de Estudio (PDF)
                            </label>
                            <div className="relative h-28 w-full border-2 border-dashed border-border/60 rounded-[24px] flex items-center justify-center bg-muted/20 hover:bg-muted/40 transition-all cursor-pointer group overflow-hidden">
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={e => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                />
                                <div className="flex flex-col items-center gap-2 px-6">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${formData.file ? 'bg-green-500 text-white' : 'bg-card text-primary shadow-sm group-hover:scale-110'}`}>
                                        <i className={`bi ${formData.file ? 'bi-file-earmark-check' : 'bi-cloud-arrow-up'}`}></i>
                                    </div>
                                    <p className="font-bold text-xs text-foreground truncate max-w-[250px] text-center">
                                        {formData.file ? formData.file.name : 'Seleccionar o arrastrar PDF'}
                                    </p>
                                </div>
                            </div>
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
                                        <i className="bi bi-arrow-repeat animate-spin text-lg"></i> Procesando...
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