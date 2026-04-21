'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import PageHeader from "@/components/ui/pageHeader";
import { API_ROUTES } from '@/lib/utils';
import ContactCard from '@/components/ui/ContactCard';

export default function ServiceDetail() {
  const params = useParams();
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
      } catch (err) {
        console.error("Error cargando servicio:", err);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchDetail();
  }, [params.id]);

  if (loading) return (
    <div className="flex min-h-screen bg-background items-center justify-center font-sans">
      <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!service) return null;

  const hasSidebar = !!(service.mediaUrl || service.providerName || service.phone || service.email);

  return (
    <div className="flex min-h-screen bg-background font-sans text-foreground">
      <Sidebar role="EMPLOYEE" />

      <main className="flex-1 overflow-auto flex flex-col relative">
        
        <PageHeader 
          title={service.title}
          description={service.isPublic ? "Servicio oficial Atalayas EGM" : "Servicio privado de empresa"}
          icon={<i className="bi bi-briefcase-fill"></i>}
          backUrl="/dashboard/employee/services"
        />

        <div className="p-6 lg:p-10 flex-1">
          <div className="max-w-7xl mx-auto">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

              {/* COLUMNA IZQUIERDA: DESCRIPCIÓN */}
              <div className="lg:col-span-7 space-y-8">
                <section className="bg-card border border-border rounded-[2.5rem] p-8 lg:p-12 shadow-sm">
                  <div className="flex items-center gap-3 mb-8">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-[0.15em] border ${
                      service.isPublic 
                      ? 'bg-primary/5 text-primary border-primary/20' 
                      : 'bg-secondary/5 text-secondary border-secondary/20'
                    }`}>
                      {service.isPublic ? '🌐 EGM Access' : '🔒 Internal'}
                    </span>
                  </div>

                  <h2 className="text-3xl font-bold mb-8 tracking-tight">Detalles del servicio</h2>
                  
                  <div className="prose prose-slate dark:prose-invert max-w-none">
                    <p className="text-muted-foreground text-lg leading-relaxed whitespace-pre-wrap font-medium opacity-90">
                      {service.description || 'No hay una descripción detallada disponible actualmente.'}
                    </p>
                  </div>
                </section>
              </div>

              {/* COLUMNA DERECHA: MEDIA + CONTACTO */}
              {hasSidebar && (
                <aside className="lg:col-span-5 space-y-8">
                  <div className="sticky top-6 space-y-8">
                    
                    {/* IMAGEN ESTÁTICA PREMIUM */}
                    {service.mediaUrl && (
                      <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm group">
                        <div className="aspect-[4/3] overflow-hidden bg-muted">
                          <img
                            src={service.mediaUrl}
                            alt={service.title}
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                          />
                        </div>
                        <div className="px-6 py-4 bg-muted/30 border-t border-border">
                            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                                Imagen del servicio
                            </span>
                        </div>
                      </div>
                    )}

                    <div className="animate-in fade-in slide-in-from-right-4 duration-700">
                      <ContactCard service={service} />
                    </div>

                  </div>
                </aside>
              )}

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}