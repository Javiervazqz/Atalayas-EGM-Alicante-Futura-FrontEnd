'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import CompanyDropdown from '@/components/ui/CompanyDropdown';
import { API_ROUTES } from '@/lib/utils';

interface Company {
  id: string;
  name: string;
  cif: string | null;
  activity: string | null;
  address: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  logoUrl: string | null;
  website: string | null;
  _count?: { 
    User: number; 
    Course: number; 
    Service: number; 
    Document: number;
  };
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(API_ROUTES.COMPANIES.GET_ALL, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        console.log("DATOS RECIBIDOS:", data[1]); // Mira si el primer objeto tiene cif, activity, etc.
        // Filtramos la EGM pero mantenemos el resto para gestión
        const filtered = Array.isArray(data) ? data.filter(c => c.name !== 'EGM Atalayas') : [];
        setCompanies(filtered);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const dropdownOptions = ['ALL', ...companies.map(c => c.name)];

  const filteredList = companies.filter(c => {
    const matchesDropdown = selectedCompany === 'ALL' || c.name === selectedCompany;
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.cif?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.activity?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDropdown && matchesSearch;
  });

  return (
    <div className="flex min-h-screen bg-[#f5f5f7]">
      <Sidebar role="GENERAL_ADMIN" />
      <main className="flex-1 p-10 overflow-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-[#1d1d1f] tracking-tight">Directorio de Empresas</h1>
          <p className="text-[#86868b]">Censo completo y activos vinculados al polígono.</p>
        </header>

        <div className="flex flex-col md:flex-row gap-4 mb-2">
          <CompanyDropdown 
            companies={dropdownOptions} 
            selected={selectedCompany} 
            onChange={setSelectedCompany}
            defaultLabel="Todas las empresas" 
          />
          <div className="relative flex-1 mb-8">
            <input 
              type="text" 
              placeholder="Buscar por nombre, CIF o sector..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-5 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm outline-none shadow-sm focus:border-blue-400 transition-all"
            />
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/30">
                <th className="px-8 py-5 text-[10px] font-black text-[#86868b] uppercase tracking-widest">Empresa / Actividad</th>
                <th className="px-6 py-5 text-[10px] font-black text-[#86868b] uppercase tracking-widest">CIF e Identificación</th>
                <th className="px-6 py-5 text-[10px] font-black text-[#86868b] uppercase tracking-widest">Contacto</th>
                <th className="px-6 py-5 text-[10px] font-black text-[#86868b] uppercase tracking-widest text-center">Activos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={4} className="p-20 text-center animate-pulse text-gray-400">Cargando censo empresarial...</td></tr>
              ) : filteredList.length === 0 ? (
                <tr><td colSpan={4} className="p-20 text-center text-gray-400">No se han encontrado empresas.</td></tr>
              ) : (
                filteredList.map(company => (
                  <tr key={company.id} className="hover:bg-gray-50/50 transition-colors group">
                    {/* EMPRESA Y LOGO */}
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                          {company.logoUrl ? (
                            <img src={company.logoUrl} alt={company.name} className="w-full h-full object-contain p-1" />
                          ) : (
                            <span className="text-blue-600 font-bold text-lg">{company.name.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#1d1d1f]">{company.name}</p>
                          <p className="text-[11px] text-blue-500 font-bold uppercase tracking-tight">{company.activity || 'Sin sector'}</p>
                        </div>
                      </div>
                    </td>

                    {/* CIF Y DIRECCIÓN */}
                    <td className="px-6 py-6 text-sm">
                      <p className="font-mono text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded inline-block text-[12px] mb-1">
                        {company.cif || 'Sin CIF'}
                      </p>
                      <p className="text-[11px] text-gray-400 truncate max-w-[200px]" title={company.address || ''}>
                        {company.address || 'Sin dirección'}
                      </p>
                    </td>

                    {/* CONTACTO */}
                    <td className="px-6 py-6">
                      <div className="flex flex-col gap-1">
                        {company.contactEmail ? (
                          <a href={`mailto:${company.contactEmail}`} className="text-[12px] text-[#1d1d1f] hover:text-blue-600 font-medium">
                            {company.contactEmail}
                          </a>
                        ) : <span className="text-[12px] text-gray-300 italic">Sin email</span>}
                        <p className="text-[11px] text-gray-400">{company.contactPhone || 'Sin número'}</p>
                      </div>
                    </td>

                    {/* MÉTRICAS (PRISMA _COUNT) */}
                    <td className="px-6 py-6">
                      <div className="flex items-center justify-center gap-4">
                        <div className="text-center">
                          <p className="text-[13px] font-bold text-[#1d1d1f] leading-none">{company._count?.User || 0}</p>
                          <p className="text-[9px] font-black text-gray-400 uppercase mt-1">Empleados</p>
                        </div>
                      </div>
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