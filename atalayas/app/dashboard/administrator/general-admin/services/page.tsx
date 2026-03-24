'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/ui/Sidebar';
import { API_ROUTES } from '@/lib/utils';
import SearchInput from '@/components/ui/Searchbar';
import CompanyDropdown from '@/components/CompanyDropdown';

interface Service {
  id: string;
  title: string;
  description: string;
  isPublic: boolean;
  serviceType: 'INFO' | 'BOOKING';
  Company?: {id: string; name: string};
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'INFO' | 'BOOKING' | 'ANNOUNCEMENT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string>('PUBLIC');
  const [companySearch, setCompanySearch] = useState('');

  // Recuperamos el usuario para el Sidebar
  const user = typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem('user') || '{}') 
    : {};
  const role = user.role || 'ADMIN';

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
      default: return { icon: '📄', label: 'Servicio', color: 'text-gray-600', bg: 'bg-gray-50' };
    }
  };

 const filteredServices = services.filter((s) => {
    const matchesFilter = filter === 'ALL' || s.serviceType === filter;
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

    const publicServices = filteredServices.filter(s => s.isPublic);
    const privateServices = filteredServices.filter(s => !s.isPublic);
    const byCompany = privateServices.reduce((acc, service) => {
    const companyName = service.Company?.name || 'Sin empresa';
    if (!acc[companyName]) acc[companyName] = [];
    acc[companyName].push(service);
    return acc;
    }, {} as Record<string, Service[]>);

    const companies = ['PUBLIC', ...Object.keys(byCompany)];

    const filteredCompanies = companies.filter(c => 
    c === 'PUBLIC' || c.toLowerCase().includes(companySearch.toLowerCase())
    );
 return (
  <div className="flex min-h-screen bg-[#f5f5f7] relative">
    <Sidebar role={role} />
    
    <main className="flex-1 h-screen overflow-y-auto">
      <div className="max-w-6xl mx-auto px-8 py-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
          <div>
            <nav className="flex items-center gap-2 text-sm text-[#86868b] mb-4">
              <Link href="/dashboard/administrator/general-admin" className="hover:text-[#0071e3] transition-colors">Dashboard</Link>
              <span className="opacity-50">/</span>
              <span className="text-[#1d1d1f] font-medium">Servicios</span>
            </nav>
            <h1 className="text-4xl font-bold text-[#1d1d1f] tracking-tight">Servicios</h1>
          </div>
          <div className="flex items-center gap-4">
          <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Buscar servicios..." />
          <Link href="/dashboard/administrator/general-admin/services/new" className="bg-[#0071e3] text-white px-6 py-2.5 rounded-full font-semibold hover:bg-[#0077ed] transition-all shadow-md">
                Nuevo Servicio
          </Link>
          </div>
        </div>

        {/* Selector de empresa */}
        <CompanyDropdown
        companies={companies}
        selected={selectedCompany}
        onChange={setSelectedCompany}
        />

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-64 bg-white rounded-[2.5rem] border border-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {(selectedCompany === 'PUBLIC' ? publicServices : byCompany[selectedCompany] || []).map((service) => {
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
                      <span className={`text-[11px] font-black uppercase tracking-widest ${selectedCompany === 'PUBLIC' ? 'text-green-600' : 'text-gray-400'}`}>
                        {selectedCompany === 'PUBLIC' ? '🌐 Público' : '🔒 Privado'}
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