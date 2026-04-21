'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/ui/Sidebar';
import PageHeader from '@/components/ui/pageHeader';
import { API_ROUTES } from '@/lib/utils';

interface Service {
  id: string;
  title: string;
  description: string;
  isPublic: boolean;
  Company?: { id: string; name: string };
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'PUBLIC' | 'COMPANY'>('COMPANY');
  const router = useRouter();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(API_ROUTES.SERVICES.GET_ALL, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setServices(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const filteredServices = services.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.Company?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesTab = true;
    if (filter === 'PUBLIC') matchesTab = s.isPublic === true;
    if (filter === 'COMPANY') matchesTab = s.isPublic === false;
    
    return matchesSearch && matchesTab;
  }).sort((a, b) => a.title.localeCompare(b.title));

  return (
    <div className="flex min-h-screen bg-background font-sans text-foreground">
      <Sidebar role='ADMIN' />

      <main className="flex-1 overflow-auto flex flex-col relative">
        <PageHeader 
          title="Gestión de Servicios"
          description="Administra el catálogo de servicios corporativos y globales."
          icon={<i className="bi bi-briefcase"></i>}
          backUrl="/dashboard/administrator/admin"
          action={
            <Link href="/dashboard/administrator/admin/services/new"
              className="bg-secondary text-secondary-foreground px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all shadow-sm flex items-center gap-2"
            >
              <i className="bi bi-plus-lg"></i> Nuevo Servicio
            </Link>
          }
        />

        <div className="p-6 lg:p-10 flex-1 max-w-7xl mx-auto w-full">
          
          <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm flex flex-col">
            
            <div className="p-5 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/20">
              <div className="flex bg-background border border-input p-1 rounded-xl shrink-0">
                {['ALL', 'COMPANY', 'PUBLIC'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilter(type as any)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                      filter === type ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {type === 'ALL' ? 'Todos' : type === 'PUBLIC' ? 'Globales' : 'Mi Empresa'}
                  </button>
                ))}
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
                    <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest w-3/5">Nombre del Servicio</th>
                    <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest w-1/5">Visibilidad</th>
                    <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest w-1/5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    [1, 2, 3].map(i => <tr key={i} className="animate-pulse"><td colSpan={3} className="px-6 py-8"><div className="h-4 bg-muted rounded w-full"></div></td></tr>)
                  ) : filteredServices.length > 0 ? (
                    filteredServices.map((service) => (
                      <tr 
                        key={service.id} 
                        onClick={() => router.push(`/dashboard/administrator/admin/services/${service.id}`)}
                        className="hover:bg-muted/30 cursor-pointer transition-colors group"
                      >
                        <td className="px-6 py-5">
                          <div className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{service.title}</div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border ${
                            service.isPublic ? 'bg-primary/5 text-primary border-primary/10' : 'bg-muted text-muted-foreground border-border'
                          }`}>
                            {service.isPublic ? 'Global' : 'Privado'}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all">
                            <i className="bi bi-chevron-right text-lg"></i>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={3} className="px-6 py-20 text-center text-muted-foreground font-medium text-sm italic">No hay servicios disponibles.</td></tr>
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