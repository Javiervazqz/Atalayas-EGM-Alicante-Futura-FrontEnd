'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import PageHeader from '@/components/ui/pageHeader';
import { API_ROUTES } from '@/lib/utils';
import CompanyDropdown from '@/components/ui/CompanyDropdown';
import { API_ROUTES } from '@/lib/utils';

interface Service {
  id: string;
  title: string;
  isPublic: boolean;
  Company?: { name: string };
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<string>('PUBLIC');
  const router = useRouter();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch(API_ROUTES.SERVICES.GET_ALL, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        setServices(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const filteredServices = services.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.Company?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const byCompany = filteredServices.reduce((acc, s) => {
    if (!s.isPublic) {
      const name = s.Company?.name || 'Sin empresa';
      if (!acc[name]) acc[name] = [];
      acc[name].push(s);
    }
    return acc;
  }, new Set<string>());

  const companies = ['PUBLIC', ...Object.keys(byCompany)];
  const currentList = selectedCompany === 'PUBLIC' 
    ? filteredServices.filter(s => s.isPublic) 
    : byCompany[selectedCompany] || [];

  return (
    <div className="flex min-h-screen bg-background font-sans text-foreground">
      <Sidebar role='GENERAL_ADMIN' />

      <main className="flex-1 overflow-auto flex flex-col relative">
        <PageHeader 
          title="Gestión de Servicios"
          description="Organiza y supervisa todos los servicios del ecosistema corporativo."
          icon={<i className="bi bi-briefcase"></i>}
          action={
            <Link href="/dashboard/administrator/general-admin/services/new"
              className="bg-secondary text-secondary-foreground px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all shadow-sm flex items-center gap-2"
            >
              <i className="bi bi-plus-lg"></i> Nuevo servicio
            </Link>
          }
        />

        <div className="p-6 lg:p-10 flex-1 max-w-7xl mx-auto w-full space-y-6">
          
          <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm flex flex-col">
            <div className="p-5 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/20">
              <div className="flex-1 w-full max-w-sm">
                <CompanyDropdown companies={companies} selected={selectedCompany} onChange={setSelectedCompany} />
              </div>
              <div className="relative w-full sm:max-w-xs">
                <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm"></i>
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar servicio..."
                  className="w-full bg-background border border-input rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-primary transition-all font-medium"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/40 border-b border-border">
                    <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest w-3/5">Servicio</th>
                    <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest w-1/5">Visibilidad</th>
                    <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest w-1/5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    [1, 2, 3].map(i => <tr key={i} className="animate-pulse"><td colSpan={3} className="px-6 py-8"><div className="h-4 bg-muted rounded w-full"></div></td></tr>)
                  ) : currentList.length > 0 ? (
                    currentList.map((service) => (
                      <tr key={service.id} onClick={() => router.push(`/dashboard/administrator/general-admin/services/${service.id}`)} className="hover:bg-muted/30 cursor-pointer transition-colors group">
                        <td className="px-6 py-5"><div className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{service.title}</div></td>
                        <td className="px-6 py-5">
                          <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-md border ${service.isPublic ? 'bg-primary/5 text-primary border-primary/10' : 'bg-muted text-muted-foreground border-border'}`}>
                            {service.isPublic ? 'Global' : 'Privado'}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <i className="bi bi-chevron-right text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all"></i>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={3} className="px-6 py-20 text-center text-muted-foreground font-medium text-sm italic">No se han encontrado servicios.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}