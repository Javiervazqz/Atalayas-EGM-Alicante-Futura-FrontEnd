'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import PageHeader from '@/components/ui/pageHeader';
import { API_ROUTES } from '@/lib/utils';
import mediumZoom from 'medium-zoom';
import ContactCard from '@/components/ui/ContactCard';

const inputClass = "w-full px-5 py-3 bg-background border border-input focus:border-primary focus:ring-4 focus:ring-primary/5 rounded-xl outline-none transition-all text-sm font-medium placeholder:text-muted-foreground/50 shadow-sm";

export default function AdminServiceDetail() {
  const params = useParams();
  const router = useRouter();
  const zoomRef = useRef<HTMLImageElement>(null);

  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<{ title?: string }>({});

  const [formData, setFormData] = useState({
    title: '', description: '', mediaUrl: '',
    providerName: '', phone: '', email: '',
    address: '', schedule: '', externalUrl: '', price: '',
  });

  useEffect(() => {
    const fetchService = async () => {
      if (typeof params.id !== 'string') return;
      try {
        const res = await fetch(API_ROUTES.SERVICES.GET_BY_ID(params.id), {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await res.json();
        setService(data);
        hydrateForm(data);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchService();
  }, [params.id]);

  const hydrateForm = (svc: any) => {
    setFormData({
      title: svc.title || '', description: svc.description || '', mediaUrl: svc.mediaUrl || '',
      providerName: svc.providerName || '', phone: svc.phone || '', email: svc.email || '',
      address: svc.address || '', schedule: svc.schedule || '',
      externalUrl: svc.externalUrl || '', price: svc.price || '',
    });
  };

  // --- SOLUCIÓN AL ERROR DE TYPESCRIPT ---
  useEffect(() => {
    if (zoomRef.current && service?.mediaUrl && !isEditing) {
      const zoom = mediumZoom(zoomRef.current, { background: 'rgba(0,0,0,0.8)', margin: 24 });
      
      // Envolvemos en llaves para asegurar que la función devuelva void
      return () => { 
        zoom.detach(); 
      };
    }
  }, [service?.mediaUrl, isEditing]);

  const handleSave = async () => {
    setErrors({});
    if (!formData.title.trim()) { setErrors({ title: 'El título es obligatorio' }); return; }

    setSaving(true);
    try {
      const res = await fetch(API_ROUTES.SERVICES.GET_BY_ID(params.id as string), {
        method: 'PATCH',
        headers: { 
            'Content-Type': 'application/json', 
            Authorization: `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const updated = await res.json();
        setService(updated);
        setIsEditing(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => { hydrateForm(service); setErrors({}); setIsEditing(false); };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(API_ROUTES.SERVICES.GET_BY_ID(params.id as string), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.ok) router.push('/dashboard/administrator/admin/services');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) return (
    <div className="flex min-h-screen bg-background items-center justify-center font-sans">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!service) return null;

  const canEdit = service && !service.isPublic;
  const hasContactInfo = service && (service.providerName || service.phone || service.email || service.address || service.schedule || service.price || service.externalUrl);

  return (
    <div className="flex min-h-screen bg-background font-sans text-foreground">
      <Sidebar role="ADMIN" />

      <main className="flex-1 overflow-auto flex flex-col relative">
        <PageHeader 
          title={isEditing ? "Editando Servicio" : service.title}
          description={isEditing ? "Modifica los datos del servicio corporativo." : "Vista de gestión y contacto del servicio."}
          icon={<i className="bi bi-briefcase"></i>}
          backUrl="/dashboard/administrator/admin/services"
          action={
            canEdit && (
              <div className="flex items-center gap-3">
                {saveSuccess && <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest animate-pulse">Guardado</span>}
                {!isEditing ? (
                  <>
                    <button onClick={() => setIsEditing(true)} className="bg-secondary text-secondary-foreground px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2 shadow-sm">
                      <i className="bi bi-pencil-square"></i> Editar
                    </button>
                    <button onClick={() => setShowDeleteModal(true)} className="bg-white/10 text-white hover:bg-destructive hover:text-white w-9 h-9 rounded-xl transition-all flex items-center justify-center border border-white/10">
                      <i className="bi bi-trash3"></i>
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={handleSave} disabled={saving} className="bg-secondary text-secondary-foreground px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2 shadow-sm">
                      {saving ? <i className="bi bi-arrow-repeat animate-spin"></i> : <i className="bi bi-cloud-arrow-up"></i>} Guardar
                    </button>
                    <button onClick={handleDiscard} className="text-white/60 hover:text-white text-xs font-bold px-3">Descartar</button>
                  </>
                )}
              </div>
            )
          }
        />

        <div className="p-6 lg:p-10 flex-1 max-w-6xl mx-auto w-full">
          <div className={`grid grid-cols-1 ${!isEditing && hasContactInfo ? 'lg:grid-cols-[1fr_320px]' : ''} gap-12`}>
            
            <div className="space-y-8">
              {isEditing ? (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="bg-card rounded-3xl border border-border p-6 lg:p-8 space-y-6 shadow-sm">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Título del servicio</label>
                      <input 
                        value={formData.title} 
                        onChange={e => setFormData({...formData, title: e.target.value})} 
                        className={`${inputClass} text-base font-bold ${errors.title ? 'border-destructive' : ''}`} 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Descripción</label>
                      <textarea 
                        rows={8} 
                        value={formData.description} 
                        onChange={e => setFormData({...formData, description: e.target.value})} 
                        className={`${inputClass} leading-relaxed resize-none`} 
                      />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">URL Imagen Portada</label>
                        <input value={formData.mediaUrl} onChange={e => setFormData({...formData, mediaUrl: e.target.value})} className={inputClass} placeholder="https://..." />
                    </div>
                  </div>

                  <div className="bg-card rounded-3xl border border-border p-6 lg:p-8 space-y-4 shadow-sm">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-foreground">Detalles de Contacto</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input value={formData.providerName} onChange={e => setFormData({...formData, providerName: e.target.value})} className={inputClass} placeholder="Proveedor" />
                      <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className={inputClass} placeholder="Teléfono" />
                      <input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={inputClass} placeholder="Email" />
                      <input value={formData.schedule} onChange={e => setFormData({...formData, schedule: e.target.value})} className={inputClass} placeholder="Horario" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-10 animate-in fade-in duration-500">
                  <div className="prose prose-slate max-w-none">
                    <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">{service.description}</p>
                  </div>
                  {service.mediaUrl && (
                    <div className="overflow-hidden rounded-3xl border border-border shadow-md">
                      <img ref={zoomRef} src={service.mediaUrl} alt={service.title} className="w-full h-auto cursor-zoom-in hover:opacity-95 transition-opacity" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {!isEditing && hasContactInfo && (
              <aside className="sticky top-8 space-y-6">
                <ContactCard service={service} />
              </aside>
            )}
          </div>
        </div>
      </main>

      {/* MODAL DE ELIMINACIÓN */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-card rounded-[2rem] p-10 max-w-sm w-full shadow-2xl border border-border text-center animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6 text-2xl"><i className="bi bi-trash3"></i></div>
            <h3 className="text-xl font-bold text-foreground mb-2">¿Eliminar servicio?</h3>
            <p className="text-sm text-muted-foreground mb-8">Esta acción borrará permanentemente los datos del servicio corporativo.</p>
            <div className="flex flex-col gap-3">
              <button onClick={handleDelete} disabled={deleting} className="w-full py-3.5 rounded-xl font-bold bg-destructive text-white hover:opacity-90 shadow-lg shadow-destructive/20 text-sm transition-all">
                {deleting ? 'Borrando...' : 'Eliminar permanentemente'}
              </button>
              <button onClick={() => setShowDeleteModal(false)} className="w-full py-3.5 rounded-xl font-bold text-muted-foreground hover:bg-muted transition-colors text-sm">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}