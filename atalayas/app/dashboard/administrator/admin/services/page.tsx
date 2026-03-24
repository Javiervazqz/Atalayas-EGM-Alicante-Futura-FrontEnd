'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/ui/Sidebar';
import SearchInput from '@/components/ui/Searchbar';
import { API_ROUTES } from '@/lib/utils';

export default function CompanyAdminServices() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PUBLIC' | 'COMPANY'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const myCompanyName = user.Company?.name || 'Mi Empresa';

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

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'INFO': return { icon: 'ℹ️', label: 'Información', color: 'text-blue-600', bg: 'bg-blue-50' };
      case 'BOOKING': return { icon: '📅', label: 'Reserva', color: 'text-purple-600', bg: 'bg-purple-50' };
      default: return { icon: '📄', label: 'Servicio', color: 'text-gray-600', bg: 'bg-gray-50' };
    }
  };

  const filtered = services.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (filter === 'PUBLIC') return matchesSearch && s.isPublic;
    if (filter === 'COMPANY') return matchesSearch && !s.isPublic;
    return matchesSearch;
  });

  const sortedServices = [...filtered].sort((a,b)=>{
    if(!a.isPublic && b.isPublic) return -1;
    if(a.isPublic && !b.isPublic) return 1;

    return 0
  })
  return (
    <div className="flex min-h-screen bg-[#f5f5f7]">
      <Sidebar role="ADMIN" />
      <main className="flex-1 h-screen overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-[#1d1d1f] tracking-tight">Gestión de Servicios</h1>
              <p className="text-[#86868b] mt-1 text-lg">Administra los servicios de {myCompanyName}</p>
            </div>
            <div className="flex items-center gap-4">
              <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder='Buscar servicios...' />
              <Link href="/dashboard/company-admin/services/new" className="bg-[#0071e3] text-white px-6 py-2.5 rounded-full font-semibold hover:bg-[#0077ed] transition-all shadow-md">
                Nuevo Ser
              </Link>
            </div>
          </div>

          {/* CHIPS DE FILTRADO */}
          <div className="flex items-center gap-3 mb-10 overflow-x-auto pb-2 no-scrollbar">
            {[
              { id: 'ALL', label: 'Todos' },
              { id: 'PUBLIC', label: '🌐 Públicos' },
              { id: 'COMPANY', label: `🏭 ${myCompanyName}` }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setFilter(item.id as any)}
                className={`shrink-0 px-6 py-2 rounded-full text-sm font-bold transition-all ${
                  filter === item.id ? 'bg-[#1d1d1f] text-white shadow-lg' : 'bg-white text-[#86868b] border border-gray-200 hover:border-gray-400'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {loading ? (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {[1, 2, 3, 4, 5, 6].map(i => (
      <div key={i} className="h-64 bg-white rounded-[2.5rem] border border-gray-100 animate-pulse" />
    ))}
  </div>
) : (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    
    {sortedServices.map((service) => {
      const styles = getTypeStyles(service.serviceType);
      return (
        <Link key={service.id} href={`/dashboard/administrator/services/${service.id}`}>
          <div className="group bg-white p-8 rounded-[2.5rem] border border-gray-200/50 shadow-sm hover:shadow-2xl hover:shadow-gray-300/40 transition-all duration-500 flex flex-col h-full active:scale-95">
            
            <div className={`w-14 h-14 ${styles.bg} rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:rotate-6 transition-transform duration-300`}>
              {styles.icon}
            </div>
            
            <h3 className="text-xl font-bold text-[#1d1d1f] mb-3 group-hover:text-[#0071e3] transition-colors leading-tight">
              {service.title}
            </h3>
            
            <p className="text-[#86868b] text-[15px] leading-relaxed line-clamp-3 mb-8 flex-1">
              {service.description || 'Sin descripción.'}
            </p>
            
            <div className="flex items-center justify-between pt-6 border-t border-gray-50">
              <span className={`text-[11px] font-black uppercase tracking-widest ${service.isPublic ? 'text-green-600' : 'text-gray-400'}`}>
                {service.isPublic ? '🌐 Público' : '🔒 Privado'}
              </span>
              <span className={`text-[11px] font-black uppercase tracking-widest ${styles.color}`}>
                {styles.label}
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