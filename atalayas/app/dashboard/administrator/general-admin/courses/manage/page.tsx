'use client';

import { useEffect, useState, useRef } from 'react';
import Sidebar from '@/components/ui/Sidebar';
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

  if (!mounted) return <div className="min-h-screen bg-background" />;

  return (
    <div className="flex min-h-screen bg-background relative font-sans">
      <Sidebar role="GENERAL_ADMIN" />

      <main className="flex-1 h-screen overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 lg:py-12">

          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">Gestión Global de Cursos</h1>
              <p className="text-muted-foreground mt-2 text-base">Control de contenidos para {companies.length} empresas.</p>
            </div>
            <Link
              href="/dashboard/administrator/general-admin/courses/manage/new"
              className="bg-secondary text-secondary-foreground w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity shadow-sm text-center flex justify-center items-center gap-2"
            >
              <i className="bi bi-plus-lg"></i> Nuevo curso
            </Link>
          </div>

          {/* BARRA DE FILTROS */}
          <div className="bg-card p-6 lg:p-8 rounded-3xl border border-border shadow-sm mb-10 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* BUSCAR POR TÍTULO */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black text-muted-foreground uppercase tracking-widest ml-1">Buscar Curso</label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-ring focus:border-primary outline-none font-medium text-foreground transition-all"
                    placeholder="Título del curso..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <i className="bi bi-search absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"></i>
                </div>
              </div>

              {/* FILTRAR POR EMPRESA */}
              <div className="flex flex-col gap-2" ref={companyRef}>
                <label className="text-[11px] font-black text-muted-foreground uppercase tracking-widest ml-1">Filtrar por Empresa</label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-ring focus:border-primary outline-none font-medium text-foreground transition-all"
                    placeholder="Escribe nombre de empresa..."
                    value={companySearch}
                    onChange={(e) => {
                      setCompanySearch(e.target.value);
                      setIsCompanyListOpen(true);
                      if (e.target.value === '') setSelectedCompanyId(null);
                    }}
                    onFocus={() => setIsCompanyListOpen(true)}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                    <i className={`bi ${isCompanyListOpen ? 'bi-search' : 'bi-building'}`}></i>
                  </div>
                  {isCompanyListOpen && (
                    <div className="absolute z-20 w-full mt-2 bg-card border border-border rounded-2xl shadow-xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                      <div
                        className="px-4 py-3 hover:bg-muted cursor-pointer text-sm font-bold text-primary border-b border-border transition-colors"
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
                          className={`px-4 py-3 hover:bg-muted cursor-pointer text-sm transition-colors ${selectedCompanyId === comp.id ? 'bg-primary/10 text-primary font-bold' : 'text-foreground font-medium'}`}
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
                <label className="text-[11px] font-black text-muted-foreground uppercase tracking-widest ml-1">Categoría y Visibilidad</label>
                <div className="flex gap-2 h-full">
                  <div className="bg-background border border-input p-1 rounded-xl flex flex-1 items-center">
                    {(['ALL', 'BASICO', 'ESPECIALIZADO'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setCategoryFilter(t)}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${categoryFilter === t ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        {t === 'ALL' ? 'Todos' : t === 'BASICO' ? 'Básico' : 'Espec.'}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowOnlyPublic(!showOnlyPublic)}
                    className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all ${showOnlyPublic ? 'bg-primary border-primary text-primary-foreground shadow-sm' : 'bg-background border-input text-muted-foreground hover:bg-muted'}`}
                  >
                    {showOnlyPublic ? '✓ Públicos' : 'Públicos'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* TABLA */}
          <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="px-6 lg:px-8 py-5 text-[11px] font-black text-muted-foreground uppercase tracking-widest w-1/3">Curso</th>
                    <th className="px-6 lg:px-8 py-5 text-[11px] font-black text-muted-foreground uppercase tracking-widest text-center">Empresa / Visibilidad</th>
                    <th className="px-6 lg:px-8 py-5 text-[11px] font-black text-muted-foreground uppercase tracking-widest text-center">Categoría</th>
                    <th className="px-6 lg:px-8 py-5 text-[11px] font-black text-muted-foreground uppercase tracking-widest text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((course) => (
                    <tr key={course.id} className="group hover:bg-muted/30 transition-colors">
                      <td className="px-6 lg:px-8 py-5 font-bold text-foreground">{course.title}</td>
                      <td className="px-6 lg:px-8 py-5 text-center">
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full tracking-wider uppercase ${course.isPublic ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                          {getCompanyName(course)}
                        </span>
                      </td>
                      <td className="px-6 lg:px-8 py-5 text-center">
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${course.category?.toUpperCase() === 'ESPECIALIZADO' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'}`}>
                          {course.category?.toUpperCase() === 'ESPECIALIZADO' ? 'Especialización' : 'Onboarding'}
                        </span>
                      </td>
                      <td className="px-6 lg:px-8 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/dashboard/administrator/general-admin/courses/manage/${course.id}`} className="w-9 h-9 flex items-center justify-center hover:bg-primary/10 rounded-lg transition-colors group/btn">
                            <i className="bi bi-pencil-square text-primary group-hover/btn:scale-110 transition-transform"></i>
                          </Link>
                          <button onClick={() => setCourseToDelete(course.id)} className="w-9 h-9 flex items-center justify-center hover:bg-destructive/10 rounded-lg transition-colors group/btn cursor-pointer border-none bg-transparent">
                            <i className="bi bi-trash3 text-destructive/70 group-hover/btn:text-destructive transition-colors"></i>
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
                <i className="bi bi-search text-4xl text-muted-foreground/30"></i>
                <p className="text-foreground font-bold text-lg">No se encontraron cursos</p>
                <p className="text-muted-foreground text-sm">Prueba ajustando los filtros de búsqueda.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setCategoryFilter('ALL');
                    setShowOnlyPublic(false);
                    setSelectedCompanyId(null);
                    setCompanySearch('');
                  }}
                  className="text-secondary font-bold text-sm hover:underline mt-4"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MODAL DE CONFIRMACIÓN */}
      {courseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-center border border-border">
            <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
              <i className="bi bi-exclamation-triangle"></i>
            </div>
            <h3 className="text-2xl font-extrabold text-foreground mb-2 tracking-tight">¿Eliminar curso?</h3>
            <p className="text-muted-foreground text-sm mb-8 leading-relaxed">Esta acción no se puede deshacer. El curso y todas sus lecciones se borrarán de forma permanente.</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={confirmDelete}
                className="w-full py-3.5 bg-destructive text-destructive-foreground rounded-xl font-bold hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
              >
                Sí, eliminar
              </button>
              <button
                onClick={() => setCourseToDelete(null)}
                className="w-full py-3.5 bg-muted text-foreground rounded-xl font-bold hover:bg-border transition-colors cursor-pointer"
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