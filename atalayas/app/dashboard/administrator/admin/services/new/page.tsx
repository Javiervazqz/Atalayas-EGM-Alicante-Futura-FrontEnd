"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import { API_ROUTES } from '@/lib/utils';

export default function NewCompanyService() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ title?: string }>({});
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    mediaUrl: "",
    isPublic: false, // Siempre privado — solo para su empresa
    providerName: "",
    phone: "",
    email: "",
    address: "",
    schedule: "",
    externalUrl: "",
    price: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    if (!formData.title.trim()) {
      setErrors({ title: "El título es necesario para crear el servicio" });
      return;
    }

    setLoading(true);
    const clean = (v: string) => v.trim() || null;

    try {
      const res = await fetch(API_ROUTES.SERVICES.CREATE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: clean(formData.description),
          mediaUrl: clean(formData.mediaUrl),
          isPublic: false,
          providerName: clean(formData.providerName),
          phone: clean(formData.phone),
          email: clean(formData.email),
          address: clean(formData.address),
          schedule: clean(formData.schedule),
          externalUrl: clean(formData.externalUrl),
          price: clean(formData.price),
        }),
      });

      if (res.ok) {
        router.push("/dashboard/administrator/admin/services");
        router.refresh();
      } else {
        const data = await res.json();
        alert(`Error: ${data.message || "No se pudo crear el servicio"}`);
      }
    } catch {
      alert("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const set = (key: string, value: string) => setFormData(prev => ({ ...prev, [key]: value }));

  const inputClass = "w-full px-5 py-4 bg-background border border-input focus:border-primary focus:ring-2 focus:ring-ring rounded-2xl outline-none transition-all text-foreground text-sm font-medium placeholder:text-muted-foreground/50";

  return (
    <div className="flex min-h-screen bg-background font-sans">
      <Sidebar role="ADMIN" />

      <main className="flex-1 p-6 lg:p-12 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <header className="mb-10">
            <button onClick={() => router.back()}
              className="text-secondary font-bold text-sm mb-6 flex items-center gap-1 hover:opacity-80 transition-opacity">
              <i className="bi bi-chevron-left"></i> Volver
            </button>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight mb-2">Crear nuevo servicio</h1>
            <p className="text-muted-foreground text-base">Este servicio será visible solo para los empleados de tu empresa.</p>
          </header>

          {/* Aviso de visibilidad fija */}
          <div className="mb-8 p-5 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-start gap-4">
            <div className="text-2xl text-secondary"><i className="bi bi-info-circle-fill"></i></div>
            <div>
               <p className="text-sm font-bold text-secondary mb-0.5">Visibilidad Privada</p>
               <p className="text-xs font-medium text-secondary/80 leading-relaxed">Los servicios que crees aquí son privados y exclusivos para los empleados de tu organización. Para crear un servicio global, contacta con la EGM.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* ── SECCIÓN 1: INFO PRINCIPAL ──────────────────────────── */}
            <section className="bg-card p-6 lg:p-10 rounded-3xl border border-border shadow-sm space-y-6">
              <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                Información Principal
              </label>

              {/* Título */}
              <div className="space-y-1">
                <input
                  type="text"
                  placeholder="Título del servicio..."
                  value={formData.title}
                  onChange={e => { set('title', e.target.value); if (errors.title) setErrors({}); }}
                  className={`w-full px-5 py-4 rounded-2xl outline-none transition-all text-lg font-bold placeholder:font-medium placeholder:text-muted-foreground/50 ${
                    errors.title
                      ? 'border-2 border-destructive bg-destructive/5 text-destructive'
                      : 'border border-input bg-background focus:border-primary focus:bg-card focus:ring-2 focus:ring-ring text-foreground'
                  }`}
                />
                {errors.title && (
                  <p className="text-destructive text-xs font-bold flex items-center gap-1 mt-2 ml-2 animate-in fade-in slide-in-from-top-1">
                    <i className="bi bi-exclamation-triangle-fill text-[10px]"></i> {errors.title}
                  </p>
                )}
              </div>

              {/* Descripción */}
              <textarea
                placeholder="Descripción detallada del servicio..."
                value={formData.description}
                onChange={e => set('description', e.target.value)}
                rows={5}
                className="w-full px-5 py-4 bg-background border border-input focus:border-primary focus:ring-2 focus:ring-ring rounded-2xl outline-none transition-all resize-none text-foreground leading-relaxed text-sm font-medium placeholder:text-muted-foreground/50"
              />

              {/* Imagen */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-foreground ml-1">Imagen de portada (URL)</label>
                <input type="url" placeholder="https://tusitio.com/imagen.jpg"
                  value={formData.mediaUrl} onChange={e => set('mediaUrl', e.target.value)}
                  className={inputClass} />
                {formData.mediaUrl && (
                  <div className="mt-4 rounded-2xl overflow-hidden h-40 w-full border border-border shadow-sm">
                    <img src={formData.mediaUrl} alt="Preview" className="w-full h-full object-cover"
                      onError={e => (e.currentTarget.style.display = 'none')} />
                  </div>
                )}
              </div>
            </section>

            {/* ── SECCIÓN 2: DATOS DE CONTACTO ──────────────────────── */}
            <section className="bg-card p-6 lg:p-10 rounded-3xl border border-border shadow-sm space-y-5">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                  Datos de Contacto
                </label>
                <p className="text-xs text-muted-foreground mt-1 font-medium">Todos los campos son opcionales.</p>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground ml-1 mb-1.5 block">Proveedor / Empresa</label>
                <input placeholder="Ej: Gestoría García S.L."
                  value={formData.providerName} onChange={e => set('providerName', e.target.value)}
                  className={inputClass} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold text-foreground ml-1 mb-1.5 block">Teléfono</label>
                  <input type="tel" placeholder="600 000 000"
                    value={formData.phone} onChange={e => set('phone', e.target.value)}
                    className={inputClass} />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground ml-1 mb-1.5 block">Email</label>
                  <input type="email" placeholder="contacto@empresa.com"
                    value={formData.email} onChange={e => set('email', e.target.value)}
                    className={inputClass} />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground ml-1 mb-1.5 block">Dirección</label>
                <input placeholder="Dirección del servicio"
                  value={formData.address} onChange={e => set('address', e.target.value)}
                  className={inputClass} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold text-foreground ml-1 mb-1.5 block">Horario</label>
                  <input placeholder="Lun–Vie 9:00–18:00"
                    value={formData.schedule} onChange={e => set('schedule', e.target.value)}
                    className={inputClass} />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground ml-1 mb-1.5 block">Precio</label>
                  <input placeholder="Gratuito para empleados"
                    value={formData.price} onChange={e => set('price', e.target.value)}
                    className={inputClass} />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground ml-1 mb-1.5 block">Enlace externo</label>
                <input type="url" placeholder="https://..."
                  value={formData.externalUrl} onChange={e => set('externalUrl', e.target.value)}
                  className={inputClass} />
              </div>
            </section>

            {/* ── SUBMIT ────────────────────────────────────────────── */}
            <div className="pt-4 pb-12">
              <button type="submit" disabled={loading}
                className="w-full py-5 bg-secondary text-secondary-foreground rounded-2xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 text-base shadow-sm flex items-center justify-center gap-2">
                {loading ? <><i className="bi bi-arrow-repeat animate-spin text-xl"></i> Publicando...</> : 'Publicar Servicio'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
