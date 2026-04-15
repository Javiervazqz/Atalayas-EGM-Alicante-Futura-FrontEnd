'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import { API_ROUTES } from '@/lib/utils';
import CompanyDropdown from '@/components/ui/CompanyDropdown';

export default function NewGeneralService() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('PUBLIC');
  const [errors, setErrors] = useState<{ title?: string }>({});

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    mediaUrl: '',
    isPublic: true,
    companyId: '',
    providerName: '',
    email: '',
    phone: '',
    address: '',
    schedule: '',
    externalUrl: '',
    price: '',
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
    setErrors({});

    if (!formData.title.trim()) {
      setErrors({ title: 'El título es obligatorio' });
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('token');

    const clean = (v: string) => v.trim() || null;

    const dataToSubmit = {
      title: formData.title,
      description: clean(formData.description),
      mediaUrl: clean(formData.mediaUrl),
      isPublic: formData.isPublic,
      companyId: formData.isPublic ? null : formData.companyId,
      providerName: clean(formData.providerName),
      email: clean(formData.email),
      phone: clean(formData.phone),
      address: clean(formData.address),
      schedule: clean(formData.schedule),
      externalUrl: clean(formData.externalUrl),
      price: clean(formData.price),
    };

    try {
      const res = await fetch(API_ROUTES.SERVICES.CREATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSubmit),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/dashboard/administrator/general-admin/services');
        router.refresh();
      } else {
        alert(`Error del servidor: ${data.message || 'No se pudo crear el servicio'}`);
      }
    } catch {
      alert('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const companyNames = ['PUBLIC', ...companies.map((c) => c.name)];

  const inputClass = 'w-full px-5 py-4 bg-background border-2 border-transparent focus:border-primary focus:ring-2 focus:ring-ring rounded-2xl outline-none transition-all text-foreground placeholder:text-muted-foreground';

  return (
    <div className="flex min-h-screen bg-background font-sans">
      <Sidebar role="GENERAL_ADMIN" />

      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <div className="max-w-3xl mx-auto">

          {/* Cabecera */}
          <header className="mb-10">
            <button
              type="button"
              onClick={() => router.back()}
              className="text-secondary hover:opacity-80 font-bold text-sm mb-6 flex items-center gap-1 transition-opacity"
            >
              <i className="bi bi-chevron-left"></i> Volver
            </button>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">Crear nuevo servicio</h1>
            <p className="text-muted-foreground mt-2 text-base">Configura la visibilidad y el contenido del servicio.</p>
          </header>

          <form onSubmit={handleSubmit} noValidate className="space-y-6">

            {/* ── SECCIÓN 1: VISIBILIDAD ─────────────────────────────── */}
            <section className="bg-card p-6 lg:p-8 rounded-3xl border border-border shadow-sm">
              <label className="block text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground mb-6">
                Asignación de Visibilidad
              </label>

              <CompanyDropdown
                companies={companyNames}
                selected={selectedCompany}
                onChange={(val) => {
                  setSelectedCompany(val);
                  setFormData((prev) => ({
                    ...prev,
                    isPublic: val === 'PUBLIC',
                    companyId: companies.find((c) => c.name === val)?.id || '',
                  }));
                }}
              />

              <div className={`mt-5 p-4 rounded-2xl transition-colors font-semibold text-sm ${formData.isPublic ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                <p>
                  {formData.isPublic
                    ? '🌐 Este servicio será visible para todos los usuarios de Atalayas.'
                    : `🏢 Servicio exclusivo para empleados de ${selectedCompany}.`}
                </p>
              </div>
            </section>

            {/* ── SECCIÓN 2: INFORMACIÓN PRINCIPAL ──────────────────── */}
            <section className="bg-card p-6 lg:p-8 rounded-3xl border border-border shadow-sm space-y-5">
              <label className="block text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground">
                Información Principal
              </label>

              {/* Título */}
              <div className="space-y-1">
                <input
                  type="text"
                  placeholder="Título del servicio..."
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    if (errors.title) setErrors({});
                  }}
                  className={`w-full px-5 py-4 rounded-2xl outline-none transition-all text-lg font-bold ${
                    errors.title
                      ? 'border-2 border-destructive bg-destructive/10 text-destructive'
                      : 'border-2 border-transparent bg-background focus:border-primary focus:bg-card focus:ring-2 focus:ring-ring text-foreground'
                  }`}
                />
                {errors.title && (
                  <p className="text-destructive text-xs font-bold ml-2 mt-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                    <i className="bi bi-exclamation-triangle"></i> {errors.title}
                  </p>
                )}
              </div>

              {/* Descripción */}
              <textarea
                placeholder="Descripción detallada del servicio..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-5 py-4 bg-background border-2 border-transparent focus:border-primary focus:ring-2 focus:ring-ring rounded-2xl outline-none transition-all resize-none text-foreground leading-relaxed text-sm placeholder:text-muted-foreground"
              />

              {/* Imagen */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-foreground ml-1 mb-1.5">
                  Imagen de portada (URL)
                </label>
                <input
                  type="url"
                  placeholder="https://tusitio.com/imagen.jpg"
                  value={formData.mediaUrl}
                  onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                  className={inputClass}
                />
                {formData.mediaUrl && (
                  <div className="mt-4 rounded-2xl overflow-hidden h-40 w-full border border-border">
                    <img
                      src={formData.mediaUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  </div>
                )}
              </div>
            </section>

            {/* ── SECCIÓN 3: DATOS DE CONTACTO ──────────────────────── */}
            <section className="bg-card p-6 lg:p-8 rounded-3xl border border-border shadow-sm space-y-5">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground">
                  Datos de Contacto
                </label>
                <p className="text-xs text-muted-foreground mt-1">Todos los campos son opcionales.</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground ml-1 mb-1.5 block">Proveedor / Empresa</label>
                <input
                  type="text"
                  placeholder="Ej: Wincontrol Seguridad S.L."
                  value={formData.providerName}
                  onChange={(e) => setFormData({ ...formData, providerName: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground ml-1 mb-1.5 block">Teléfono</label>
                  <input
                    type="tel"
                    placeholder="647 76 33 89"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground ml-1 mb-1.5 block">Email</label>
                  <input
                    type="email"
                    placeholder="contacto@servicio.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground ml-1 mb-1.5 block">Dirección</label>
                <input
                  type="text"
                  placeholder="C/ Chelín, Parcela 22, Planta 1"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground ml-1 mb-1.5 block">Horario</label>
                  <input
                    type="text"
                    placeholder="Lun–Vie 9:00–14:00"
                    value={formData.schedule}
                    onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground ml-1 mb-1.5 block">Precio</label>
                  <input
                    type="text"
                    placeholder="Gratuito / Desde 20€/mes"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground ml-1 mb-1.5 block">Enlace externo</label>
                <input
                  type="url"
                  placeholder="https://journify.com/atalayas"
                  value={formData.externalUrl}
                  onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
                  className={inputClass}
                />
              </div>
            </section>

            {/* ── BOTÓN SUBMIT ───────────────────────────────────────── */}
            <div className="pb-8 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-secondary text-secondary-foreground rounded-2xl font-bold hover:opacity-90 transition-opacity disabled:opacity-60 text-base shadow-sm"
              >
                {loading ? 'Publicando...' : 'Publicar Servicio'}
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}