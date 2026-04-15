'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import { API_ROUTES } from '@/lib/utils';

export default function EditCoursePage() {
    const router = useRouter();
    const params = useParams();
    const courseId = params.id;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [companies, setCompanies] = useState<any[]>([]);

    // Estados para el Buscador de Empresas
    const [companySearch, setCompanySearch] = useState('');
    const [isCompanyListOpen, setIsCompanyListOpen] = useState(false);
    const [companyError, setCompanyError] = useState(false);

    // NUEVO: Estado para el error del título
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

        // VALIDACIÓN DE TÍTULO
        if (!formData.title.trim()) {
            setTitleError(true);
            hasError = true;
        }

        // VALIDACIÓN DE EMPRESA (Si es privado)
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
            <Sidebar role="GENERAL_ADMIN" />

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
                        <p className="text-muted-foreground mt-2 text-base">
                            {formData.isPublic
                                ? 'Gestionando contenido maestro disponible para todas las empresas.'
                                : 'Modifica los detalles del contenido para la empresa seleccionada.'}
                        </p>
                    </header>

                    <form onSubmit={handleSubmit} className="bg-card p-6 lg:p-10 rounded-3xl border border-border shadow-sm space-y-8">

                        {/* 1. SECCIÓN EMPRESA */}
                        {!formData.isPublic ? (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300" ref={companyRef}>
                                <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2 ml-1">Empresa Propietaria</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        className={`w-full px-5 py-4 rounded-2xl bg-background border outline-none font-bold text-foreground transition-all text-sm placeholder:text-muted-foreground/50 ${companyError ? 'border-destructive bg-destructive/5' : 'border-input focus:border-primary focus:ring-2 focus:ring-ring'}`}
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
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                        <i className={`bi ${isCompanyListOpen ? 'bi-search' : 'bi-building'}`}></i>
                                    </div>

                                    {companyError && (
                                        <p className="text-destructive text-xs font-bold mt-2 ml-1 flex items-center gap-1">
                                            <i className="bi bi-exclamation-triangle-fill"></i> Debes seleccionar una empresa de la lista desplegable
                                        </p>
                                    )}

                                    {isCompanyListOpen && (
                                        <div className="absolute z-20 w-full mt-2 bg-card border border-border rounded-2xl shadow-xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                                            {filteredCompanies.length > 0 ? (
                                                filteredCompanies.map(comp => (
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
                                                ))
                                            ) : (
                                                <div className="px-5 py-8 text-center text-muted-foreground text-sm italic">No se encontraron empresas</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 bg-primary/10 border border-primary/20 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-4 animate-in zoom-in-95 duration-500">
                                <div className="w-12 h-12 bg-card rounded-xl flex items-center justify-center shadow-sm text-primary text-xl shrink-0">
                                    <i className="bi bi-globe"></i>
                                </div>
                                <div>
                                    <h3 className="text-primary font-bold text-sm uppercase tracking-wider mb-0.5">Curso Maestro / Público</h3>
                                    <p className="text-primary/70 text-xs font-medium">Contenido universal accesible para todas las organizaciones del polígono.</p>
                                </div>
                            </div>
                        )}

                        {/* 2. TÍTULO DEL CURSO (CON VALIDACIÓN) */}
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
                                <p className="text-destructive text-xs font-bold mt-2 ml-1 flex items-center gap-1">
                                    <i className="bi bi-exclamation-triangle-fill"></i> El nombre del curso es obligatorio
                                </p>
                            )}
                        </div>

                        {/* 3. CATEGORÍA */}
                        <div className="space-y-3">
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

                        {/* 4. ARCHIVO PDF */}
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
                                    <i className={`bi ${formData.file ? 'bi-file-earmark-check-fill text-green-500' : 'bi-file-earmark-pdf text-primary'} text-lg mr-2 group-hover:scale-110 transition-transform`}></i>
                                    {formData.file ? formData.file.name : 'Sustituir documento PDF base'}
                                </p>
                            </div>
                        </div>

                        {/* 5. BOTÓN SUBMIT */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-secondary text-secondary-foreground rounded-2xl font-bold text-base hover:opacity-90 transition-opacity active:scale-[0.98] cursor-pointer shadow-sm disabled:opacity-60 disabled:cursor-not-allowed mt-4"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <i className="bi bi-arrow-repeat animate-spin"></i> Guardando...
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