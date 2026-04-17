'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import { API_ROUTES } from '@/lib/utils';
import mediumZoom from 'medium-zoom';
import ContactCard from '@/components/ui/ContactCard';
import Link from 'next/link';

const inputClass = "w-full px-5 py-4 bg-background border border-input focus:border-primary focus:ring-2 focus:ring-ring rounded-2xl outline-none transition-all text-foreground text-sm font-medium placeholder:text-muted-foreground/50";

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
      const zoom = mediumZoom(zoomRef.current, { background: 'rgba(250,250,249,0.95)', margin: 24 });
      return () => { zoom.detach(); };
    }
  }, [service?.mediaUrl, isEditing]);

  const handleSave = async () => {
    setErrors({});
    if (!formData.title.trim()) { setErrors({ title: 'El título es obligatorio' }); return; }

    setSaving(true);
    const clean = (v: string) => v.trim() || null;
    try {
      const res = await fetch(API_ROUTES.SERVICES.GET_BY_ID(params.id as string), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({
          title: formData.title, description: clean(formData.description), mediaUrl: clean(formData.mediaUrl),
          providerName: clean(formData.providerName), phone: clean(formData.phone), email: clean(formData.email),
          address: clean(formData.address), schedule: clean(formData.schedule),
          externalUrl: clean(formData.externalUrl), price: clean(formData.price),
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setService(updated);
        setIsEditing(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        const err = await res.json();
        alert(`Error: ${err.message || 'No se pudo guardar'}`);
      }
    } catch { alert('No se pudo conectar con el servidor.'); }
    finally { setSaving(false); }
  };

  const handleDiscard = () => { hydrateForm(service); setErrors({}); setIsEditing(false); };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(API_ROUTES.SERVICES.GET_BY_ID(params.id as string), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.ok) { router.push('/dashboard/administrator/admin/services'); router.refresh(); }
      else alert('No se pudo eliminar el servicio.');
    } catch { alert('Error de conexión.'); }
    finally { setDeleting(false); setShowDeleteModal(false); }
  };

  const set = (key: string, value: string) => setFormData(prev => ({ ...prev, [key]: value }));
  const canEdit = service && !service.isPublic; 
  const hasContactInfo = service && (service.providerName || service.phone || service.email || service.address || service.schedule || service.price || service.externalUrl);

  if (loading) return (
    <div className="flex min-h-screen bg-background items-center justify-center font-sans">
      <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!service) return null;

  return (
    <div className="flex min-h-screen bg-background font-sans">
      <Sidebar role="ADMIN" />

      <main className="flex-1 h-screen overflow-y-auto">

        {/* HEADER */}
        <div className="bg-card border-b border-border py-8 lg:py-10">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <button onClick={() => router.back()}
              className="flex items-center gap-1 text-secondary text-sm font-bold hover:opacity-80 transition-opacity mb-6">
              <i className="bi bi-chevron-left"></i> Volver a servicios
            </button>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-3xl flex items-center justify-center text-3xl flex-shrink-0">
                  <i className="bi bi-briefcase"></i>
                </div>
                <div className="flex-1 min-w-[250px]">
                  <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight mb-2">
                    {service.title}
                  </h1>
                  <span className={`inline-flex items-center text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${service.isPublic ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground border border-border'}`}>
                    {service.isPublic ? '🌐 Público' : '🏢 Tu empresa'}
                  </span>
                </div>
              </div>

              {saveSuccess && (
                <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full border border-primary/20 animate-in fade-in duration-300">
                  <i className="bi bi-check-circle"></i> Cambios guardados
                </span>
              )}

              {/* Botones solo si puede editar */}
              {canEdit && (
                <div className="flex items-center gap-3 shrink-0">
                  {!isEditing ? (
                    <>
                      <button onClick={() => setShowDeleteModal(true)}
                        className="px-4 py-2.5 rounded-xl text-sm font-bold text-destructive bg-destructive/10 hover:bg-destructive/20 transition-colors">
                        Eliminar
                      </button>
                      <button onClick={() => setIsEditing(true)}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold bg-secondary text-secondary-foreground hover:opacity-90 transition-opacity shadow-sm flex items-center gap-2">
                        <i className="bi bi-pencil-square"></i> Editar servicio
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={handleDiscard}
                        className="px-4 py-2.5 rounded-xl text-sm font-bold text-muted-foreground bg-muted hover:bg-border transition-colors">
                        Descartar
                      </button>
                      <button onClick={handleSave} disabled={saving}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold bg-secondary text-secondary-foreground hover:opacity-90 transition-opacity shadow-sm disabled:opacity-60 flex items-center gap-2">
                        {saving ? <><i className="bi bi-arrow-repeat animate-spin"></i> Guardando...</> : 'Guardar cambios'}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CONTENIDO */}
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-10 lg:py-12">
          <div className={`grid grid-cols-1 ${!isEditing && hasContactInfo ? 'lg:grid-cols-[1fr_300px]' : ''} gap-10 lg:gap-12`}>

            <div>
              <h3 className="text-xl font-bold text-foreground mb-6">
                {isEditing ? 'Editando información' : 'Sobre el servicio'}
              </h3>

              {isEditing ? (
                <div className="space-y-6">

                  {/* Info principal */}
                  <div className="bg-card p-6 lg:p-8 rounded-3xl border border-border shadow-sm space-y-5">
                    <p className="text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground">Información principal</p>

                    <div className="space-y-1">
                      <input value={formData.title} onChange={e => { set('title', e.target.value); if (errors.title) setErrors({}); }}
                        placeholder="Título del servicio..."
                        className={`w-full px-5 py-4 rounded-2xl outline-none transition-all text-lg font-bold ${errors.title ? 'border-2 border-destructive bg-destructive/5 text-destructive' : 'border border-input bg-background focus:border-primary focus:ring-2 focus:ring-ring text-foreground'}`}
                      />
                      {errors.title && <p className="text-destructive text-xs font-bold ml-2 mt-1 flex items-center gap-1"><i className="bi bi-exclamation-triangle-fill"></i> {errors.title}</p>}
                    </div>

                    <textarea rows={5} value={formData.description} onChange={e => set('description', e.target.value)}
                      placeholder="Descripción detallada..."
                      className="w-full px-5 py-4 bg-background border border-input focus:border-primary focus:ring-2 focus:ring-ring rounded-2xl outline-none transition-all resize-none text-foreground leading-relaxed text-sm font-medium placeholder:text-muted-foreground/50"
                    />

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-foreground ml-1">Imagen (URL)</label>
                      <input type="url" value={formData.mediaUrl} onChange={e => set('mediaUrl', e.target.value)}
                        placeholder="https://ejemplo.com/imagen.jpg" className={inputClass} />
                      {formData.mediaUrl && <p className="text-xs text-primary font-bold ml-1 mt-1 flex items-center gap-1"><i className="bi bi-check-circle-fill"></i> Enlace detectado</p>}
                    </div>
                  </div>

                  {/* Contacto */}
                  <div className="bg-card p-6 lg:p-8 rounded-3xl border border-border shadow-sm space-y-5">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground">Datos de contacto</p>
                      <p className="text-xs text-muted-foreground mt-1 font-medium">Todos opcionales.</p>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-foreground ml-1 mb-1.5 block">Proveedor / Empresa</label>
                      <input value={formData.providerName} onChange={e => set('providerName', e.target.value)}
                        placeholder="Ej: Gestoría García" className={inputClass} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-foreground ml-1 mb-1.5 block">Teléfono</label>
                        <input type="tel" value={formData.phone} onChange={e => set('phone', e.target.value)}
                          placeholder="600 000 000" className={inputClass} />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-foreground ml-1 mb-1.5 block">Email</label>
                        <input type="email" value={formData.email} onChange={e => set('email', e.target.value)}
                          placeholder="contacto@empresa.com" className={inputClass} />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-foreground ml-1 mb-1.5 block">Dirección</label>
                      <input value={formData.address} onChange={e => set('address', e.target.value)}
                        placeholder="Dirección del servicio" className={inputClass} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-foreground ml-1 mb-1.5 block">Horario</label>
                        <input value={formData.schedule} onChange={e => set('schedule', e.target.value)}
                          placeholder="Lun–Vie 9:00–18:00" className={inputClass} />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-foreground ml-1 mb-1.5 block">Precio</label>
                        <input value={formData.price} onChange={e => set('price', e.target.value)}
                          placeholder="Gratuito para empleados" className={inputClass} />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-foreground ml-1 mb-1.5 block">Enlace externo</label>
                      <input type="url" value={formData.externalUrl} onChange={e => set('externalUrl', e.target.value)}
                        placeholder="https://..." className={inputClass} />
                    </div>
                  </div>

                  {/* Danger zone */}
                  <div className="border border-destructive/20 rounded-3xl p-6 lg:p-8 bg-destructive/5 mt-8">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <p className="font-bold text-foreground text-base">Eliminar este servicio</p>
                        <p className="text-xs text-muted-foreground mt-1 font-medium">Acción permanente, no se puede deshacer.</p>
                      </div>
                      <button onClick={() => setShowDeleteModal(true)}
                        className="px-6 py-3 rounded-xl text-sm font-bold text-destructive bg-card border border-destructive/20 hover:bg-destructive/10 transition-colors shadow-sm">
                        Eliminar servicio
                      </button>
                    </div>
                  </div>

                </div>
              ) : (
                <>
                  <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-wrap mb-10">
                    {service.description || 'No hay descripción disponible.'}
                  </p>

                  {service.mediaUrl && (
                    <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                      <div className="overflow-hidden rounded-3xl border border-border shadow-sm">
                        <img ref={zoomRef} src={service.mediaUrl} alt={service.title} className="w-full h-auto cursor-zoom-in" />
                      </div>
                    </div>
                  )}

                  {hasContactInfo && (
                    <div className="block lg:hidden mb-10">
                      <ContactCard service={service} />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* ACTION BOX LATERAL (Solo lectura) */}
            {!isEditing && hasContactInfo && (
              <div className="hidden lg:block">
                <div className="sticky top-8">
                  <ContactCard service={service} />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MODAL ELIMINAR */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowDeleteModal(false)}>
          <div className="bg-card rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl border border-border animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
              <i className="bi bi-trash3"></i>
            </div>
            <h2 className="text-2xl font-extrabold text-foreground mb-2 text-center tracking-tight">¿Eliminar servicio?</h2>
            <p className="text-sm text-muted-foreground mb-8 text-center leading-relaxed">
              Estás a punto de eliminar <span className="font-bold text-foreground">"{service.title}"</span>. Esta acción es permanente.
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={handleDelete} disabled={deleting}
                className="w-full py-4 rounded-xl font-bold bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity shadow-sm disabled:opacity-60">
                {deleting ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
              <button onClick={() => setShowDeleteModal(false)}
                className="w-full py-4 rounded-xl font-bold text-muted-foreground hover:bg-muted transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}