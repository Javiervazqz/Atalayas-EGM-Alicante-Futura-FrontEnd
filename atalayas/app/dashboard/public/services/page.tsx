'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/ui/Sidebar';
import { API_ROUTES } from '@/lib/utils';
import SearchInput from '@/components/ui/Searchbar';

interface Service {
  id: string;
  title: string;
  description: string;
  isPublic: boolean;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'INFO' | 'BOOKING' | 'ANNOUNCEMENT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const user = typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem('user') || '{}') 
    : {};
  const role = user.role || 'PUBLIC';

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(API_ROUTES.SERVICES.GET_ALL, { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!res.ok) throw new Error('Error al cargar servicios');
        
        const data = await res.json();
        setServices(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching services:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

 const filteredServices = services.filter((s) => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

 return (
  <div className="flex min-h-screen bg-background font-sans">
    <Sidebar role={role} />
    
    <main className="flex-1 h-screen overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-10 lg:py-12">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <Link href="/dashboard/public" className="hover:text-secondary transition-colors">Dashboard</Link>
              <span className="opacity-50">/</span>
              <span className="text-foreground font-medium">Servicios</span>
            </nav>
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
              Servicios y Recursos
            </h1>
          </div>

          <SearchInput 
            value={searchQuery} 
            onChange={setSearchQuery} 
            placeholder='Buscar servicios...'
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-card rounded-3xl border border-border animate-pulse" />
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-24 bg-card rounded-3xl border border-dashed border-border">
            <span className="text-4xl text-muted-foreground/50 mb-4 block"><i className="bi bi-search"></i></span>
            <p className="text-muted-foreground font-medium">No hay servicios disponibles en esta categoría.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.sort((a, b) => a.title.localeCompare(b.title)).map((service) => {
              return (
                <Link key={service.id} href={`/dashboard/public/services/${service.id}`}>
                  <div className="group bg-card p-6 lg:p-8 rounded-3xl border border-border shadow-sm hover:shadow-xl hover:border-secondary transition-all duration-300 flex flex-col h-full active:scale-95">

                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-secondary/10 transition-colors">
                      <i className="bi bi-briefcase text-primary group-hover:text-secondary text-xl"></i>
                    </div>

                    <h3 className="text-lg font-bold text-foreground mb-3 group-hover:text-secondary transition-colors leading-tight">
                      {service.title}
                    </h3>

                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-8 flex-1">
                      {service.description || 'Sin descripción.'}
                    </p>

                    <div className="flex items-center justify-between pt-5 border-t border-border">
                      <span className={`text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${service.isPublic ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        {service.isPublic ? '🌐 Público' : '🔒 Privado'}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  </div>
 );
}