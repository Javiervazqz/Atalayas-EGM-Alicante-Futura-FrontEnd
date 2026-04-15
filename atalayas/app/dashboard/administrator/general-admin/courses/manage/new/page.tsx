'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
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
        <div className="flex min-h-screen bg-background font-sans">
            <Sidebar role="GENERAL_ADMIN" />

            <main className="flex-1 p-6 lg:p-12 overflow-y-auto">
                <div className="max-w-2xl mx-auto">
                    <header className="mb-10">
                        <button
                            onClick={() => router.back()}
                            className="text-secondary font-bold text-sm mb-6 flex items-center gap-2 hover:opacity-80 transition-opacity bg-transparent border-none cursor-pointer"
                        >
                            <i className="bi bi-chevron-left"></i> Volver
                        </button>
                        <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">Nuevo Curso</h1>
                        <p className="text-muted-foreground mt-2 text-base">Configura un nuevo curso global o específico para una empresa.</p>
                    </header>

                    <form onSubmit={handleSubmit} className="bg-card p-6 lg:p-10 rounded-3xl border border-border shadow-sm space-y-8">

                        {/* SECCIÓN VISIBILIDAD */}
                        <div className={`p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 ${formData.isPublic ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50 border border-border'}`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm text-xl transition-colors ${formData.isPublic ? 'bg-card text-primary' : 'bg-card text-muted-foreground border border-border'}`}>
                                    <i className={`bi ${formData.isPublic ? 'bi-globe' : 'bi-lock-fill'}`}></i>
                                </div>
                                <div>
                                    <h3 className={`font-bold text-sm uppercase tracking-wider ${formData.isPublic ? 'text-primary' : 'text-muted-foreground'}`}>
                                        {formData.isPublic ? 'Curso Público' : 'Curso Privado'}
                                    </h3>
                                    <p className="text-muted-foreground text-xs font-medium mt-0.5">
                                        {formData.isPublic ? 'Accesible para todas las empresas.' : 'Solo visible para la empresa seleccionada.'}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setFormData({ ...formData, isPublic: !formData.isPublic, selectedCompanyId: null } as any);
                                    setCompanySearch('');
                                    setCompanyError(false);
                                }}
                                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary cursor-pointer shrink-0 ${formData.isPublic ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                            >
                                <span className={`inline-block h-5 w-5 transform rounded-full bg-card shadow-sm transition-transform duration-200 ${formData.isPublic ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        {/* SELECTOR DE EMPRESA */}
                        {!formData.isPublic && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300" ref={companyRef}>
                                <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2 ml-1">Empresa Propietaria</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Escribe para buscar empresa..."
                                        value={companySearch}
                                        onFocus={() => setIsCompanyListOpen(true)}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setCompanySearch(val);
                                            setIsCompanyListOpen(true);
                                            setCompanyError(false);
                                            const match = companies.find(c => c.name.toLowerCase() === val.toLowerCase());
                                            setFormData(prev => ({ ...prev, selectedCompanyId: match ? match.id : null }));
                                        }}
                                        className={`w-full px-5 py-4 rounded-2xl bg-background border outline-none font-bold text-foreground transition-all text-sm placeholder:text-muted-foreground/50 ${companyError ? 'border-destructive bg-destructive/5' : 'border-input focus:border-primary focus:ring-2 focus:ring-ring'}`}
                                    />
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                        <i className={`bi ${isCompanyListOpen ? 'bi-search' : 'bi-building'}`}></i>
                                    </div>

                                    {companyError && (
                                        <p className="text-destructive text-xs font-bold mt-2 ml-1 flex items-center gap-1">
                                            <i className="bi bi-exclamation-triangle-fill"></i> Debes seleccionar una empresa de la lista
                                        </p>
                                    )}

                                    {isCompanyListOpen && (
                                        <div className="absolute z-20 w-full mt-2 bg-card border border-border rounded-2xl shadow-xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                                            {filteredCompanies.length > 0 ? (
                                                filteredCompanies.map(comp => (
                                                    <div
                                                        key={comp.id}
                                                        className={`px-5 py-3.5 hover:bg-muted cursor-pointer text-sm transition-colors border-b border-border/50 last:border-0 ${formData.selectedCompanyId === comp.id ? 'text-primary bg-primary/5 font-bold' : 'text-foreground font-medium'}`}
                                                        onClick={() => {
                                                            setFormData(prev => ({ ...prev, selectedCompanyId: comp.id }));
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
                        )}

                        {/* NOMBRE DEL CURSO (CON VALIDACIÓN DE ERROR) */}
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

                        {/* CATEGORÍA */}
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

                        {/* ARCHIVO PDF */}
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
                                    {formData.file ? formData.file.name : 'Subir documento PDF inicial'}
                                </p>
                            </div>
                        </div>

                        {/* BOTÓN SUBMIT */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-secondary text-secondary-foreground rounded-2xl font-bold text-base hover:opacity-90 transition-opacity active:scale-[0.98] cursor-pointer shadow-sm disabled:opacity-60 disabled:cursor-not-allowed mt-4"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <i className="bi bi-arrow-repeat animate-spin"></i> Creando...
                                </span>
                            ) : (
                                'Crear Curso'
                            )}
                        </button>

                    </form>
                </div>
            </main>
        </div>
    );
}