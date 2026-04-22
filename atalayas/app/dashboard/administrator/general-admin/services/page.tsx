'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import CompanyDropdown from '@/components/ui/CompanyDropdown';
import { API_ROUTES } from '@/lib/utils';

interface Service {
  id: string;
  title: string;
  isPublic: boolean;
  Company?: {
    name: string;
  };
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<string>('PUBLIC');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const res = await fetch(API_ROUTES.SERVICES.GET_ALL, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        const data = await res.json();
        setServices(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const companiesWithServices = services.reduce((acc, s) => {
    if (!s.isPublic && s.Company?.name && s.Company.name !== 'EGM Atalayas') {
      acc.add(s.Company.name);
    }
    return acc;
  }, new Set<string>());

  const dropdownOptions = ['PUBLIC', ...Array.from(companiesWithServices)];

  const filteredList = services.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDropdown = selectedCompany === 'PUBLIC' 
      ? s.isPublic 
      : s.Company?.name === selectedCompany;
    return matchesSearch && matchesDropdown;
  });

  return (
    <div className="flex min-h-screen bg-[#f5f5f7]">
      <Sidebar role="GENERAL_ADMIN" />

      <main className="flex-1 p-10 overflow-auto">
        {/* HEADER PRINCIPAL */}
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-[#1d1d1f] tracking-tight">Servicios</h1>
            <p className="text-[#86868b] mt-1 text-sm font-medium">
              Control de servicios públicos y privados de las empresas.
            </p>
          </div>

          <button 
            onClick={() => router.push('/dashboard/administrator/general-admin/services/new')}
            className="flex items-center justify-center gap-2 bg-[#0071e3] hover:bg-[#0077ed] text-white px-6 py-3 rounded-full text-sm font-bold transition-all shadow-md active:scale-95 shrink-0"
          >
            <i className="bi bi-plus-lg"></i>
            Nuevo Servicio
          </button>
        </header>

        {/* FILTRO SUPERIOR (Categoría/Empresa) */}
        <div className="mb-12">
            <div className="w-full md:w-64">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Filtrar por Empresa</p>
                <CompanyDropdown 
                    companies={dropdownOptions} 
                    selected={selectedCompany} 
                    onChange={setSelectedCompany}
                    defaultLabel="Público" 
                />
            </div>
        </div>

        {/* BUSCADOR (Más abajo, justo antes de la tabla) */}
        <div className="mb-6 flex items-center justify-between">
            <div className="relative w-full max-w-md">
                <i className="bi bi-search absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                <input 
                    type="text" 
                    placeholder="Buscar servicio..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-6 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm outline-none shadow-sm focus:border-[#0071e3] focus:ring-4 focus:ring-blue-50 transition-all"
                />
            </div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter mr-2">
                {filteredList.length} resultados
            </span>
        </div>

        {/* TABLA */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#fbfbfd] border-b border-gray-100">
                <th className="px-10 py-6 text-[11px] font-black text-[#86868b] uppercase tracking-[0.15em]">Servicio</th>
                <th className="px-10 py-6 text-[11px] font-black text-[#86868b] uppercase tracking-[0.15em]">Visibilidad</th>
                <th className="px-10 py-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-10 py-6"><div className="h-4 bg-gray-100 rounded w-48"></div></td>
                    <td className="px-10 py-6"><div className="h-6 bg-gray-100 rounded-lg w-32"></div></td>
                    <td className="px-10 py-6"></td>
                  </tr>
                ))
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-10 py-20 text-center text-gray-400 font-medium">
                    No se han encontrado servicios.
                  </td>
                </tr>
              ) : (
                filteredList.map((service) => (
                  <tr 
                    key={service.id} 
                    onClick={() => router.push(`/dashboard/administrator/general-admin/services/${service.id}`)}
                    className="hover:bg-gray-50/80 cursor-pointer transition-all group"
                  >
                    <td className="px-10 py-6">
                      <span className="font-bold text-[#1d1d1f] text-[15px] group-hover:text-[#0071e3]">
                        {service.title}
                      </span>
                    </td>
                    <td className="px-10 py-6">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase px-3 py-1.5 rounded-full ${
                        service.isPublic 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'bg-gray-100 text-gray-600'
                      }`}>
                        {service.isPublic ? '🌐 Público' : `🏭 ${service.Company?.name || 'Privado'}`}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <i className="bi bi-chevron-right text-gray-300 group-hover:text-[#0071e3]"></i>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}