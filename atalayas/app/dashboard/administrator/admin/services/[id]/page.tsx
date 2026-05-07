'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import PageHeader from '@/components/ui/pageHeader';
import ContactCard from '@/components/ui/ContactCard';
import { API_ROUTES } from '@/lib/utils';
import mediumZoom from 'medium-zoom';

const inputClass = "w-full px-4 py-3 bg-background border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl outline-none transition-all text-sm font-medium placeholder:text-muted-foreground/50 shadow-sm";

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

  useEffect(() => {
    if (zoomRef.current && service?.mediaUrl && !isEditing) {
      const zoom = mediumZoom(zoomRef.current, { background: 'rgba(0,0,0,0.8)', margin: 24 });
      return () => { zoom.detach(); };
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
      <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!service) return null;

  const canModify = service && !service.isPublic;
  const hasContactInfo = !!(service.providerName || service.phone || service.email || service.address || service.externalUrl || service.price);

  return (
    <div className="flex min-h-screen w-full bg-background font-sans text-foreground overflow-hidden">
      <Sidebar role="ADMIN" />

      <main className="flex-1 flex flex-col relative w-full overflow-y-auto overflow-x-hidden no-scrollbar">
        <PageHeader 
          title={isEditing ? "Editando Servicio" : service.title}
          description={
            <span className="hidden sm:block">
              {isEditing ? "Modifica los detalles del servicio corporativo." : (service.isPublic ? "Servicio oficial Atalayas EGM" : "Servicio privado de empresa")}
            </span> as any
          }
          icon={<i className={`bi ${isEditing ? 'bi-pencil-square' : 'bi-briefcase-fill'}`}></i>}
          backUrl="/dashboard/administrator/admin/services"
          action={
            canModify && (
              <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                {saveSuccess && <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest animate-pulse hidden sm:inline">Guardado</span>}
                
                {!isEditing ? (
                  <>
                    <button onClick={() => setIsEditing(true)} className="bg-secondary text-secondary-foreground px-3 sm:px-5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-sm shrink-0">
                      <i className="bi bi-pencil text-sm"></i>
                      <span className="hidden sm:inline">Editar</span>
                    </button>
                    <button onClick={() => setShowDeleteModal(true)} className="bg-card text-muted-foreground hover:bg-destructive hover:text-white border border-border hover:border-destructive w-8 h-8 sm:w-9 sm:h-9 rounded-xl transition-all flex items-center justify-center shadow-sm shrink-0">
                      <i className="bi bi-trash3 text-sm"></i>
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={handleSave} disabled={saving} className="bg-secondary text-secondary-foreground px-3 sm:px-5 py-2 rounded-xl text-xs font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-sm shrink-0">
                      {saving ? <i className="bi bi-arrow-repeat animate-spin text-sm"></i> : <i className="bi bi-check-lg text-sm"></i>} 
                      <span className="hidden sm:inline">Guardar</span>
                    </button>
                    <button onClick={() => { hydrateForm(service); setIsEditing(false); }} className="bg-card sm:bg-transparent border sm:border-none border-border text-muted-foreground hover:text-foreground hover:bg-muted sm:hover:bg-transparent w-8 h-8 sm:w-auto sm:h-auto rounded-xl sm:px-3 text-xs font-semibold transition-colors flex items-center justify-center shrink-0">
                      <span className="hidden sm:inline">Cancelar</span>
                      <i className="bi bi-x-lg sm:hidden text-sm"></i>
                    </button>
                  </>
                )}
              </div>
            )
          }
        />

        <div className="p-4 sm:p-6 lg:p-10 flex-1">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">

              {/* COLUMNA IZQUIERDA */}
              <div className="lg:col-span-7 space-y-8">
                {isEditing && canModify ? (
                  <section className="bg-card border border-border rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 lg:p-10 shadow-sm space-y-6 animate-in fade-in duration-300">
                    <h3 className="text-xl font-bold tracking-tight">Información Principal</h3>
                    
                    <div className="space-y-5">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground ml-1">Título del servicio</label>
                        <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className={`${inputClass} text-base font-bold ${errors.title ? 'border-destructive' : ''}`} />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground ml-1">Descripción detallada</label>
                        <textarea rows={8} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className={`${inputClass} leading-relaxed resize-none`} />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground ml-1">URL Imagen Portada</label>
                        <input value={formData.mediaUrl} onChange={e => setFormData({...formData, mediaUrl: e.target.value})} className={inputClass} placeholder="https://..." />
                      </div>
                    </div>
                  </section>
                ) : (
                  <section className="bg-card border border-border rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 lg:p-10 shadow-sm animate-in fade-in duration-500">
                    <div className="flex items-center gap-3 mb-6">
                      <span className={`text-[10px] font-semibold px-3 py-1 rounded-md uppercase tracking-wider border ${service.isPublic ? 'bg-primary/5 text-primary border-primary/20' : 'bg-secondary/5 text-secondary border-secondary/20'}`}>
                        {service.isPublic ? 'Global' : 'Privado'}
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-bold mb-6 tracking-tight leading-tight">{service.title}</h2>
                    <div className="prose prose-slate dark:prose-invert max-w-none">
                      <p className="text-muted-foreground text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-medium">
                        {service.description || 'Sin descripción disponible.'}
                      </p>
                    </div>

                    {service.mediaUrl && (
                      <div className="overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] border border-border shadow-sm group mt-8">
                        <img ref={zoomRef} src={service.mediaUrl} alt={service.title} className="w-full h-auto cursor-zoom-in hover:opacity-95 transition-opacity" />
                      </div>
                    )}
                  </section>
                )}
              </div>

              {/* COLUMNA DERECHA */}
              <aside className="lg:col-span-5">
                <div className="sticky top-8 space-y-8">
                  {isEditing && canModify ? (
                    <section className="bg-card border border-border rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-sm space-y-5 animate-in slide-in-from-right-4 duration-300">
                      <h3 className="text-lg font-bold tracking-tight">Contacto y Enlaces</h3>
                      
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground ml-1">Proveedor</label>
                          <input value={formData.providerName} onChange={e => setFormData({...formData, providerName: e.target.value})} className={inputClass} placeholder="Ej: Nombre Empresa" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground ml-1">Teléfono</label>
                          <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className={inputClass} placeholder="600 000 000" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground ml-1">Email</label>
                          <input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={inputClass} placeholder="contacto@servicios.com" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground ml-1">Horario</label>
                          <input value={formData.schedule} onChange={e => setFormData({...formData, schedule: e.target.value})} className={inputClass} placeholder="Lunes a Viernes..." />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground ml-1">URL Enlace Externo</label>
                          <input value={formData.externalUrl} onChange={e => setFormData({...formData, externalUrl: e.target.value})} className={inputClass} placeholder="https://..." />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground ml-1">Precio / Tarifa</label>
                          <input value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className={inputClass} placeholder="Ej: 30€ o Gratis" />
                        </div>
                      </div>
                    </section>
                  ) : (
                    hasContactInfo && (
                      <div className="animate-in fade-in slide-in-from-right-4 duration-700">
                        <ContactCard service={service} />
                      </div>
                    )
                  )}
                </div>
              </aside>

            </div>
          </div>
        </div>
      </main>

      {/* MODAL DE ELIMINACIÓN */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-card rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border border-border text-center animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6 text-2xl"><i className="bi bi-trash3"></i></div>
            <h3 className="text-xl font-bold text-foreground mb-2">¿Eliminar servicio?</h3>
            <p className="text-sm text-muted-foreground mb-8">Esta acción es irreversible y el servicio dejará de ser visible para los empleados.</p>
            <div className="flex flex-col gap-3">
              <button onClick={handleDelete} disabled={deleting} className="w-full py-3.5 rounded-xl font-semibold bg-destructive text-white hover:opacity-90 shadow-sm text-sm transition-all">
                {deleting ? 'Borrando...' : 'Confirmar Eliminación'}
              </button>
              <button onClick={() => setShowDeleteModal(false)} className="w-full py-3.5 rounded-xl font-semibold border border-border text-foreground hover:bg-muted transition-colors text-sm">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}