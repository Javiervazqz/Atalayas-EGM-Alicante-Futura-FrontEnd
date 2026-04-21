'use client';

import { useEffect, useState, useRef } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import PageHeader from '@/components/ui/pageHeader';
import Link from 'next/link';
import { API_ROUTES } from '@/lib/utils';

export default function GlobalManageCourses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados de Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'BASICO' | 'ESPECIALIZADO'>('ALL');
  const [showOnlyPublic, setShowOnlyPublic] = useState(false);

  // Estados para el Selector de Empresas
  const [companySearch, setCompanySearch] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [isCompanyListOpen, setIsCompanyListOpen] = useState(false);
  const companyRef = useRef<HTMLDivElement>(null);

  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchInitialData();

    const handleClickOutside = (event: MouseEvent) => {
      if (companyRef.current && !companyRef.current.contains(event.target as Node)) {
        setIsCompanyListOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [resCourses, resCompanies] = await Promise.all([
        fetch(API_ROUTES.COURSES.GET_ALL, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(API_ROUTES.COMPANIES.GET_ALL, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const dataCourses = await resCourses.json();
      const dataCompanies = await resCompanies.json();
      setCourses(Array.isArray(dataCourses) ? dataCourses : []);
      setCompanies(Array.isArray(dataCompanies) ? dataCompanies : []);
    } catch (err) {
      console.error("Error cargando datos:", err);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!courseToDelete) return;
    try {
      const token = localStorage.getItem('token');
      const baseUrl = API_ROUTES.COURSES.GET_ALL.replace(/\/$/, "");
      const res = await fetch(`${baseUrl}/${courseToDelete}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setCourses(prev => prev.filter(c => c.id !== courseToDelete));
        setCourseToDelete(null);
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert("Error al eliminar: " + (errorData.message || "No se pudo eliminar el curso"));
      }
    } catch (err) {
      alert("Error de conexión al intentar eliminar.");
    }
  };

  const getCompanyName = (course: any) => {
    if (course.isPublic) return 'Global / Público';
    if (course.company?.name) return course.company.name;
    const company = companies.find(c => c.id === course.companyId);
    return company ? company.name : 'Sin empresa';
  };

  const filtered = courses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
    let matchesCategory = true;
    if (categoryFilter === 'BASICO') matchesCategory = c.category?.toUpperCase() !== 'ESPECIALIZADO';
    if (categoryFilter === 'ESPECIALIZADO') matchesCategory = c.category?.toUpperCase() === 'ESPECIALIZADO';
    const matchesPublic = showOnlyPublic ? (c.isPublic === true || c.isPublic === 1) : true;
    const matchesCompany = selectedCompanyId ? (c.companyId === selectedCompanyId) : true;
    return matchesSearch && matchesCategory && matchesPublic && matchesCompany;
  });

  const filteredCompanies = companies.filter(comp =>
    comp.name.toLowerCase().includes(companySearch.toLowerCase())
  );

  if (!mounted) return <div className="min-h-screen bg-background transition-colors duration-300" />;

  return (
    <div className="flex min-h-screen bg-muted/30 relative font-sans text-foreground transition-colors duration-300">
      <Sidebar role="GENERAL_ADMIN" />

      <main className="flex-1 overflow-auto flex flex-col relative">
        {/* ── HEADER CON BOTÓN VOLVER ── */}
        <PageHeader 
          title="Gestión Global de Cursos"
          description={`Control de contenidos para ${companies.length} empresas.`}
          icon={<i className="bi bi-journal-bookmark"></i>}
          backUrl="/dashboard/administrator/general-admin/courses" // Enlace de retorno al catálogo
          action={
            <Link
              href="/dashboard/administrator/general-admin/courses/manage/new"
              className="bg-secondary text-white px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-sm hover:shadow-md flex items-center gap-2"
            >
              <i className="bi bi-plus-lg"></i> Nuevo curso
            </Link>
          }
        />

        <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto w-full">
          
          {/* BARRA DE FILTROS */}
          <div className="bg-card p-6 lg:p-8 rounded-[24px] border border-border/60 shadow-sm flex flex-col gap-6 transition-colors duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* BUSCAR POR TÍTULO */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Buscar Curso</label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-primary/40 focus:ring-4 focus:ring-primary/5 outline-none font-bold text-foreground transition-all placeholder:text-muted-foreground/50"
                    placeholder="Título del curso..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <i className="bi bi-search absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/60"></i>
                </div>
              </div>

              {/* FILTRAR POR EMPRESA */}
              <div className="flex flex-col gap-2" ref={companyRef}>
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Filtrar por Empresa</label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-primary/40 focus:ring-4 focus:ring-primary/5 outline-none font-bold text-foreground transition-all placeholder:text-muted-foreground/50"
                    placeholder="Escribe nombre de empresa..."
                    value={companySearch}
                    onChange={(e) => {
                      setCompanySearch(e.target.value);
                      setIsCompanyListOpen(true);
                      if (e.target.value === '') setSelectedCompanyId(null);
                    }}
                    onFocus={() => setIsCompanyListOpen(true)}
                  />
                  {isCompanyListOpen && (
                    <div className="absolute z-20 w-full mt-2 bg-card border border-border rounded-2xl shadow-xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                      <div
                        className="px-4 py-3 hover:bg-muted cursor-pointer text-[10px] font-black text-primary border-b border-border transition-colors uppercase tracking-widest"
                        onClick={() => {
                          setSelectedCompanyId(null);
                          setCompanySearch('');
                          setIsCompanyListOpen(false);
                        }}
                      >
                        Mostrar todas las empresas
                      </div>
                      {filteredCompanies.map(comp => (
                        <div
                          key={comp.id}
                          className={`px-4 py-3 hover:bg-muted cursor-pointer text-sm transition-colors border-b border-border/50 last:border-0 ${selectedCompanyId === comp.id ? 'bg-primary/5 text-primary font-bold' : 'text-foreground font-medium'}`}
                          onClick={() => {
                            setSelectedCompanyId(comp.id);
                            setCompanySearch(comp.name);
                            setIsCompanyListOpen(false);
                          }}
                        >
                          {comp.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* CATEGORÍA Y VISIBILIDAD */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Categoría y Visibilidad</label>
                <div className="flex gap-2 h-full">
                  <div className="bg-background border border-border p-1 rounded-xl flex flex-1 items-center">
                    {(['ALL', 'BASICO', 'ESPECIALIZADO'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setCategoryFilter(t)}
                        className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${categoryFilter === t ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        {t === 'ALL' ? 'Todos' : t === 'BASICO' ? 'Básico' : 'Espec.'}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowOnlyPublic(!showOnlyPublic)}
                    className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all ${showOnlyPublic ? 'bg-primary border-primary text-white shadow-sm' : 'bg-background border-border text-muted-foreground hover:bg-muted'}`}
                  >
                    {showOnlyPublic ? '✓ Públicos' : 'Públicos'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* TABLA DE RESULTADOS */}
          <div className="bg-card rounded-[24px] border border-border/60 overflow-hidden shadow-sm transition-colors duration-300">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/30 border-b border-border/60">
                    <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest w-1/3">Curso</th>
                    <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Empresa / Visibilidad</th>
                    <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Categoría</th>
                    <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filtered.map((course) => (
                    <tr key={course.id} className="group hover:bg-muted/20 transition-colors">
                      <td className="px-8 py-5 font-bold text-sm text-foreground group-hover:text-primary transition-colors">{course.title}</td>
                      <td className="px-8 py-5 text-center">
                        <span className={`text-[9px] font-black px-3 py-1 rounded-lg tracking-wider uppercase border ${course.isPublic ? 'bg-primary/5 text-primary border-primary/10' : 'bg-muted text-muted-foreground border-border/50'}`}>
                          {getCompanyName(course)}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className={`text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-wider border ${course.category?.toUpperCase() === 'ESPECIALIZADO' ? 'bg-secondary/5 text-secondary border-secondary/10' : 'bg-primary/5 text-primary border-primary/10'}`}>
                          {course.category?.toUpperCase() === 'ESPECIALIZADO' ? 'Especialización' : 'Onboarding'}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/dashboard/administrator/general-admin/courses/manage/${course.id}`} className="w-9 h-9 flex items-center justify-center bg-muted/50 hover:bg-primary/10 rounded-xl transition-all group/btn border border-border/40">
                            <i className="bi bi-pencil-square text-primary group-hover/btn:scale-110 transition-transform"></i>
                          </Link>
                          <button onClick={() => setCourseToDelete(course.id)} className="w-9 h-9 flex items-center justify-center bg-muted/50 hover:bg-destructive/10 rounded-xl transition-all group/btn cursor-pointer border border-border/40">
                            <i className="bi bi-trash3 text-destructive/60 group-hover/btn:text-destructive transition-colors"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && !loading && (
              <div className="py-24 text-center flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center text-muted-foreground/30 text-3xl mb-2 shadow-inner">
                  <i className="bi bi-search"></i>
                </div>
                <p className="text-foreground font-black text-xs uppercase tracking-widest">No se encontraron cursos</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setCategoryFilter('ALL');
                    setShowOnlyPublic(false);
                    setSelectedCompanyId(null);
                    setCompanySearch('');
                  }}
                  className="text-secondary font-bold text-[10px] uppercase tracking-widest hover:underline mt-4"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MODAL DE CONFIRMACIÓN (DARK MODE READY) */}
      {courseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-card w-full max-w-sm rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-300 text-center border border-border">
            <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl shadow-sm">
              <i className="bi bi-exclamation-triangle"></i>
            </div>
            <h3 className="text-xl font-black text-foreground mb-2 tracking-tight uppercase">¿Eliminar curso?</h3>
            <p className="text-muted-foreground text-xs font-medium mb-8 leading-relaxed px-4">Esta acción no se puede deshacer. El curso y todas sus lecciones se borrarán de forma permanente.</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={confirmDelete}
                className="w-full py-3.5 bg-destructive text-white rounded-xl font-black text-[11px] uppercase tracking-widest hover:opacity-95 transition-all shadow-md active:scale-95"
              >
                Sí, eliminar
              </button>
              <button
                onClick={() => setCourseToDelete(null)}
                className="w-full py-3.5 bg-muted text-foreground rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-border/60 transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}