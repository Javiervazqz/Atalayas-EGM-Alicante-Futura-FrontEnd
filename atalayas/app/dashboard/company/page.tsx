'use client';

import { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import { API_ROUTES } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function CompanyProfilePage() {
  const router = useRouter();
  
  // 1. Estados de contexto (Usuario y Empresas)
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  
  // 2. Estados del formulario
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [cif, setCif] = useState('');
  const [activity, setActivity] = useState('');
  
  // 3. Estados del Logo
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(null);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // 4. Estados de UI
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const init = async () => {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) return router.push('/login');
      
      const user = JSON.parse(storedUser);
      setCurrentUser(user);

      if (user.role === 'GENERAL_ADMIN') {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(API_ROUTES.COMPANIES.GET_ALL, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (Array.isArray(data)) {
            setCompanies(data);
            if (data.length > 0) setSelectedCompanyId(data[0].id);
          }
        } catch (err) {
          console.error('Error cargando lista de empresas:', err);
        }
      } else if (user.role === 'ADMIN' && user.companyId) {
        setSelectedCompanyId(user.companyId);
      } else {
        router.push('/dashboard');
      }
    };
    init();
  }, [router]);

  useEffect(() => {
    if (!selectedCompanyId) return;

    const fetchCompanyData = async () => {
      setFetching(true);
      setError('');
      setSuccess('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_ROUTES.COMPANIES.GET_ALL}/${selectedCompanyId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error('Error al cargar los datos de la empresa');
        
        const company = await res.json();
        
        setName(company.name || '');
        setAddress(company.address || '');
        setDescription(company.description || '');
        setWebsite(company.website || '');
        setContactEmail(company.contactEmail || '');
        setContactPhone(company.contactPhone || '');
        setCif(company.cif || '');
        setActivity(company.activity || '');
        setCurrentLogoUrl(company.logoUrl || null);
        
        setNewFile(null);
        setLogoPreview(null);
        
      } catch (err: any) {
        setError(err.message);
      } finally {
        setFetching(false);
      }
    };

    fetchCompanyData();
  }, [selectedCompanyId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewFile(file);
      setError('');
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      if (name) formData.append('name', name);
      if (address) formData.append('address', address);
      if (description) formData.append('description', description);
      if (website) formData.append('website', website);
      if (contactEmail) formData.append('contactEmail', contactEmail);
      if (contactPhone) formData.append('contactPhone', contactPhone);
      if (cif) formData.append('cif', cif);
      if (activity) formData.append('activity', activity);
      
      if (newFile) formData.append('file', newFile); 

      const res = await fetch(`${API_ROUTES.COMPANIES.GET_ALL}/${selectedCompanyId}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = Array.isArray(data.message) ? data.message.join(', ') : data.message;
        throw new Error(errorMsg || 'Error actualizando el perfil de la empresa');
      }

      setCurrentLogoUrl(data.logoUrl || currentLogoUrl);
      setNewFile(null);
      setLogoPreview(null);
      setSuccess('Perfil de empresa actualizado correctamente.');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser || !selectedCompanyId) return null;

  return (
    <div className="flex min-h-screen bg-background font-sans">
      <Sidebar role={currentUser.role} />
      
      <main className="flex-1 p-6 lg:p-10 overflow-auto flex justify-center">
        <div className="w-full max-w-2xl">
          
          <div className="mb-8 text-center sm:text-left flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">Perfil de Empresa</h1>
              <p className="text-muted-foreground mt-1">Gestiona la información pública y de contacto de la entidad.</p>
            </div>
            
            {/* DESPLEGABLE MÁGICO PARA EL GENERAL_ADMIN */}
            {currentUser.role === 'GENERAL_ADMIN' && (
              <div className="w-full sm:w-auto">
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Editando empresa:</label>
                <select 
                  value={selectedCompanyId} 
                  onChange={(e) => setSelectedCompanyId(e.target.value)} 
                  className="w-full sm:w-64 bg-card border border-input rounded-xl px-4 py-2.5 text-sm outline-none cursor-pointer focus:border-primary focus:ring-2 focus:ring-ring shadow-sm transition-all font-medium text-foreground"
                >
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className={`bg-card rounded-3xl shadow-sm border border-border p-8 space-y-8 transition-opacity duration-300 ${fetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            
            {error && <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive font-medium text-sm">{error}</div>}
            {success && <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl text-primary font-medium text-sm">{success}</div>}

            {/* SECCIÓN AVATAR / LOGO DE EMPRESA */}
            <div className="flex flex-col items-center gap-4 border-b border-border pb-8">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <img 
                  src={logoPreview || (currentLogoUrl ? encodeURI(currentLogoUrl) : 'https://placehold.co/400x400/f5f5f7/86868b?text=LOGO')} 
                  alt="Logo Empresa" 
                  className="w-32 h-32 rounded-2xl object-cover border-4 border-background shadow-sm transition-all group-hover:opacity-80"
                />
                <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs font-bold text-center px-2">Subir Logo</span>
                </div>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              <p className="text-xs text-muted-foreground">Formato cuadrado recomendado. (JPG, PNG)</p>
            </div>

            {/* INFORMACIÓN BÁSICA */}
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-foreground border-l-4 border-primary pl-3">Identidad Corporativa</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-2">Razón Social / Nombre *</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-background border border-input focus:border-primary focus:ring-2 focus:ring-ring rounded-xl px-4 py-3 text-sm outline-none transition-all text-foreground" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-2">CIF / NIF</label>
                  <input type="text" value={cif} onChange={(e) => setCif(e.target.value)} placeholder="B12345678" className="w-full bg-background border border-input focus:border-primary focus:ring-2 focus:ring-ring rounded-xl px-4 py-3 text-sm outline-none transition-all text-foreground" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-2">Sector de Actividad</label>
                <input type="text" value={activity} onChange={(e) => setActivity(e.target.value)} placeholder="Ej: Tecnología, Logística..." className="w-full bg-background border border-input focus:border-primary focus:ring-2 focus:ring-ring rounded-xl px-4 py-3 text-sm outline-none transition-all text-foreground" />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-2">Descripción de la Empresa</label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  rows={4}
                  placeholder="Escribe una breve descripción sobre la empresa..."
                  className="w-full bg-background border border-input focus:border-primary focus:ring-2 focus:ring-ring rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none text-foreground" 
                />
              </div>
            </div>

            {/* CONTACTO Y LOCALIZACIÓN */}
            <div className="space-y-5 pt-4">
              <h2 className="text-lg font-bold text-foreground border-l-4 border-primary pl-3">Contacto y Ubicación</h2>
              
              <div>
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-2">Dirección Física</label>
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Calle, Número, Planta..." className="w-full bg-background border border-input focus:border-primary focus:ring-2 focus:ring-ring rounded-xl px-4 py-3 text-sm outline-none transition-all text-foreground" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-2">Email Comercial</label>
                  <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="info@empresa.com" className="w-full bg-background border border-input focus:border-primary focus:ring-2 focus:ring-ring rounded-xl px-4 py-3 text-sm outline-none transition-all text-foreground" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-2">Teléfono Público</label>
                  <input type="text" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+34 600 000 000" className="w-full bg-background border border-input focus:border-primary focus:ring-2 focus:ring-ring rounded-xl px-4 py-3 text-sm outline-none transition-all text-foreground" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-2">Sitio Web</label>
                <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://www.empresa.com" className="w-full bg-background border border-input focus:border-primary focus:ring-2 focus:ring-ring rounded-xl px-4 py-3 text-sm outline-none transition-all text-foreground" />
              </div>
            </div>

            <div className="pt-8 mt-8 border-t border-border flex justify-end">
              <button type="submit" disabled={loading || fetching} className="px-8 py-3 rounded-xl font-bold text-sm text-secondary-foreground bg-secondary hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Guardando...' : 'Guardar Perfil de Empresa'}
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}