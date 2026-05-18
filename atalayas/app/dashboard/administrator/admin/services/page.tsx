'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/ui/Sidebar';
import PageHeader from '@/components/ui/pageHeader';
import { API_ROUTES } from '@/lib/utils';
import { motion } from 'framer-motion';

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
    <div className="flex min-h-screen w-full bg-background font-sans text-foreground overflow-hidden">

      <main className="flex-1 flex flex-col relative w-full overflow-y-auto overflow-x-hidden no-scrollbar">
        
        <PageHeader 
          title="Servicios"
          description={
            <span className="hidden sm:block">
              Administra el catálogo de servicios corporativos y globales.
            </span> as any
          }
          icon={<i className="bi bi-briefcase"></i>}
          backUrl="/dashboard/administrator/admin"
          action={
            <Link href="/dashboard/administrator/admin/services/new"
              className="bg-secondary text-secondary-foreground px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all flex items-center gap-2 shadow-sm"
            >
              <i className="bi bi-plus-lg text-sm"></i>
              <span className="hidden sm:inline">Nuevo Servicio</span>
              <span className="sm:hidden">Crear</span>
            </Link>
          }
        />

        <div className="p-4 sm:p-6 lg:p-10 flex-1 max-w-7xl mx-auto w-full">
          
          <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm flex flex-col">
            
            <div className="p-4 sm:p-5 border-b border-border flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-muted/10">
              
              <div className="flex flex-wrap gap-1 bg-card border border-border p-1 rounded-xl shadow-sm w-full xl:w-auto">
                {['ALL', 'COMPANY', 'PUBLIC'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilter(type as any)}
                    className={`flex-1 xl:flex-none relative px-3 sm:px-5 py-2 text-[11px] font-medium rounded-lg transition-all ${
                      filter === type ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span className="relative z-10">
                      {type === 'ALL' ? 'Todos' : type === 'PUBLIC' ? 'Globales' : 'Mi Empresa'}
                    </span>
                    {filter === type && (
                      <motion.div layoutId="servicesFilterPill" className="absolute inset-0 bg-primary/10 rounded-lg" />
                    )}
                  </button>
                ))}
              </div>

              <div className="relative w-full xl:max-w-xs">
                <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm"></i>
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar servicio..."
                  className="w-full bg-background border border-input rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-primary transition-all font-medium shadow-sm"
                />
              </div>
            </div>

            {/* Tabla ajustada a móvil sin scroll horizontal */}
            <div className="w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/40 border-b border-border">
                    {/* Cabeceras más pequeñas, sin mayúsculas exageradas y con padding adaptativo */}
                    <th className="px-4 sm:px-6 py-3 text-[10px] sm:text-xs font-semibold text-muted-foreground w-[55%]">Nombre del servicio</th>
                    <th className="px-2 sm:px-6 py-3 text-[10px] sm:text-xs font-semibold text-muted-foreground w-[25%] text-center">Visibilidad</th>
                    <th className="px-4 sm:px-6 py-3 text-[10px] sm:text-xs font-semibold text-muted-foreground w-[20%] text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    [1, 2, 3].map(i => <tr key={i} className="animate-pulse"><td colSpan={3} className="px-4 sm:px-6 py-6"><div className="h-4 bg-muted rounded w-full"></div></td></tr>)
                  ) : filteredServices.length > 0 ? (
                    filteredServices.map((service) => (
                      <tr 
                        key={service.id} 
                        onClick={() => router.push(`/dashboard/administrator/admin/services/${service.id}`)}
                        className="hover:bg-muted/30 cursor-pointer transition-colors group"
                      >
                        <td className="px-4 sm:px-6 py-4">
                          {/* El título se adapta y usa puntos suspensivos si es absurdamente largo */}
                          <div className="font-medium text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
                            {service.title}
                          </div>
                        </td>
                        <td className="px-2 sm:px-6 py-4 text-center">
                          <span className={`text-[9px] sm:text-[10px] font-medium px-2 py-1 rounded-md border ${
                            service.isPublic ? 'bg-primary/5 text-primary border-primary/10' : 'bg-muted text-muted-foreground border-border/50'
                          }`}>
                            {service.isPublic ? 'Global' : 'Privado'}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-right">
                          <div className="flex items-center justify-end text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all">
                            <i className="bi bi-chevron-right text-base sm:text-lg"></i>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-12 text-center text-muted-foreground">
                        <i className="bi bi-inbox text-3xl mb-3 block opacity-50"></i>
                        <p className="text-sm font-medium">No se encontraron servicios</p>
                      </td>
                    </tr>
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