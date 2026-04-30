'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import PageHeader from '@/components/ui/pageHeader';
import { API_ROUTES } from '@/lib/utils';

interface CompanyData {
  id: string;
  name: string;
  cif: string;
  activity: string;
  address: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  logoUrl: string;
  website: string;
}

export default function EditCompanyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<CompanyData>({
    id: '',
    name: '',
    cif: '',
    activity: '',
    address: '',
    description: '',
    contactEmail: '',
    contactPhone: '',
    logoUrl: '',
    website: '',
  });

  useEffect(() => {
    const fetchMyCompany = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_ROUTES.COMPANIES.GET_ALL}/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data) setFormData(data);
      } catch (err) {
        console.error("Error cargando empresa:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyCompany();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_ROUTES.COMPANIES.GET_ALL}/${formData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex min-h-screen bg-background items-center justify-center font-sans">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background font-sans text-foreground">
      <Sidebar role="ADMIN" />
      
      <main className="flex-1 overflow-auto flex flex-col relative">
        
        {/* BANNER UNIFICADO */}
        <PageHeader 
          title="Perfil de Empresa"
          description="Actualiza la información pública y de contacto de tu entidad corporativa."
          icon={<i className="bi bi-building"></i>}
        />

        <div className="p-6 lg:p-10 flex-1">
          <div className="max-w-4xl mx-auto w-full">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* SECCIÓN 1: DATOS IDENTIFICATIVOS (Solo lectura) */}
              <div className="bg-card border border-border rounded-[2rem] p-8 lg:p-10 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -z-10"></div>
                <h2 className="text-xl font-bold text-foreground mb-8 tracking-tight">Datos Identificativos</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 ml-1">Nombre Legal</label>
                    <input 
                      type="text" 
                      value='Test S.L'
                      disabled 
                      className="w-full bg-muted/50 border border-transparent rounded-xl px-5 py-3 text-sm font-semibold text-muted-foreground cursor-not-allowed opacity-80"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 ml-1">CIF</label>
                    <input 
                      type="text" 
                      value='B1234567'
                      disabled 
                      className="w-full bg-muted/50 border border-transparent rounded-xl px-5 py-3 text-sm font-semibold text-muted-foreground cursor-not-allowed opacity-80"
                    />
                  </div>
                </div>
                
                <div className="mt-8 flex items-start gap-3 bg-primary/5 border border-primary/10 p-4 rounded-2xl">
                  <i className="bi bi-info-circle-fill text-primary mt-0.5"></i>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                    Para modificar el nombre legal o el CIF de la empresa, es necesario contactar con la administración general de EGM Atalayas por motivos legales y de facturación.
                  </p>
                </div>
              </div>

              {/* SECCIÓN 2: ACTIVIDAD */}
              <div className="bg-card border border-border rounded-[2rem] p-8 lg:p-10 shadow-sm">
                <h2 className="text-xl font-bold text-foreground mb-8 tracking-tight">Detalles de la Actividad</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 ml-1">Sector / Actividad Principal</label>
                    <input 
                      type="text" 
                      placeholder="Ej: Logística, Construcción, Tecnologías de la Información..."
                      value={formData.activity || ''} 
                      onChange={(e) => setFormData({...formData, activity: e.target.value})}
                      className="w-full bg-background border border-input rounded-xl px-5 py-3 text-sm font-semibold focus:border-primary outline-none transition-all shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 ml-1">Descripción de la Empresa</label>
                    <textarea 
                      rows={4}
                      value={formData.description || ''} 
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Breve descripción de los servicios, misión o visión de la empresa..."
                      className="w-full bg-background border border-input rounded-xl px-5 py-4 text-sm font-semibold focus:border-primary outline-none transition-all shadow-sm resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECCIÓN 3: CONTACTO */}
              <div className="bg-card border border-border rounded-[2rem] p-8 lg:p-10 shadow-sm">
                <h2 className="text-xl font-bold text-foreground mb-8 tracking-tight">Información de Contacto</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 ml-1">Email Corporativo</label>
                    <div className="relative">
                      <i className="bi bi-envelope absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"></i>
                      <input 
                        type="email" 
                        value={formData.contactEmail || ''} 
                        onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                        className="w-full pl-11 pr-5 py-3 bg-background border border-input rounded-xl text-sm font-semibold focus:border-primary outline-none transition-all shadow-sm"
                        placeholder="contacto@empresa.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 ml-1">Teléfono Principal</label>
                    <div className="relative">
                      <i className="bi bi-telephone absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"></i>
                      <input 
                        type="tel" 
                        value={formData.contactPhone || ''} 
                        onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                        className="w-full pl-11 pr-5 py-3 bg-background border border-input rounded-xl text-sm font-semibold focus:border-primary outline-none transition-all shadow-sm"
                        placeholder="+34 900 000 000"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 ml-1">Dirección Física</label>
                    <div className="relative">
                      <i className="bi bi-geo-alt absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"></i>
                      <input 
                        type="text" 
                        value={formData.address || ''} 
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        className="w-full pl-11 pr-5 py-3 bg-background border border-input rounded-xl text-sm font-semibold focus:border-primary outline-none transition-all shadow-sm"
                        placeholder="Calle, Número, Polígono, Ciudad..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* BARRA DE ACCIÓN (BOTONES) */}
              <div className="pt-4 flex justify-end items-center gap-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-5 py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3 bg-secondary text-secondary-foreground rounded-xl font-bold text-xs uppercase tracking-widest hover:opacity-90 shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <><i className="bi bi-arrow-repeat animate-spin"></i> Guardando...</>
                  ) : (
                    <><i className="bi bi-floppy"></i> Guardar Cambios</>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      </main>
    </div>
  );
}