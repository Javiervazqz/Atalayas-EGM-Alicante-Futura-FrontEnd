'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import CompanyDropdown from '@/components/ui/CompanyDropdown';
import { API_ROUTES } from '@/lib/utils';
import mediumZoom from 'medium-zoom';
import ContactCard from '@/components/ui/ContactCard';

const inputClass = "w-full px-5 py-3.5 bg-background border-2 border-transparent focus:border-primary focus:ring-2 focus:ring-ring rounded-2xl outline-none transition-all text-foreground text-sm placeholder:text-muted-foreground";

export default function GeneralAdminServiceDetail() {
  const params = useParams();
  const router = useRouter();
  const zoomRef = useRef<HTMLImageElement>(null);

  const [service, setService] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
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
      if (typeof params.id !== 'string') return;
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [svcRes, compRes] = await Promise.all([
        fetch(API_ROUTES.SERVICES.GET_BY_ID(params.id), { headers }),
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
    const matchedCompany = comps.find((c: any) => c.id === svc.companyId);
    setFormData({
      title: svc.title || '', description: svc.description || '', mediaUrl: svc.mediaUrl || '',
      isPublic: svc.isPublic ?? true, companyId: svc.companyId || '',
      providerName: svc.providerName || '', phone: svc.phone || '', email: svc.email || '',
      address: svc.address || '', schedule: svc.schedule || '',
      externalUrl: svc.externalUrl || '', price: svc.price || '',
    });
    setSelectedCompany(svc.isPublic === false && matchedCompany ? matchedCompany.name : 'PUBLIC');
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
    const clean = (v: string) => v.trim() || null;
    try {
      const res = await fetch(API_ROUTES.SERVICES.GET_BY_ID(params.id as string), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({
          title: formData.title, description: clean(formData.description), mediaUrl: clean(formData.mediaUrl),
          isPublic: formData.isPublic, companyId: formData.isPublic ? null : formData.companyId,
          providerName: clean(formData.providerName), phone: clean(formData.phone), email: clean(formData.email),
          address: clean(formData.address), schedule: clean(formData.schedule),
          externalUrl: clean(formData.externalUrl), price: clean(formData.price),
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setService(updated);
        const savedCompany = companies.find((c: any) => c.id === updated.companyId);
        setSelectedCompany(updated.isPublic === false && savedCompany ? savedCompany.name : 'PUBLIC');
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

  const handleDiscard = () => {
    hydrateForm(service, companies);
    setErrors({});
    setIsEditing(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(API_ROUTES.SERVICES.GET_BY_ID(params.id as string), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.ok) { router.push('/dashboard/administrator/general-admin/services'); router.refresh(); }
      else alert('No se pudo eliminar el servicio.');
    } catch { alert('Error de conexión.'); }
    finally { setDeleting(false); setShowDeleteModal(false); }
  };

  const set = (key: string, value: string) => setFormData(prev => ({ ...prev, [key]: value }));
  const companyNames = ['PUBLIC', ...(Array.isArray(companies) ? companies.map(c => c.name) : [])];
  const hasContactInfo = service && (service.providerName || service.phone || service.email || service.address || service.schedule || service.price || service.externalUrl);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary" />
    </div>
  );
  if (!service) return null;

  return (
    <div className="flex min-h-screen bg-background font-sans">
      <Sidebar role="GENERAL_ADMIN" />

      <main className="flex-1 h-screen overflow-y-auto">

        {/* HEADER */}
        <div className="bg-card border-b border-border py-8 lg:py-10">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <button onClick={() => router.back()}
              className="flex items-center gap-1 text-secondary text-sm font-semibold hover:opacity-80 transition-opacity mb-6">
              <i className="bi bi-chevron-left"></i> Volver a servicios
            </button>

            <div className="flex items-center justify-between flex-wrap gap-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                  <i className="bi bi-building"></i>
                </div>
                <div className="flex-1 min-w-[250px]">
                  <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight mb-2">
                    {service.title}
                  </h1>
                  <span className={`inline-flex items-center text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${formData.isPublic ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {formData.isPublic ? '🌐 Público' : `🏢 ${selectedCompany}`}
                  </span>
                </div>
              </div>

              {/* Botones */}
              <div className="flex items-center gap-3 shrink-0">
                {saveSuccess && (
                  <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full border border-primary/20 animate-in fade-in duration-300 mr-2">
                    <i className="bi bi-check-circle"></i> Cambios guardados
                  </span>
                )}
                {!isEditing ? (
                  <>
                    <button onClick={() => setShowDeleteModal(true)}
                      className="px-4 py-2.5 rounded-xl text-sm font-semibold text-destructive bg-destructive/10 hover:bg-destructive/20 transition-colors">
                      Eliminar
                    </button>
                    <button onClick={() => setIsEditing(true)}
                      className="px-5 py-2.5 rounded-xl text-sm font-bold bg-secondary text-secondary-foreground hover:opacity-90 transition-opacity shadow-sm">
                      Editar servicio
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={handleDiscard}
                      className="px-4 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground bg-muted hover:bg-border transition-colors">
                      Descartar
                    </button>
                    <button onClick={handleSave} disabled={saving}
                      className="px-5 py-2.5 rounded-xl text-sm font-bold bg-secondary text-secondary-foreground hover:opacity-90 transition-opacity shadow-sm disabled:opacity-60">
                      {saving ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CONTENIDO */}
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-10 lg:py-12">
          <div className={`grid grid-cols-1 ${!isEditing && hasContactInfo ? 'lg:grid-cols-[1fr_300px]' : ''} gap-10 lg:gap-12`}>

            {/* COLUMNA PRINCIPAL */}
            <div className="w-full">
              <h3 className="text-xl font-bold text-foreground mb-6">
                {isEditing ? 'Editando información' : 'Sobre el servicio'}
              </h3>

              {isEditing ? (
                <div className="space-y-6">

                  {/* Visibilidad */}
                  <div className="bg-card p-6 lg:p-8 rounded-3xl border border-border shadow-sm space-y-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground">Visibilidad</p>
                    <CompanyDropdown
                      companies={companyNames}
                      selected={selectedCompany}
                      onChange={(val) => {
                        setSelectedCompany(val);
                        const comp = companies.find(c => c.name === val);
                        setFormData(prev => ({ ...prev, isPublic: val === 'PUBLIC', companyId: val === 'PUBLIC' ? '' : (comp?.id || '') }));
                      }}
                    />
                    <div className={`p-4 rounded-2xl text-sm font-semibold ${formData.isPublic ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      {formData.isPublic ? '🌐 Visible para todos los usuarios.' : `🏢 Exclusivo para empleados de ${selectedCompany}.`}
                    </div>
                  </div>

                  {/* Info principal */}
                  <div className="bg-card p-6 lg:p-8 rounded-3xl border border-border shadow-sm space-y-5">
                    <p className="text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground">Información principal</p>

                    <div className="space-y-1">
                      <input value={formData.title} onChange={e => { set('title', e.target.value); if (errors.title) setErrors({}); }}
                        placeholder="Título del servicio..."
                        className={`w-full px-5 py-4 rounded-2xl outline-none transition-all text-lg font-bold ${errors.title ? 'border-2 border-destructive bg-destructive/10 text-destructive' : 'border-2 border-transparent bg-background focus:border-primary focus:bg-card focus:ring-2 focus:ring-ring text-foreground'}`}
                      />
                      {errors.title && <p className="text-destructive text-xs font-bold ml-2 flex items-center gap-1"><i className="bi bi-exclamation-triangle"></i> {errors.title}</p>}
                    </div>

                    <textarea rows={5} value={formData.description} onChange={e => set('description', e.target.value)}
                      placeholder="Descripción detallada..."
                      className="w-full px-5 py-4 bg-background border-2 border-transparent focus:border-primary focus:ring-2 focus:ring-ring rounded-2xl outline-none transition-all resize-none text-foreground leading-relaxed text-sm placeholder:text-muted-foreground"
                    />

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground ml-1">Imagen de portada (URL)</label>
                      <input type="url" value={formData.mediaUrl} onChange={e => set('mediaUrl', e.target.value)}
                        placeholder="https://ejemplo.com/imagen.jpg" className={inputClass} />
                      {formData.mediaUrl && <p className="text-xs text-primary font-bold ml-1 mt-1"><i className="bi bi-check2"></i> Enlace detectado</p>}
                    </div>
                  </div>

                  {/* Contacto */}
                  <div className="bg-card p-6 lg:p-8 rounded-3xl border border-border shadow-sm space-y-5">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground">Datos de contacto</p>
                      <p className="text-xs text-muted-foreground mt-1">Todos opcionales.</p>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-foreground ml-1 mb-1.5 block">Proveedor / Empresa</label>
                      <input value={formData.providerName} onChange={e => set('providerName', e.target.value)}
                        placeholder="Ej: Wincontrol Seguridad S.L." className={inputClass} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-foreground ml-1 mb-1.5 block">Teléfono</label>
                        <input type="tel" value={formData.phone} onChange={e => set('phone', e.target.value)}
                          placeholder="647 76 33 89" className={inputClass} />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-foreground ml-1 mb-1.5 block">Email</label>
                        <input type="email" value={formData.email} onChange={e => set('email', e.target.value)}
                          placeholder="contacto@servicio.com" className={inputClass} />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-foreground ml-1 mb-1.5 block">Dirección</label>
                      <input value={formData.address} onChange={e => set('address', e.target.value)}
                        placeholder="C/ Chelín, Parcela 22" className={inputClass} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-foreground ml-1 mb-1.5 block">Horario</label>
                        <input value={formData.schedule} onChange={e => set('schedule', e.target.value)}
                          placeholder="Lun–Vie 9:00–14:00" className={inputClass} />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-foreground ml-1 mb-1.5 block">Precio</label>
                        <input value={formData.price} onChange={e => set('price', e.target.value)}
                          placeholder="Gratuito" className={inputClass} />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-foreground ml-1 mb-1.5 block">Enlace externo</label>
                      <input type="url" value={formData.externalUrl} onChange={e => set('externalUrl', e.target.value)}
                        placeholder="https://journify.com/atalayas" className={inputClass} />
                    </div>
                  </div>

                  {/* Danger zone */}
                  <div className="border border-destructive/20 rounded-3xl p-6 bg-destructive/5 mt-8">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <p className="font-bold text-foreground text-sm">Eliminar este servicio</p>
                        <p className="text-xs text-muted-foreground mt-1">Acción permanente, no se puede deshacer.</p>
                      </div>
                      <button onClick={() => setShowDeleteModal(true)}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold text-destructive bg-card border border-destructive/20 hover:bg-destructive/10 transition-colors shadow-sm">
                        Eliminar servicio
                      </button>
                    </div>
                  </div>

                </div>
              ) : (
                <>
                  <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-wrap mb-8">
                    {service.description || 'No hay descripción disponible.'}
                  </p>

                  {service.mediaUrl && (
                    <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                      <div className="overflow-hidden rounded-3xl border border-border shadow-sm">
                        <img ref={zoomRef} src={service.mediaUrl} alt={service.title} className="w-full h-auto cursor-zoom-in" />
                      </div>
                    </div>
                  )}

                  {/* Contacto en móvil */}
                  {hasContactInfo && (
                    <div className="block lg:hidden mb-10">
                      <ContactCard service={service} />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* ACTION BOX LATERAL — solo en modo lectura */}
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
          <div className="bg-card rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-border animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}>
            <div className="text-5xl mb-6 text-center text-destructive"><i className="bi bi-trash3"></i></div>
            <h2 className="text-2xl font-extrabold text-foreground mb-2 text-center tracking-tight">¿Eliminar servicio?</h2>
            <p className="text-sm text-muted-foreground mb-8 text-center leading-relaxed">
              Estás a punto de eliminar <span className="font-bold text-foreground">"{service.title}"</span>. Esta acción es permanente.
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={handleDelete} disabled={deleting}
                className="w-full py-3.5 rounded-xl font-bold bg-destructive text-destructive-foreground hover:opacity-90 active:scale-95 transition-all disabled:opacity-60 shadow-sm">
                {deleting ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
              <button onClick={() => setShowDeleteModal(false)}
                className="w-full py-3.5 rounded-xl font-bold text-muted-foreground hover:bg-muted transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}