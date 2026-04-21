'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import PageHeader from '@/components/ui/pageHeader'; // Importación
import { API_ROUTES } from '@/lib/utils';

export default function EditCoursePage() {
    const router = useRouter();
    const params = useParams();
    const courseId = params.id;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [companies, setCompanies] = useState<any[]>([]);

    const [companySearch, setCompanySearch] = useState('');
    const [isCompanyListOpen, setIsCompanyListOpen] = useState(false);
    const [companyError, setCompanyError] = useState(false);
    const [titleError, setTitleError] = useState(false);

    const companyRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState({
        title: '',
        isPublic: false,
        category: 'BASICO',
        companyId: '',
        file: null as File | null
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const baseUrl = API_ROUTES.COURSES.GET_ALL.replace(/\/$/, "");

                const [resCourse, resCompanies] = await Promise.all([
                    fetch(`${baseUrl}/${courseId}`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch(API_ROUTES.COMPANIES.GET_ALL, { headers: { 'Authorization': `Bearer ${token}` } })
                ]);

                const courseData = await resCourse.json();
                const companiesData = await resCompanies.json();
                const allCompanies = Array.isArray(companiesData) ? companiesData : [];

                setCompanies(allCompanies);

                if (resCourse.ok) {
                    setFormData({
                        title: courseData.title || '',
                        isPublic: courseData.isPublic || false,
                        category: courseData.category?.toUpperCase() === 'ESPECIALIZADO' ? 'ESPECIALIZADO' : 'BASICO',
                        companyId: courseData.companyId || '',
                        file: null
                    });

                    if (courseData.companyId) {
                        const currentComp = allCompanies.find(c => c.id === courseData.companyId);
                        if (currentComp) setCompanySearch(currentComp.name);
                    }
                } else {
                    router.push('/dashboard/administrator/general-admin/courses/manage');
                }
            } catch (err) {
                console.error("Error al cargar datos:", err);
            } finally {
                setFetching(false);
            }
        };

        if (courseId) fetchData();

        const handleClickOutside = (event: MouseEvent) => {
            if (companyRef.current && !companyRef.current.contains(event.target as Node)) {
                setIsCompanyListOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [courseId, router]);

    const filteredCompanies = companies.filter(comp =>
        comp.name.toLowerCase().includes(companySearch.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        let hasError = false;

        if (!formData.title.trim()) {
            setTitleError(true);
            hasError = true;
        }

        if (!formData.isPublic && !formData.companyId) {
            setCompanyError(true);
            hasError = true;
        }

        if (hasError) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const baseUrl = API_ROUTES.COURSES.GET_ALL.replace(/\/$/, "");

            const payload = {
                title: formData.title.trim(),
                isPublic: formData.isPublic,
                category: formData.category,
                companyId: formData.isPublic ? null : formData.companyId,
                fileUrl: formData.file ? formData.file.name : null,
            };

            const res = await fetch(`${baseUrl}/${courseId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                router.push('/dashboard/administrator/general-admin/courses/manage');
            } else {
                setLoading(false);
            }
        } catch (err) {
            setLoading(false);
        }
    };

    if (fetching) return (
        <div className="flex min-h-screen bg-muted/30 items-center justify-center font-sans">
            <div className="font-black text-primary animate-pulse text-xs flex flex-col items-center gap-4 uppercase tracking-[0.2em]">
               <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
               Sincronizando datos...
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-muted/30 font-sans text-foreground transition-colors duration-300">
            <Sidebar role="GENERAL_ADMIN" />

            <main className="flex-1 overflow-auto flex flex-col relative">
                <PageHeader 
                    title="Editar Curso"
                    description={formData.isPublic 
                        ? 'Gestionando contenido maestro disponible para todas las empresas.' 
                        : 'Modifica los detalles del contenido para la empresa seleccionada.'
                    }
                    icon={<i className="bi bi-pencil-square"></i>}
                    backUrl="/dashboard/administrator/general-admin/courses/manage"
                />

                <div className="p-6 lg:p-12 flex-1 max-w-3xl mx-auto w-full">
                    <form onSubmit={handleSubmit} className="bg-card p-6 lg:p-10 rounded-[32px] border border-border/60 shadow-sm space-y-8 transition-colors duration-300">

                        {/* INFO VISIBILIDAD (Solo lectura en edición) */}
                        <div className={`p-6 rounded-[24px] border flex items-center gap-4 transition-all duration-500 ${formData.isPublic ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-muted/40 border-border/60 text-muted-foreground'}`}>
                            <div className="w-12 h-12 bg-card rounded-[18px] flex items-center justify-center text-xl shadow-sm border border-border/40 shrink-0">
                                <i className={`bi ${formData.isPublic ? 'bi-globe' : 'bi-lock-fill'}`}></i>
                            </div>
                            <div>
                                <h3 className="font-black text-[11px] uppercase tracking-widest mb-0.5">
                                    {formData.isPublic ? 'Contenido Público' : 'Contenido Privado'}
                                </h3>
                                <p className="opacity-60 text-[10px] font-bold uppercase tracking-wider">La visibilidad base no puede cambiarse tras la creación.</p>
                            </div>
                        </div>

                        {/* SELECTOR DE EMPRESA */}
                        {!formData.isPublic && (
                            <div className="animate-in fade-in slide-in-from-top-4 duration-500" ref={companyRef}>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 ml-1 text-center sm:text-left">Empresa Propietaria</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        className={`w-full px-5 py-4 rounded-2xl bg-background border outline-none font-bold text-foreground transition-all text-sm placeholder:text-muted-foreground/40 ${companyError ? 'border-destructive bg-destructive/5' : 'border-border focus:border-primary/40 focus:ring-4 focus:ring-primary/5'}`}
                                        placeholder="Escribe para buscar empresa..."
                                        value={companySearch}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setCompanySearch(val);
                                            setIsCompanyListOpen(true);
                                            setCompanyError(false);
                                            const match = companies.find(c => c.name.toLowerCase() === val.toLowerCase());
                                            setFormData(prev => ({ ...prev, companyId: match ? match.id : '' }));
                                        }}
                                        onFocus={() => setIsCompanyListOpen(true)}
                                    />
                                    {isCompanyListOpen && (
                                        <div className="absolute z-20 w-full mt-2 bg-card border border-border rounded-2xl shadow-xl max-h-60 overflow-y-auto">
                                            {filteredCompanies.map(comp => (
                                                <div
                                                    key={comp.id}
                                                    className={`px-5 py-3.5 hover:bg-muted cursor-pointer text-sm transition-colors border-b border-border/50 last:border-0 ${formData.companyId === comp.id ? 'text-primary bg-primary/5 font-bold' : 'text-foreground font-medium'}`}
                                                    onClick={() => {
                                                        setFormData(prev => ({ ...prev, companyId: comp.id }));
                                                        setCompanySearch(comp.name);
                                                        setIsCompanyListOpen(false);
                                                        setCompanyError(false);
                                                    }}
                                                >
                                                    {comp.name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* NOMBRE DEL CURSO */}
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 ml-1 text-center sm:text-left">Nombre del Curso</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={e => {
                                    setFormData({ ...formData, title: e.target.value });
                                    if (titleError) setTitleError(false);
                                }}
                                className={`w-full px-5 py-4 rounded-2xl bg-background border outline-none font-bold text-foreground transition-all text-sm ${titleError ? 'border-destructive bg-destructive/5' : 'border-border focus:border-primary/40 focus:ring-4 focus:ring-primary/5'}`}
                            />
                        </div>

                        {/* TIPO DE FORMACIÓN */}
                        <div className="space-y-4">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center sm:text-left">Tipo de Formación</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, category: 'BASICO' })}
                                    className={`p-5 rounded-2xl border-2 flex items-center justify-center gap-3 cursor-pointer transition-all font-black text-[11px] uppercase tracking-widest ${formData.category === 'BASICO' ? 'border-primary bg-primary/5 text-primary shadow-sm' : 'border-border/60 bg-muted/20 text-muted-foreground hover:border-primary/40'}`}
                                >
                                    <i className="bi bi-book text-lg"></i> Onboarding
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, category: 'ESPECIALIZADO' })}
                                    className={`p-5 rounded-2xl border-2 flex items-center justify-center gap-3 cursor-pointer transition-all font-black text-[11px] uppercase tracking-widest ${formData.category === 'ESPECIALIZADO' ? 'border-secondary bg-secondary/5 text-secondary shadow-sm' : 'border-border/60 bg-muted/20 text-muted-foreground hover:border-secondary/40'}`}
                                >
                                    <i className="bi bi-mortarboard text-lg"></i> Especialización
                                </button>
                            </div>
                        </div>

                        {/* BOTÓN SUBMIT */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4.5 bg-secondary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-95 transition-all active:scale-[0.98] shadow-md hover:shadow-secondary/20 disabled:opacity-50 mt-6"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-3">
                                    <i className="bi bi-arrow-repeat animate-spin text-lg"></i> Guardando...
                                </span>
                            ) : (
                                'Guardar Cambios'
                            )}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}