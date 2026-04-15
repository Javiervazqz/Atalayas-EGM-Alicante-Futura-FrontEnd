'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/ui/Sidebar';
import { API_ROUTES } from '@/lib/utils';
import SearchInput from '@/components/ui/Searchbar';
import CompanyDropdown from '@/components/ui/CompanyDropdown';

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
  const [selectedCompany, setSelectedCompany] = useState<string>('PUBLIC');
  const router = useRouter();

  const user = typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem('user') || '{}') 
    : {};

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(API_ROUTES.SERVICES.GET_ALL, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setServices(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching services:", error);
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
  }, {} as Record<string, Service[]>);

  const companies = ['PUBLIC', ...Object.keys(byCompany)];
  const publicServices = filteredServices.filter(s => s.isPublic);
  
  const currentList = [...(selectedCompany === 'PUBLIC' ? publicServices : byCompany[selectedCompany] || [])];
  
  currentList.sort((a, b) => a.title.localeCompare(b.title));

  return (
    <div className="flex min-h-screen bg-background font-sans">
      <Sidebar role='GENERAL_ADMIN' />

      <main className="flex-1 h-screen overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-10 lg:py-12">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">Gestión de Servicios</h1>
              <p className="text-muted-foreground mt-2 text-base">Organiza y edita los servicios del ecosistema.</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Buscar..." />
              <Link href="/dashboard/administrator/general-admin/services/new"
                className="bg-secondary text-secondary-foreground w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity shadow-sm whitespace-nowrap text-center">
                <i className="bi bi-plus-lg mr-1"></i> Nuevo servicio
              </Link>
            </div>
          </div>

          <div className="mb-6">
            <CompanyDropdown companies={companies} selected={selectedCompany} onChange={setSelectedCompany} />
          </div>

          <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="px-6 py-4 text-[11px] font-black text-muted-foreground uppercase tracking-widest">Servicio</th>
                    <th className="px-6 py-4 text-[11px] font-black text-muted-foreground uppercase tracking-widest">Empresa Propietaria</th>
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
                        onClick={() => router.push(`/dashboard/administrator/general-admin/services/${service.id}`)}
                        className="hover:bg-muted cursor-pointer transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="font-bold text-foreground group-hover:text-secondary transition-colors">
                            {service.title}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${service.isPublic ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                            {service.isPublic ? 'Global (Atalayas)' : (service.Company?.name || 'Privado')}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="px-6 py-16 text-center">
                        <div className="text-4xl text-muted-foreground/50 mb-3"><i className="bi bi-search"></i></div>
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