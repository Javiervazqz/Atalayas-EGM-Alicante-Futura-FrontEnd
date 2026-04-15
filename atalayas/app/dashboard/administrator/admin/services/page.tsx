'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/ui/Sidebar';
import { API_ROUTES } from '@/lib/utils';
import SearchInput from '@/components/ui/Searchbar';

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
  const [role, setRole] = useState<'ADMIN' | 'USER'>('ADMIN');
  const router = useRouter();
  const [filter, setFilter] = useState<'ALL' | 'PUBLIC' | 'COMPANY'>('COMPANY');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role) {
        setRole(parsedUser.role)
      }
    }
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

  const searchedServices = services.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.Company?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredByCategory = searchedServices.filter(s => {
    if (filter === 'ALL') return true;
    if (filter === 'PUBLIC') return s.isPublic === true;
    if (filter === 'COMPANY') return s.isPublic === false;
    return true;
  });

  const currentList = [...filteredByCategory].sort((a, b) => {
    if (!a.isPublic && b.isPublic) return -1;
    if (a.isPublic && !b.isPublic) return 1;
    return a.title.localeCompare(b.title);
  });

  return (
    <div className="flex min-h-screen bg-background font-sans">
      <Sidebar role='ADMIN' />

      <main className="flex-1 h-screen overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-10 lg:py-12">

          {/* Header Compacto */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight mb-2">Gestión de Servicios</h1>
              <p className="text-muted-foreground text-base font-medium">Organiza y edita los servicios de tu empresa.</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Buscar..." />
              <Link href="/dashboard/administrator/admin/services/new"
                className="bg-secondary text-secondary-foreground w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity shadow-sm whitespace-nowrap text-center flex items-center justify-center gap-2">
                <i className="bi bi-plus-lg text-lg"></i> Nuevo servicio
              </Link>
            </div>
          </div>

          {/* CHIPS DE FILTRADO */}
          <div className="flex items-center gap-3 mb-10 overflow-x-auto pb-2 no-scrollbar">
            {['ALL', 'COMPANY', 'PUBLIC'].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type as any)}
                className={`shrink-0 px-6 py-2.5 rounded-full text-sm font-bold transition-all border ${filter === type ? 'bg-foreground text-background border-foreground shadow-sm' : 'bg-background text-muted-foreground border-border hover:bg-muted'
                  }`}
              >
                {type === 'ALL' ? ('Todos') :
                  type === 'PUBLIC' ?
                    (<span className="flex items-center gap-2">
                      <i className="bi bi-globe text-primary"></i> Públicos
                    </span>
                    ) :
                    <span className='flex items-center gap-2'>
                      <i className="bi bi-building-fill text-secondary"></i> Mi empresa </span>}
              </button>
            ))}
          </div>

          {/* LISTA MODO TABLA */}
          <div className="bg-card rounded-[2.5rem] border border-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="w-3/5 px-6 lg:px-8 py-5 text-[11px] font-black text-muted-foreground uppercase tracking-widest">Servicio</th>
                    <th className="w-2/5 px-6 lg:px-8 py-5 text-[11px] font-black text-muted-foreground uppercase tracking-widest">Empresa Propietaria</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    [1, 2, 3].map(i => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={2} className="px-6 py-8 bg-muted/30"></td>
                      </tr>
                    ))
                  ) : currentList.length > 0 ? (
                    currentList.map((service) => (
                      <tr
                        key={service.id}
                        onClick={() => router.push(`/dashboard/administrator/admin/services/${service.id}`)}
                        className="hover:bg-muted/30 cursor-pointer transition-colors group"
                      >
                        <td className="px-6 lg:px-8 py-5">
                          <div className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                            {service.title}
                          </div>
                        </td>
                        <td className="px-6 lg:px-8 py-5">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${service.isPublic ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                            {service.isPublic ? 'Global (Atalayas)' : service.Company?.name}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="px-6 py-20 text-center">
                        <div className="text-4xl text-muted-foreground/30 mb-3"><i className="bi bi-search"></i></div>
                        <p className="text-foreground font-bold text-lg mb-1">No hay resultados</p>
                        <p className="text-muted-foreground text-sm font-medium">No se encontraron servicios en esta categoría.</p>
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