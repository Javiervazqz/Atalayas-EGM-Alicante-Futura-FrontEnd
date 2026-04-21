'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import PageHeader from '@/components/ui/pageHeader';
import { API_ROUTES } from '@/lib/utils';
import CompanyDropdown from '@/components/ui/CompanyDropdown';

export default function NewGeneralService() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('PUBLIC');
  const [errors, setErrors] = useState<{ title?: string }>({});

  const [formData, setFormData] = useState({
    title: '', description: '', mediaUrl: '', isPublic: true, companyId: '',
    providerName: '', email: '', phone: '', address: '', schedule: '', externalUrl: '', price: '',
  });

  useEffect(() => {
    const fetchCompanies = async () => {
      const res = await fetch(API_ROUTES.COMPANIES.GET_ALL, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      setCompanies(data);
    };
    fetchCompanies();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.title.trim()) return setErrors({ title: 'Obligatorio' });

    setLoading(true);
    try {
      const res = await fetch(API_ROUTES.SERVICES.CREATE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(formData),
      });
      if (res.ok) router.push('/dashboard/administrator/general-admin/services');
    } finally { setLoading(false); }
  };

  const inputClass = 'w-full px-5 py-3 bg-background border border-input focus:border-primary focus:ring-4 focus:ring-primary/5 rounded-xl outline-none transition-all text-sm font-medium shadow-sm';

  return (
    <div className="flex min-h-screen bg-background font-sans text-foreground">
      <Sidebar role="GENERAL_ADMIN" />

      <main className="flex-1 overflow-auto flex flex-col relative">
        <PageHeader 
          title="Nuevo Servicio Global"
          description="Añade un servicio al catálogo general o a una empresa específica."
          icon={<i className="bi bi-briefcase"></i>}
          backUrl="/dashboard/administrator/general-admin/services"
        />

        <div className="p-6 lg:p-10 max-w-4xl mx-auto w-full">
          <form onSubmit={handleSubmit} className="space-y-8">
            <section className="bg-card p-6 lg:p-10 rounded-3xl border border-border shadow-sm space-y-6">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Configuración de Visibilidad</label>
              <CompanyDropdown 
                companies={['PUBLIC', ...companies.map(c => c.name)]} 
                selected={selectedCompany} 
                onChange={(val) => { 
                  setSelectedCompany(val); 
                  setFormData({...formData, isPublic: val === 'PUBLIC', companyId: companies.find(c => c.name === val)?.id || ''});
                }} 
              />

              <div className="space-y-2 pt-4 border-t border-border/50">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Información Básica</label>
                <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className={`${inputClass} text-base font-bold`} placeholder="Título del servicio..." />
                <textarea rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className={`${inputClass} resize-none`} placeholder="Descripción detallada..." />
                <input value={formData.mediaUrl} onChange={e => setFormData({...formData, mediaUrl: e.target.value})} className={inputClass} placeholder="URL Imagen (https://...)" />
              </div>
            </section>

            <div className="pt-4 flex justify-end items-center gap-4">
              <button type="button" onClick={() => router.back()} className="px-5 py-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-all uppercase">Cancelar</button>
              <button type="submit" disabled={loading} className="px-8 py-3 bg-secondary text-secondary-foreground rounded-xl font-bold text-xs uppercase tracking-widest hover:opacity-90 shadow-lg transition-all disabled:opacity-50">
                {loading ? 'Publicando...' : 'Publicar Servicio'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}