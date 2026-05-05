'use client';

import { useEffect, useState, useMemo } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import PageHeader from '@/components/ui/pageHeader';
import SearchInput from '@/components/ui/Searchbar';
import { API_ROUTES, fetchWithApiFallback } from '@/lib/utils';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState<Company | null>(null);
  const [fetchingDetail, setFetchingDetail] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const data = await fetchWithApiFallback(API_ROUTES.COMPANIES.GET_ALL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCompanies(Array.isArray(data) ? data : []);
    } catch (err) {
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
      const fullData = await fetchWithApiFallback(API_ROUTES.COMPANIES.GET_BY_ID(company.id), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (fullData) setSelected(fullData);
    } catch (err) {
      console.error("Error al obtener detalles");
    } finally {
      setFetchingDetail(false);
    }
  };

  // Filtrado optimizado con useMemo
  const filtered = useMemo(() => {
    return companies.filter(c => {
      const query = searchQuery.toLowerCase();
      return (
        c.name?.toLowerCase().includes(query) || 
        c.cif?.toLowerCase().includes(query) ||
        c.activity?.toLowerCase().includes(query)
      );
    });
  }, [companies, searchQuery]);

  return (
    <div className="flex h-screen bg-[#f5f5f7] dark:bg-[#0d0d0f] font-sans text-foreground overflow-hidden">
      <Sidebar role="GENERAL_ADMIN" />

      <main className="flex-1 flex flex-col min-w-0 bg-white/40 dark:bg-transparent backdrop-blur-3xl">
        <PageHeader 
          title="Directorio de Empresas"
          description={`Gestiona las entidades activas del área empresarial.`}
          icon={<i className="bi bi-buildings-fill"></i>}
          action={
            <div className="flex items-center gap-4">
              <SearchInput 
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Buscar por nombre, CIF o sector..."
              />
            </div>
          }
        />

        <div className="flex-1 flex overflow-hidden">
          
          {/* ── SECCIÓN IZQUIERDA: TABLA Y CONTENIDO ── */}
          <div className="flex-1 overflow-y-auto p-6 lg:p-8 no-scrollbar">
            <div className="max-w-6xl mx-auto">
              <div className="bg-white dark:bg-[#1c1c1e] rounded-[2.5rem] border border-gray-200/50 dark:border-white/6 shadow-[0_20px_50px_rgba(0,0,0,0.02)] overflow-hidden transition-all">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 dark:bg-white/2 border-b border-gray-100 dark:border-white/4">
                      <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Empresa</th>
                      <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Identificación</th>
                      <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest hidden md:table-cell">Actividad</th>
                      <th className="px-8 py-5 text-right text-[10px] font-black text-muted-foreground uppercase tracking-widest">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-white/2">
                    {loading ? (
                      <LoadingSkeleton />
                    ) : filtered.length > 0 ? (
                      filtered.map((company) => (
                        <tr 
                          key={company.id} 
                          onClick={() => handleOpenDetail(company)}
                          className={`group cursor-pointer transition-all duration-300 ${selected?.id === company.id ? 'bg-primary/3 dark:bg-primary/5' : 'hover:bg-gray-50/80 dark:hover:bg-white/1'}`}
                        >
                          <td className="px-8 py-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-gray-100 to-gray-50 dark:from-white/5 dark:to-transparent border border-gray-200/50 dark:border-white/8 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                                {company.logoUrl ? (
                                  <img src={encodeURI(company.logoUrl)} className="w-full h-full object-cover" alt="" />
                                ) : (
                                  <span className="text-sm font-black text-primary/40">{company.name?.charAt(0)}</span>
                                )}
                              </div>
                              <span className="font-semibold text-[15px] tracking-tight text-foreground/90">{company.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <code className="text-[11px] font-bold text-muted-foreground bg-gray-100 dark:bg-white/5 px-2.5 py-1 rounded-md border border-gray-200/50 dark:border-white/10 uppercase tracking-tight">
                              {company.cif}
                            </code>
                          </td>
                          <td className="px-6 py-4 hidden md:table-cell">
                            <span className="text-[13px] font-medium text-muted-foreground line-clamp-1 italic">
                              {company.activity || 'No especificada'}
                            </span>
                          </td>
                          <td className="px-8 py-4 text-right">
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${selected?.id === company.id ? 'bg-primary text-white' : 'bg-green-500/10 text-green-500'}`}>
                              {selected?.id === company.id ? 'En foco' : 'Activa'}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-20 text-center">
                          <p className="text-sm font-medium text-muted-foreground">No se encontraron empresas con ese criterio.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ── PANEL DERECHO: DETALLE (Estilo Side-Sheet) ── */}
          <aside className={`w-112.5 border-l border-gray-200/50 dark:border-white/6 bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-2xl transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-y-auto no-scrollbar ${selected ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 absolute right-0'}`}>
            {selected && (
              <div className="p-10 space-y-10 relative">
                
                {fetchingDetail && (
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-primary animate-pulse" />
                )}

                {/* Header del Detalle */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setSelected(null)}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-white/5 text-muted-foreground hover:bg-red-500 hover:text-white transition-all shadow-sm"
                  >
                    <i className="bi bi-x-lg text-xs"></i>
                  </button>
                  <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.4em]">Ficha Técnica</span>
                </div>

                {/* Perfil */}
                <div className="text-center space-y-4">
                  <div className="inline-block relative">
                    <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-white dark:border-white/10 shadow-2xl mx-auto bg-gray-50 dark:bg-white/5">
                      {selected.logoUrl ? (
                        <img src={encodeURI(selected.logoUrl)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl font-black text-muted-foreground/20 uppercase">
                          {selected.name?.charAt(0)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight text-foreground">{selected.name}</h3>
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mt-1 opacity-80 italic">{selected.activity}</p>
                  </div>
                </div>

                {/* Datos de Contacto */}
                <div className="space-y-3">
                  <DetailItem icon="bi-hash" label="CIF" value={selected.cif} />
                  <DetailItem icon="bi-geo-alt" label="Dirección" value={selected.address} />
                  <DetailItem icon="bi-envelope" label="Email" value={selected.contactEmail} />
                  <DetailItem icon="bi-telephone" label="Teléfono" value={selected.contactPhone} />
                </div>

                {/* Descripción */}
                {selected.description && (
                  <div className="p-6 rounded-[2rem] bg-gray-50 dark:bg-white/2 border border-gray-100 dark:border-white/4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-3">Sobre la empresa</h4>
                    <p className="text-[13px] leading-relaxed text-foreground/80 italic">"{selected.description}"</p>
                  </div>
                )}

                {/* CTA y Footer */}
                <div className="space-y-4 pt-4">
                  {selected.website && (
                    <a
                      href={selected.website.startsWith('http') ? selected.website : `https://${selected.website}`}
                      target="_blank"
                      className="flex items-center justify-center gap-3 w-full py-4 bg-foreground text-background dark:bg-white dark:text-black rounded-2xl font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-black/5 dark:shadow-white/5"
                    >
                      <i className="bi bi-globe"></i> Visitar Web
                    </a>
                  )}
                  
                  <div className="text-center pt-6 border-t border-gray-100 dark:border-white/5">
                    <p className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em]">
                      Incorporación: {new Date(selected.created_at).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}

// ── COMPONENTES AUXILIARES ──

function DetailItem({ icon, label, value }: { icon: string, label: string, value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
      <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/10 flex items-center justify-center text-primary shadow-sm border border-gray-100 dark:border-white/10 group-hover:scale-110 transition-transform">
        <i className={`bi ${icon}`}></i>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-[13px] font-bold text-foreground/90 truncate">{value}</p>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <>
      {[1, 2, 3, 4, 5, 6].map(i => (
        <tr key={i} className="animate-pulse">
          <td className="px-8 py-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 dark:bg-white/5 rounded-2xl"></div>
              <div className="h-4 bg-gray-200 dark:bg-white/5 rounded w-32"></div>
            </div>
          </td>
          <td className="px-6 py-5"><div className="h-4 bg-gray-200 dark:bg-white/5 rounded w-20"></div></td>
          <td className="px-6 py-5"><div className="h-4 bg-gray-200 dark:bg-white/5 rounded w-40"></div></td>
          <td className="px-8 py-5 text-right"><div className="h-6 bg-gray-200 dark:bg-white/5 rounded-full w-16 ml-auto"></div></td>
        </tr>
      ))}
    </>
  );
}