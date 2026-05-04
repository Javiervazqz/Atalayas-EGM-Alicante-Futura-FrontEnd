'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import Link from 'next/link';
import PageHeader from '@/components/ui/pageHeader';

export default function NewCollaboratorPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  
  // Ahora el estado por defecto es 'upload' (Subir Archivo)
  const [logoSource, setLogoSource] = useState<'upload' | 'url'>('upload');
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    website: '',
    type: 'ADMINISTRACIÓN PÚBLICA', 
    logoUrl: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // Aquí, cuando conectes tu API real, usarás FormData si logoSource === 'upload'
    // const data = new FormData();
    // data.append('name', formData.name);
    // if (logoSource === 'upload' && logoFile) data.append('file', logoFile);
    // else data.append('logoUrl', formData.logoUrl);
    
    // Simulación de guardado
    setTimeout(() => {
      setSaving(false);
      router.push('/dashboard/administrator/general-admin/community');
    }, 1000);
  };

  return (
    <div className="flex min-h-screen bg-background font-sans text-foreground">
      <Sidebar role="GENERAL_ADMIN" />

      <main className="flex-1 overflow-auto flex flex-col relative">
        
        {/* BANNER UNIFICADO */}
        <PageHeader 
          title="Nuevo Colaborador"
          description="Añade una entidad o institución al ecosistema de proximidad de Atalayas."
          icon={<i className="bi bi-diagram-3-fill"></i>}
          backUrl="/dashboard/administrator/general-admin/community"
        />

        <div className="p-6 lg:p-10 flex-1">
          <div className="max-w-2xl mx-auto w-full">
            
            <form onSubmit={handleSubmit} className="space-y-8">
              
              <div className="bg-card border border-border rounded-[2rem] p-8 lg:p-10 shadow-sm space-y-8">
                
                {/* Nombre de la Entidad */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 ml-1">
                    Nombre de la Entidad
                  </label>
                  <div className="relative">
                    <i className="bi bi-bank absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground text-lg"></i>
                    <input 
                      type="text"
                      required
                      placeholder="Ej. Ayuntamiento de Alicante"
                      className="w-full pl-14 pr-5 py-3.5 bg-background border border-input rounded-xl text-sm font-semibold focus:border-primary outline-none transition-all shadow-sm"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>

                {/* Tipo de Entidad */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 ml-1">
                    Tipo de Colaboración
                  </label>
                  <div className="relative">
                    <i className="bi bi-diagram-3 absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground text-lg z-10"></i>
                    <select 
                      className="w-full pl-14 pr-10 py-3.5 bg-background border border-input rounded-xl text-sm font-semibold focus:border-primary outline-none transition-all shadow-sm appearance-none cursor-pointer"
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                    >
                      <option value="ADMINISTRACIÓN PÚBLICA">ADMINISTRACIÓN PÚBLICA</option>
                      <option value="FORMACIÓN Y TALENTO">FORMACIÓN Y TALENTO</option>
                      <option value="INNOVACIÓN Y TECNOLOGÍA">INNOVACIÓN Y TECNOLOGÍA</option>
                      <option value="CÁMARAS Y ASOCIACIONES">CÁMARAS Y ASOCIACIONES</option>
                      <option value="SINDICATOS">SINDICATOS</option>
                    </select>
                    <i className="bi bi-chevron-down absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"></i>
                  </div>
                </div>

                {/* Subida de Logo (Archivo o URL) */}
                <div className="p-5 bg-background border border-border rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Logo de la Entidad
                    </label>
                    
                    {/* Tooltip Icono de Información */}
                    <div className="relative group cursor-help flex items-center justify-center w-6 h-6 rounded-full hover:bg-muted transition-colors">
                      <i className="bi bi-info-circle text-muted-foreground group-hover:text-primary transition-colors"></i>
                      <div className="absolute right-0 bottom-full mb-2 w-56 p-3 bg-foreground text-background text-[10px] rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 text-center font-bold shadow-xl">
                        Formatos aceptados: PNG, JPG, WEBP, SVG.<br />Tamaño máximo recomendado: 2MB.
                        <div className="absolute -bottom-1 right-2 w-2 h-2 bg-foreground rotate-45"></div>
                      </div>
                    </div>
                  </div>

                  {/* Selector Archivo / URL (Orden invertido) */}
                  <div className="flex gap-1 mb-5 p-1 bg-muted/40 rounded-xl w-fit border border-border">
                    <button 
                      type="button" 
                      onClick={() => setLogoSource('upload')} 
                      className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-300 ${logoSource === 'upload' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      Subir Archivo
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setLogoSource('url')} 
                      className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-300 ${logoSource === 'url' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      Pegar URL
                    </button>
                  </div>

                  {/* Input dependiendo del modo */}
                  {logoSource === 'upload' ? (
                    <label className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 hover:border-primary/50 transition-all group bg-background animate-in fade-in zoom-in-95 duration-200 relative overflow-hidden">
                      <input 
                        type="file" 
                        accept="image/png, image/jpeg, image/webp, image/svg+xml" 
                        className="hidden" 
                        onChange={(e) => setLogoFile(e.target.files?.[0] || null)} 
                      />
                      <i className={`bi bi-cloud-arrow-up text-3xl mb-2 transition-transform duration-300 group-hover:-translate-y-1 ${logoFile ? 'text-primary' : 'text-muted-foreground/40 group-hover:text-primary/60'}`}></i>
                      <p className={`text-xs font-bold ${logoFile ? 'text-primary' : 'text-muted-foreground'}`}>
                        {logoFile ? logoFile.name : "Haz clic o arrastra una imagen aquí"}
                      </p>
                      {!logoFile && <p className="text-[9px] text-muted-foreground/60 font-semibold uppercase tracking-widest mt-2">PNG, JPG, SVG</p>}
                    </label>
                  ) : (
                    <div className="relative animate-in fade-in zoom-in-95 duration-200">
                      <i className="bi bi-link-45deg absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-xl"></i>
                      <input 
                        type="url"
                        placeholder="https://atalayas.com/logo.png"
                        className="w-full pl-12 pr-5 py-3.5 bg-background border border-input rounded-xl text-sm font-semibold focus:border-primary outline-none transition-all shadow-sm"
                        value={formData.logoUrl}
                        onChange={(e) => setFormData({...formData, logoUrl: e.target.value})}
                      />
                    </div>
                  )}
                </div>

                {/* Link Web */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 ml-1">
                    Enlace Directo (Web)
                  </label>
                  <div className="relative">
                    <i className="bi bi-globe absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground text-lg"></i>
                    <input 
                      type="url"
                      placeholder="https://www.alicantefutura.org"
                      className="w-full pl-14 pr-5 py-3.5 bg-background border border-input rounded-xl text-sm font-semibold focus:border-primary outline-none transition-all shadow-sm"
                      value={formData.website}
                      onChange={(e) => setFormData({...formData, website: e.target.value})}
                    />
                  </div>
                </div>

              </div>

              {/* BARRA DE ACCIÓN */}
              <div className="flex justify-end items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-5 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3.5 bg-secondary text-secondary-foreground rounded-xl font-bold text-xs uppercase tracking-widest hover:opacity-90 shadow-md transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {saving ? (
                    <><i className="bi bi-arrow-repeat animate-spin text-lg"></i> Guardando...</>
                  ) : (
                    <><i className="bi bi-check-lg text-lg"></i> Publicar Entidad</>
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