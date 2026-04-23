'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import PageHeader from '@/components/ui/pageHeader';
import CompanyDropdown from '@/components/ui/CompanyDropdown';
import { API_ROUTES } from '@/lib/utils';
import mediumZoom from 'medium-zoom';
import ContactCard from '@/components/ui/ContactCard';

const inputClass = "w-full px-5 py-3 bg-background border border-input focus:border-primary focus:ring-4 focus:ring-primary/5 rounded-xl outline-none transition-all text-sm font-medium placeholder:text-muted-foreground/50 shadow-sm";

export default function GeneralAdminServiceDetail() {
  const params = useParams();
  const router = useRouter();
  const zoomRef = useRef<HTMLImageElement>(null);

  const [service, setService] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<{ title?: string }>({});

  const [formData, setFormData] = useState({
    title: '', description: '', mediaUrl: '',
    isPublic: true, companyId: '',
    providerName: '', phone: '', email: '',
    address: '', schedule: '', externalUrl: '', price: '',
  });
  const [selectedCompany, setSelectedCompany] = useState<string>('PUBLIC');

  useEffect(() => {
    const fetchAll = async () => {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const [svcRes, compRes] = await Promise.all([
        fetch(API_ROUTES.SERVICES.GET_BY_ID(params.id as string), { headers }),
        fetch(API_ROUTES.COMPANIES.GET_ALL, { headers }),
      ]);
      const svcData = await svcRes.json();
      const compData = await compRes.json();
      setService(svcData);
      setCompanies(compData);
      hydrateForm(svcData, compData);
      setLoading(false);
    };
    if (params.id) fetchAll();
  }, [params.id]);

  const hydrateForm = (svc: any, comps: any[]) => {
    const matched = comps.find((c: any) => c.id === svc.companyId);
    setFormData({ ...svc, isPublic: svc.isPublic ?? true });
    setSelectedCompany(svc.isPublic === false && matched ? matched.name : 'PUBLIC');
  };

  useEffect(() => {
    if (zoomRef.current && service?.mediaUrl && !isEditing) {
      const zoom = mediumZoom(zoomRef.current, { background: 'rgba(0,0,0,0.8)', margin: 24 });
      return () => { zoom.detach(); }; // ✅ Corregido el error de limpieza
    }
  }, [service?.mediaUrl, isEditing]);

  const handleSave = async () => {
    if (!formData.title.trim()) return setErrors({ title: 'Obligatorio' });
    setSaving(true);
    try {
      const res = await fetch(API_ROUTES.SERVICES.GET_BY_ID(params.id as string), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const updated = await res.json();
        setService(updated);
        setIsEditing(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex min-h-screen bg-background items-center justify-center font-sans">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background font-sans text-foreground">
      <Sidebar role="GENERAL_ADMIN" />
      <main className="flex-1 overflow-auto flex flex-col relative">
        <PageHeader 
          title={isEditing ? "Editando Servicio" : service.title}
          description="Gestión centralizada del catálogo de servicios."
          icon={<i className="bi bi-briefcase"></i>}
          backUrl="/dashboard/administrator/general-admin/services"
          action={
            <div className="flex items-center gap-3">
              {saveSuccess && <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest animate-pulse">Guardado</span>}
              {!isEditing ? (
                <>
                  <button onClick={() => setIsEditing(true)} className="bg-secondary text-secondary-foreground px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2 shadow-sm"><i className="bi bi-pencil-square"></i> Editar</button>
                  <button onClick={() => setShowDeleteModal(true)} className="bg-white/10 text-white hover:bg-destructive w-9 h-9 rounded-xl transition-all flex items-center justify-center border border-white/10"><i className="bi bi-trash3"></i></button>
                </>
              ) : (
                <>
                  <button onClick={handleSave} disabled={saving} className="bg-secondary text-secondary-foreground px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 flex items-center gap-2 shadow-sm">{saving ? <i className="bi bi-arrow-repeat animate-spin"></i> : <i className="bi bi-cloud-arrow-up"></i>} Guardar</button>
                  <button onClick={() => { hydrateForm(service, companies); setIsEditing(false); }} className="text-white/60 hover:text-white text-xs font-bold px-3 transition-colors">Descartar</button>
                </>
              )}
            </div>
          }
        />

        <div className="p-6 lg:p-10 flex-1 max-w-6xl mx-auto w-full">
          <div className={`grid grid-cols-1 ${!isEditing ? 'lg:grid-cols-[1fr_320px]' : ''} gap-12`}>
            <div className="space-y-8">
              {isEditing ? (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="bg-card rounded-3xl border border-border p-8 space-y-6 shadow-sm">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Visibilidad</label>
                    <CompanyDropdown 
                      companies={['PUBLIC', ...companies.map(c => c.name)]} 
                      selected={selectedCompany} 
                      onChange={(val) => { 
                        setSelectedCompany(val); 
                        setFormData({...formData, isPublic: val === 'PUBLIC', companyId: companies.find(c => c.name === val)?.id || ''});
                      }} 
                    />
                    <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className={`${inputClass} text-base font-bold`} placeholder="Título..." />
                    <textarea rows={8} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className={`${inputClass} leading-relaxed resize-none`} placeholder="Descripción..." />
                  </div>
                </div>
              ) : (
                <div className="space-y-10">
                <div className="prose prose-slate max-w-none">
                  <p className="text-[17px] leading-relaxed text-slate-800 font-medium whitespace-pre-wrap mb-10">
                    {service.description || 'Sin descripción redactada.'}</p></div>
                    {service.mediaUrl && <div className="overflow-hidden rounded-3xl border border-border shadow-md"><img ref={zoomRef} src={service.mediaUrl} alt={service.title} className="w-full h-auto cursor-zoom-in" /></div>}
                    </div>
                )}
            </div>
            {!isEditing && <aside className="sticky top-8"><ContactCard service={service} /></aside>}
          </div>
        </div>
      </main>
    </div>
  );
}