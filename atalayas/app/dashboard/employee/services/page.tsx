'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/ui/Sidebar';
import SearchInput from '@/components/ui/Searchbar';
import { API_ROUTES } from '@/lib/utils';

export default function EmployeeServices() {
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
        setServices(data);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const filtered = services.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (filter === 'PUBLIC') return matchesSearch && s.isPublic;
    if (filter === 'COMPANY') return matchesSearch && !s.isPublic;
    return matchesSearch;
  });
  
  const sortedServices = [...filtered].sort((a,b)=>{
    if(a.isPublic && !b.isPublic) return -1;
    if(!a.isPublic && b.isPublic) return 1;
    return a.title.localeCompare(b.title);

    return 0
  })

  return (
    <div className="flex min-h-screen bg-[#f5f5f7]">
      <Sidebar role="EMPLOYEE" />
      <main className="flex-1 h-screen overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-12">
          
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-[#1d1d1f] tracking-tight">Servicios</h1>
            <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder='Buscar servicios...' />
          </div>

          {/* CHIPS DE FILTRADO */}
          <div className="flex items-center gap-3 mb-10 overflow-x-auto pb-2 no-scrollbar">
            {['ALL', 'PUBLIC', 'COMPANY'].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type as any)}
                className={`shrink-0 px-6 py-2 rounded-full text-sm font-bold transition-all ${
                  filter === type ? 'bg-[#1d1d1f] text-white' : 'bg-white text-[#86868b] border border-gray-200'
                }`}
              >
                {type === 'ALL' ? 'Todos' : type === 'PUBLIC' ? '🌐 Públicos' : `🏭 ${myCompanyName}`}
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
                return (
                  <Link key={service.id} href={`/dashboard/employee/services/${service.id}`}>
                    <div className="group bg-white p-8 rounded-[2.5rem] border border-gray-200/50 shadow-sm hover:shadow-2xl hover:shadow-gray-300/40 transition-all duration-500 flex flex-col h-full active:scale-95">

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
  )
};