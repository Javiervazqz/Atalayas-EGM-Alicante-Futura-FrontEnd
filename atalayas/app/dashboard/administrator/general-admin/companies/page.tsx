'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import PageHeader from '@/components/ui/pageHeader';
import SearchInput from '@/components/ui/Searchbar';
import { API_ROUTES } from '@/lib/utils';

interface Company {
  id: string;
  name: string;
  cif: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  logoUrl?: string;
  activity?: string;
  description?: string;
  website?: string;
  created_at: string;
}

export default function CompaniesDirectoryPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState<Company | null>(null);
  const [fetchingDetail, setFetchingDetail] = useState(false);

  useEffect(() => {
    const init = async () => {
      await fetchCompanies();
      setInitializing(false);
    };
    init();
  }, []);

  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_ROUTES.COMPANIES.GET_ALL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCompanies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar empresas:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = async (company: Company) => {
    if (selected?.id === company.id) {
      setSelected(null);
      return;
    }
    setSelected(company);
    setFetchingDetail(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_ROUTES.COMPANIES.GET_BY_ID(company.id), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const fullData = await res.json();
        setSelected(fullData);
      }
    } catch (err) {
      console.error("Error detalle:", err);
    } finally {
      setFetchingDetail(false);
    }
  };

  const filtered = companies.filter(c => {
    const name = c.name?.toLowerCase() || '';
    const cif = c.cif?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return name.includes(query) || cif.includes(query);
  });

  if (initializing) {
    return (
      <div className="flex min-h-screen bg-background items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary animate-pulse">Cargando Directorio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted/30 font-sans text-foreground transition-colors duration-300">
      <Sidebar role="GENERAL_ADMIN" />

      <main className="flex-1 flex flex-col overflow-hidden">
        <PageHeader 
          title="Directorio de Empresas"
          description={`Consulta de las ${companies.length} entidades del ecosistema.`}
          icon={<i className="bi bi-buildings"></i>}
          action={
            <SearchInput 
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Filtrar base de datos..."
            />
          }
        />

        <div className={`flex-1 grid overflow-hidden transition-all duration-500 ${selected ? 'lg:grid-cols-[1fr_450px]' : 'grid-cols-1'}`}>
          
          {/* ── TABLA DE DATOS ── */}
          <div className="overflow-y-auto p-6 lg:p-10 no-scrollbar">
            <div className="bg-card rounded-[32px] border border-border/60 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border/60">
                      <th className="px-8 py-6 text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">Empresa</th>
                      <th className="px-6 py-6 text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">Identificación</th>
                      <th className="px-6 py-6 text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] hidden md:table-cell">Actividad</th>
                      <th className="px-8 py-6 text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] text-right w-25">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {loading ? (
                      [1, 2, 3, 4, 5].map(i => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={4} className="px-8 py-7"><div className="h-5 bg-muted rounded-xl w-full"></div></td>
                        </tr>
                      ))
                    ) : (
                      filtered.map((company) => (
                      <tr 
                        key={company.id} 
                        onClick={() => handleOpenDetail(company)}
                        className={`group cursor-pointer transition-all ${selected?.id === company.id ? 'bg-primary/5' : 'hover:bg-muted/50'}`}
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-2xl bg-muted/60 border border-border/40 flex items-center justify-center overflow-hidden shrink-0">
                              {company.logoUrl ? (
                                <img src={encodeURI(company.logoUrl)} className="w-full h-full object-cover" alt="" />
                              ) : (
                                <span className="text-xs font-black text-muted-foreground/40">{company.name?.charAt(0) || '?'}</span>
                              )}
                            </div>
                            {/* CAMBIO: Sin negrita y sin uppercase forzado */}
                            <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors tracking-tight">{company.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="font-mono text-[11px] font-bold text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg border border-border/60">
                            {company.cif || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-5 hidden md:table-cell">
                          <span className="text-xs font-medium text-foreground/50 truncate block max-w-40">
                            {company.activity || '—'}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right w-25">
                          <button className={`w-15 h-9 rounded-xl transition-all ${selected?.id === company.id ? 'bg-primary text-white shadow-lg' : 'bg-muted/60 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'}`}>
                            <i className={`bi ${selected?.id === company.id ? 'bi-info-circle-fill' : 'bi-info-circle'}`}></i>
                          </button>
                        </td>
                      </tr>
                    )))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ── PANEL DE DETALLE LATERAL (EL DESPLEGABLE) ── */}
          {selected && (
            <div className="overflow-y-auto border-l border-border/60 bg-card p-10 shadow-[-25px_0_50px_rgba(0,0,0,0.04)] animate-in slide-in-from-right-12 duration-700 no-scrollbar relative">
              
              {fetchingDetail && (
                <div className="absolute top-0 left-0 w-full h-1 bg-muted overflow-hidden">
                  <div className="h-full bg-primary animate-[loading_2s_infinite_linear] w-[30%] origin-left"></div>
                </div>
              )}

              <div className="flex items-center justify-between mb-12">
                <button
                  onClick={() => setSelected(null)}
                  className="w-11 h-11 rounded-full flex items-center justify-center bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all hover:rotate-90 shadow-sm"
                >
                  <i className="bi bi-x-lg"></i>
                </button>
                <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.4em]">Expediente Corporativo</span>
              </div>

              <div className="flex flex-col items-center text-center mb-12">
                <div className="w-36 h-36 rounded-[48px] overflow-hidden border-10 border-background shadow-2xl mb-8 bg-muted/20">
                  {selected.logoUrl ? (
                    <img src={encodeURI(selected.logoUrl)} alt={selected.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl text-muted-foreground/20 font-black bg-muted/50 uppercase">
                      {selected.name?.charAt(0) || '?'}
                    </div>
                  )}
                </div>
                
                {/* CAMBIO: Nombre sin negrita extrema y sin mayúsculas forzadas */}
                <h3 className="text-foreground text-3xl font-medium mb-1 tracking-tight leading-none px-4">
                  {selected.name}
                </h3>
                
                {/* CAMBIO: Actividad abajo con tracking normal (menos espaciado) */}
                <p className="text-primary text-[11px] font-bold tracking-normal opacity-80 uppercase italic">
                   {selected.activity || 'Sector Global'}
                </p>
              </div>

              <div className="grid gap-4 mb-10">
                {[
                  { label: 'Identificador Fiscal', value: selected.cif, icon: 'bi-hash' },
                  { label: 'Sede Central', value: selected.address, icon: 'bi-geo-alt' },
                  { label: 'Correo Corporativo', value: selected.contactEmail, icon: 'bi-envelope' },
                  { label: 'Teléfono', value: selected.contactPhone, icon: 'bi-telephone' },
                ].filter(f => f.value).map((field) => (
                  <div key={field.label} className="bg-muted/20 p-5 rounded-[24px] border border-border/40 flex items-start gap-5 group hover:border-primary/20 transition-all">
                    <div className="w-10 h-10 rounded-2xl bg-card flex items-center justify-center text-primary shadow-sm shrink-0 mt-0.5 transition-transform group-hover:scale-110">
                        <i className={`bi ${field.icon}`}></i>
                    </div>
                    <div className="min-w-0">
                      <p className="text-muted-foreground/40 text-[9px] font-black uppercase tracking-[0.2em] mb-1.5">{field.label}</p>
                      <p className="text-foreground text-sm font-bold leading-tight wrap-break-words">{field.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {selected.description && (
                <div className="bg-card border border-border/60 rounded-[28px] p-8 mb-10 shadow-sm">
                   <p className="text-muted-foreground/30 text-[9px] font-black uppercase tracking-[0.3em] mb-4 text-center">Reseña Institucional</p>
                   <p className="text-foreground/80 text-sm leading-relaxed font-medium italic text-center">
                     "{selected.description}"
                   </p>
                </div>
              )}

              {selected.website && (
                <a
                  href={selected.website.startsWith('http') ? selected.website : `https://${selected.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-4 w-full py-5 bg-secondary text-white rounded-[22px] font-black text-[11px] uppercase tracking-[0.25em] hover:opacity-95 shadow-xl shadow-secondary/20 transition-all active:scale-95 mb-8"
                >
                  <i className="bi bi-globe-americas text-lg"></i> Acceder al Portal
                </a>
              )}

              <div className="pt-8 border-t border-border/40 text-center">
                 <p className="text-[9px] font-black text-muted-foreground/20 uppercase tracking-[0.3em]">
                   Fecha de Registro: {selected.created_at ? new Date(selected.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}
                 </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <style>{`
        @keyframes loading {
          0% { left: -40%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
}