'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import { API_ROUTES } from '@/lib/utils';
import mediumZoom from 'medium-zoom';
import ContactCard from '@/components/ui/ContactCard';

export default function ServiceDetail() {
  const params = useParams();
  const router = useRouter();
  const zoomRef = useRef<HTMLImageElement>(null);
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(API_ROUTES.SERVICES.GET_BY_ID(params.id as string), {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await res.json();
        setService(data);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchDetail();
  }, [params.id]);

  useEffect(() => {
    if (zoomRef.current && service?.mediaUrl) {
      const zoom = mediumZoom(zoomRef.current, { background: 'rgba(0,0,0,0.8)', margin: 24 });
      return () => { zoom.detach(); };
    }
  }, [service?.mediaUrl]);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary" />
    </div>
  );
  if (!service) return null;

  const hasContactInfo = service.providerName || service.phone || service.email || service.address || service.schedule || service.price || service.externalUrl;

  return (
    <div className="flex min-h-screen bg-background font-sans">
      <Sidebar role="PUBLIC" />

      <main className="flex-1 h-screen overflow-y-auto">

        {/* HEADER */}
        <div className="bg-card border-b border-border py-8 lg:py-10">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1 text-secondary text-sm font-semibold hover:opacity-80 transition-opacity mb-6"
            >
              <i className="bi bi-chevron-left"></i> Volver a servicios
            </button>

            <div className="flex items-center gap-6 flex-wrap">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                <i className="bi bi-buildings"></i>
              </div>
              <div className="flex-1 min-w-[250px]">
                <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight mb-2">
                  {service.title}
                </h1>
                <span className={`inline-flex items-center text-xs font-bold px-3 py-1 rounded-full ${service.isPublic ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  {service.isPublic ? '🌐 Público' : '🔒 Privado'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENIDO */}
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-10 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10">

            {/* COLUMNA PRINCIPAL */}
            <div>
              <h3 className="text-xl font-bold text-foreground mb-4">Sobre el servicio</h3>
              <p className="text-muted-foreground text-base leading-relaxed whitespace-pre-wrap mb-10">
                {service.description || 'No hay una descripción disponible para este servicio.'}
              </p>

              {/* Imagen */}
              {service.mediaUrl && (
                <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="overflow-hidden rounded-3xl border border-border shadow-sm">
                    <img
                      ref={zoomRef}
                      src={service.mediaUrl}
                      alt={service.title}
                      className="w-full h-auto cursor-zoom-in"
                    />
                  </div>
                </div>
              )}

              {/* Info de contacto en móvil */}
              {hasContactInfo && (
                <div className="block lg:hidden mb-10">
                  <ContactCard service={service} />
                </div>
              )}
            </div>

            {/* ACTION BOX LATERAL */}
            {hasContactInfo && (
              <div className="hidden lg:block">
                <div className="sticky top-8">
                  <ContactCard service={service} />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}