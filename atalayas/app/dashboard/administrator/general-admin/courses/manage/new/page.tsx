'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import PageHeader from '@/components/ui/pageHeader'; // Importación
import { API_ROUTES } from '@/lib/utils';

export default function NewCoursePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [companies, setCompanies] = useState<any[]>([]);

    const [companySearch, setCompanySearch] = useState('');
    const [isCompanyListOpen, setIsCompanyListOpen] = useState(false);
    const [companyError, setCompanyError] = useState(false);
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

        if (!formData.title.trim()) {
            setTitleError(true);
            hasError = true;
        }

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
                    title="Nuevo Curso"
                    description="Configura un nuevo curso global o específico para una empresa."
                    icon={<i className="bi bi-plus-circle"></i>}
                    backUrl="/dashboard/administrator/general-admin/courses/manage"
                />

                <div className="p-6 lg:p-12 flex-1 max-w-3xl mx-auto w-full">
                    <form onSubmit={handleSubmit} className="bg-card p-6 lg:p-10 rounded-[32px] border border-border/60 shadow-sm space-y-8 transition-colors duration-300">
                        {/* SECCIÓN VISIBILIDAD */}
                        <div className={`p-6 rounded-[24px] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-500 ${formData.isPublic ? 'bg-primary/5 border border-primary/20' : 'bg-muted/40 border border-border/60'}`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center shadow-sm text-xl transition-all duration-300 ${formData.isPublic ? 'bg-card text-primary' : 'bg-card text-muted-foreground/60 border border-border/60'}`}>
                                    <i className={`bi ${formData.isPublic ? 'bi-globe' : 'bi-lock-fill'}`}></i>
                                </div>
                                <div>
                                    <h3 className={`font-black text-[11px] uppercase tracking-widest ${formData.isPublic ? 'text-primary' : 'text-muted-foreground'}`}>
                                        {formData.isPublic ? 'Curso Público' : 'Curso Privado'}
                                    </h3>
                                    <p className="text-muted-foreground/60 text-[10px] font-bold uppercase tracking-wider mt-0.5">
                                        {formData.isPublic ? 'Accesible para todas las empresas' : 'Solo visible para la empresa seleccionada'}
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
                                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors outline-none cursor-pointer shrink-0 ${formData.isPublic ? 'bg-primary shadow-[0_0_15px_-3px_rgba(var(--primary),0.5)]' : 'bg-muted-foreground/20'}`}
                            >
                                <span className={`inline-block h-5 w-5 transform rounded-full bg-card shadow-sm transition-transform duration-300 ${formData.isPublic ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        {/* SELECTOR DE EMPRESA */}
                        {!formData.isPublic && (
                            <div className="animate-in fade-in slide-in-from-top-4 duration-500" ref={companyRef}>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 ml-1 text-center sm:text-left">Empresa Propietaria</label>
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
                                        className={`w-full px-5 py-4 rounded-2xl bg-background border outline-none font-bold text-foreground transition-all text-sm placeholder:text-muted-foreground/40 ${companyError ? 'border-destructive bg-destructive/5' : 'border-border focus:border-primary/40 focus:ring-4 focus:ring-primary/5'}`}
                                    />
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
                                                <div className="px-5 py-8 text-center text-muted-foreground text-[10px] font-black uppercase tracking-widest italic">No se encontraron empresas</div>
                                            )}
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
                                className={`w-full px-5 py-4 rounded-2xl bg-background border outline-none font-bold text-foreground transition-all text-sm placeholder:text-muted-foreground/40 ${titleError ? 'border-destructive bg-destructive/5' : 'border-border focus:border-primary/40 focus:ring-4 focus:ring-primary/5'}`}
                                placeholder="Ej: Prevención de Riesgos..."
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

                        {/* ARCHIVO PDF */}
                        <div className="space-y-4">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center sm:text-left">Material Base (Opcional)</label>
                            <div className="relative h-20 w-full border-2 border-dashed border-border/60 rounded-[24px] flex items-center justify-center bg-muted/20 hover:bg-muted/40 transition-all cursor-pointer group overflow-hidden">
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={e => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                />
                                <div className="flex items-center gap-3 px-6">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${formData.file ? 'bg-green-500 text-white' : 'bg-card text-primary shadow-sm group-hover:scale-110'}`}>
                                        <i className={`bi ${formData.file ? 'bi-check2' : 'bi-file-earmark-pdf'}`}></i>
                                    </div>
                                    <p className="font-bold text-xs text-foreground truncate max-w-[200px] sm:max-w-md">
                                        {formData.file ? formData.file.name : 'Subir documento PDF inicial'}
                                    </p>
                                </div>
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
                                    <i className="bi bi-arrow-repeat animate-spin text-lg"></i> Procesando...
                                </span>
                            ) : (
                                'Crear Curso Maestro'
                            )}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}