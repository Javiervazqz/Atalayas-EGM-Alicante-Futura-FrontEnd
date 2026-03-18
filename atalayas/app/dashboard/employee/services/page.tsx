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
  serviceType: 'INFO' | 'BOOKING' | 'ANNOUNCEMENT';
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'INFO' | 'BOOKING' | 'ANNOUNCEMENT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Recuperamos el usuario para el Sidebar
  const user = typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem('user') || '{}') 
    : {};
  const role = user.role || 'EMPLOYEE';

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

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'INFO': return { icon: 'ℹ️', label: 'Información', color: 'text-blue-600', bg: 'bg-blue-50' };
      case 'BOOKING': return { icon: '📅', label: 'Reserva', color: 'text-purple-600', bg: 'bg-purple-50' };
      case 'ANNOUNCEMENT': return { icon: '📢', label: 'Aviso', color: 'text-orange-600', bg: 'bg-orange-50' };
      default: return { icon: '📄', label: 'Servicio', color: 'text-gray-600', bg: 'bg-gray-50' };
    }
  };

 const filteredServices = services.filter((s) => {
    const matchesFilter = filter === 'ALL' || s.serviceType === filter;
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

 return (
  <div className="flex min-h-screen bg-[#f5f5f7]">
    <Sidebar role={role} />
    
    <main className="flex-1 h-screen overflow-y-auto">
      <div className="max-w-6xl mx-auto px-8 py-12">
        
        {/* Header con Título y Búsqueda en la misma fila */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <nav className="flex items-center gap-2 text-sm text-[#86868b] mb-4">
              <Link href="/dashboard/employee" className="hover:text-[#0071e3] transition-colors">Dashboard</Link>
              <span className="opacity-50">/</span>
              <span className="text-[#1d1d1f] font-medium">Servicios</span>
            </nav>
            <h1 className="text-4xl font-bold text-[#1d1d1f] tracking-tight">
              Servicios y Recursos
            </h1>
          </div>

          {/* Aquí el buscador desplegable */}
          <SearchInput 
            value={searchQuery} 
            onChange={setSearchQuery} 
            placeholder='Buscar servicios...'
          />
        </div>

          {/* Grid Principal */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-64 bg-white rounded-[2.5rem] border border-gray-100 animate-pulse" />
              ))}
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-gray-300">
              <span className="text-4xl mb-4 block">🔍</span>
              <p className="text-[#86868b] font-medium">No hay servicios disponibles en esta categoría.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredServices.map((services) => {
                const styles = getTypeStyles(services.serviceType);
                return (
                  <Link key={services.id} href={`/dashboard/employee/services/${services.id}`}>
                    <div className="group bg-white p-8 rounded-[2.5rem] border border-gray-200/50 shadow-sm hover:shadow-2xl hover:shadow-gray-300/40 transition-all duration-500 flex flex-col h-full active:scale-95">
                      <div className={`w-14 h-14 ${styles.bg} rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:rotate-6 transition-transform duration-300`}>
                        {styles.icon}
                      </div>
                      
                      <h3 className="text-xl font-bold text-[#1d1d1f] mb-3 group-hover:text-[#0071e3] transition-colors leading-tight">
                        {services.title}
                      </h3>
                      
                      <p className="text-[#86868b] text-[15px] leading-relaxed line-clamp-3 mb-8 flex-1">
                        {services.description || 'Consulta los detalles de este recurso para miembros de Atalayas.'}
                      </p>

                      <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                        <span className={`text-[11px] font-black uppercase tracking-widest ${styles.color}`}>
                          {styles.label}
                        </span>
                        <div className="flex items-center gap-2 text-[#0071e3] font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                          Ver más <span className="text-lg">→</span>
                        </div>
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