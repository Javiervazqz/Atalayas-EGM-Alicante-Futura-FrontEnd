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
  Company?: { name: string };
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<string>('PUBLIC');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(API_ROUTES.SERVICES.GET_ALL, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setServices(Array.isArray(data) ? data : []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchServices();
  }, []);

  // Agrupamos para el dropdown
  const companiesWithServices = services.reduce((acc, s) => {
    if (!s.isPublic && s.Company?.name && s.Company.name !== 'EGM Atalayas') {
      acc.add(s.Company.name);
    }
    return acc;
  }, new Set<string>());

  const dropdownOptions = ['PUBLIC', ...Array.from(companiesWithServices)];

  const currentList = services.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDropdown = selectedCompany === 'PUBLIC' ? s.isPublic : s.Company?.name === selectedCompany;
    return matchesSearch && matchesDropdown;
  });

  return (
    <div className="flex min-h-screen bg-[#f5f5f7]">
      <Sidebar role="GENERAL_ADMIN" />
      <main className="flex-1 p-10 overflow-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-[#1d1d1f] tracking-tight">Servicios</h1>
          <p className="text-[#86868b]">Control de servicios públicos y privados.</p>
        </header>

        <div className="flex flex-col md:flex-row gap-4 mb-2">
          <CompanyDropdown 
            companies={dropdownOptions} 
            selected={selectedCompany} 
            onChange={setSelectedCompany}
            defaultLabel="Público" 
          />
          <div className="relative flex-1 mb-8">
            <input 
              type="text" placeholder="Buscar servicio..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-5 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm outline-none shadow-sm"
            />
          </div>
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#fbfbfd] border-b border-gray-100">
                <th className="px-8 py-5 text-[10px] font-black text-[#86868b] uppercase tracking-widest">Servicio</th>
                <th className="px-8 py-5 text-[10px] font-black text-[#86868b] uppercase tracking-widest">Visibilidad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {currentList.map(service => (
                <tr 
                  key={service.id} 
                  onClick={() => router.push(`/dashboard/administrator/general-admin/services/${service.id}`)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-8 py-5 font-bold text-[#1d1d1f]">{service.title}</td>
                  <td className="px-8 py-5">
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg ${service.isPublic ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                      {service.isPublic ? '🌐 Público' : `🏭 ${service.Company?.name}`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}