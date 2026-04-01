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

  // EFECTO 1: Cargar quién es el usuario y la lista de empresas (si es General Admin)
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
            if (data.length > 0) setSelectedCompanyId(data[0].id); // Seleccionamos la primera por defecto
          }
        } catch (err) {
          console.error('Error cargando lista de empresas:', err);
        }
      } else if (user.role === 'ADMIN' && user.companyId) {
        // Si es Admin normal, forzamos su ID de empresa
        setSelectedCompanyId(user.companyId);
      } else {
        // Si es EMPLOYEE o PUBLIC, lo echamos de aquí
        router.push('/dashboard');
      }
    };
    init();
  }, [router]);

  // EFECTO 2: Cargar los datos de la empresa cada vez que cambie el desplegable
  useEffect(() => {
    if (!selectedCompanyId) return;

    const fetchCompanyData = async () => {
      setFetching(true);
      setError('');
      setSuccess('');
      try {
        const token = localStorage.getItem('token');
        // Suponemos que tienes el endpoint de GET /company/:id
        const res = await fetch(`${API_ROUTES.COMPANIES.GET_ALL}/${selectedCompanyId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error('Error al cargar los datos de la empresa');
        
        const company = await res.json();
        
        // Rellenamos el formulario con los datos que vengan de la base de datos
        setName(company.name || '');
        setAddress(company.address || '');
        setDescription(company.description || '');
        setWebsite(company.website || '');
        setContactEmail(company.contactEmail || '');
        setContactPhone(company.contactPhone || '');
        setCif(company.cif || '');
        setActivity(company.activity || '');
        setCurrentLogoUrl(company.logoUrl || null);
        
        // Limpiamos los estados de subida de imagen al cambiar de empresa
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

  // Manejo de la previsualización del Logo
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

  // Enviar los datos al backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      // Adjuntamos solo los campos que tengan valor
      if (name) formData.append('name', name);
      if (address) formData.append('address', address);
      if (description) formData.append('description', description);
      if (website) formData.append('website', website);
      if (contactEmail) formData.append('contactEmail', contactEmail);
      if (contactPhone) formData.append('contactPhone', contactPhone);
      if (cif) formData.append('cif', cif);
      if (activity) formData.append('activity', activity);
      
      // Adjuntamos el archivo físico si se ha seleccionado uno nuevo
      if (newFile) formData.append('file', newFile); 

      // Petición PATCH al endpoint que creamos antes
      const res = await fetch(`${API_ROUTES.COMPANIES.GET_ALL}/${selectedCompanyId}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }, // Sin Content-Type, el FormData se encarga
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
    <div className="flex min-h-screen bg-[#f5f5f7]" style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" }}>
      <Sidebar role={currentUser.role} />
      
      <main className="flex-1 p-10 overflow-auto flex justify-center">
        <div className="w-full max-w-2xl">
          
          <div className="mb-8 text-center sm:text-left flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#1d1d1f] tracking-tight">Perfil de Empresa</h1>
              <p className="text-[#86868b]">Gestiona la información pública y de contacto de la entidad.</p>
            </div>
            
            {/* 🚀 DESPLEGABLE MÁGICO PARA EL GENERAL_ADMIN */}
            {currentUser.role === 'GENERAL_ADMIN' && (
              <div className="w-full sm:w-auto">
                <label className="block text-[10px] font-bold text-[#86868b] uppercase tracking-wider mb-1">Editando empresa:</label>
                <select 
                  value={selectedCompanyId} 
                  onChange={(e) => setSelectedCompanyId(e.target.value)} 
                  className="w-full sm:w-64 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none cursor-pointer focus:border-[#0071e3] shadow-sm transition-all font-medium text-[#1d1d1f]"
                >
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className={`bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-8 transition-opacity duration-300 ${fetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            
            {error && <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{error}</div>}
            {success && <div className="p-3 bg-green-50 border border-green-100 rounded-xl text-green-700 text-sm font-medium">{success}</div>}

            {/* SECCIÓN AVATAR / LOGO DE EMPRESA */}
            <div className="flex flex-col items-center gap-4 border-b border-gray-100 pb-8">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <img 
                  src={logoPreview || (currentLogoUrl ? encodeURI(currentLogoUrl) : 'https://placehold.co/400x400/f5f5f7/86868b?text=LOGO')} 
                  alt="Logo Empresa" 
                  className="w-32 h-32 rounded-2xl object-cover border-4 border-[#f5f5f7] shadow-sm transition-all group-hover:opacity-80"
                />
                <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs font-bold text-center px-2">Subir Logo</span>
                </div>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              <p className="text-xs text-[#86868b]">Formato cuadrado recomendado. (JPG, PNG)</p>
            </div>

            {/* INFORMACIÓN BÁSICA */}
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-[#1d1d1f] border-l-4 border-[#0071e3] pl-3">Identidad Corporativa</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-[#1d1d1f] uppercase tracking-wider mb-2">Razón Social / Nombre *</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-[#f5f5f7] border-transparent focus:border-[#0071e3] focus:bg-white rounded-xl px-4 py-3 text-sm outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1d1d1f] uppercase tracking-wider mb-2">CIF / NIF</label>
                  <input type="text" value={cif} onChange={(e) => setCif(e.target.value)} placeholder="B12345678" className="w-full bg-[#f5f5f7] border-transparent focus:border-[#0071e3] focus:bg-white rounded-xl px-4 py-3 text-sm outline-none transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1d1d1f] uppercase tracking-wider mb-2">Sector de Actividad</label>
                <input type="text" value={activity} onChange={(e) => setActivity(e.target.value)} placeholder="Ej: Tecnología, Logística..." className="w-full bg-[#f5f5f7] border-transparent focus:border-[#0071e3] focus:bg-white rounded-xl px-4 py-3 text-sm outline-none transition-all" />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1d1d1f] uppercase tracking-wider mb-2">Descripción de la Empresa</label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  rows={4}
                  placeholder="Escribe una breve descripción sobre la empresa..."
                  className="w-full bg-[#f5f5f7] border-transparent focus:border-[#0071e3] focus:bg-white rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none" 
                />
              </div>
            </div>

            {/* CONTACTO Y LOCALIZACIÓN */}
            <div className="space-y-5 pt-4">
              <h2 className="text-lg font-bold text-[#1d1d1f] border-l-4 border-[#0071e3] pl-3">Contacto y Ubicación</h2>
              
              <div>
                <label className="block text-xs font-bold text-[#1d1d1f] uppercase tracking-wider mb-2">Dirección Física</label>
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Calle, Número, Planta..." className="w-full bg-[#f5f5f7] border-transparent focus:border-[#0071e3] focus:bg-white rounded-xl px-4 py-3 text-sm outline-none transition-all" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-[#1d1d1f] uppercase tracking-wider mb-2">Email Comercial</label>
                  <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="info@empresa.com" className="w-full bg-[#f5f5f7] border-transparent focus:border-[#0071e3] focus:bg-white rounded-xl px-4 py-3 text-sm outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1d1d1f] uppercase tracking-wider mb-2">Teléfono Público</label>
                  <input type="text" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+34 600 000 000" className="w-full bg-[#f5f5f7] border-transparent focus:border-[#0071e3] focus:bg-white rounded-xl px-4 py-3 text-sm outline-none transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1d1d1f] uppercase tracking-wider mb-2">Sitio Web</label>
                <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://www.empresa.com" className="w-full bg-[#f5f5f7] border-transparent focus:border-[#0071e3] focus:bg-white rounded-xl px-4 py-3 text-sm outline-none transition-all" />
              </div>
            </div>

            <div className="pt-8 mt-8 border-t border-gray-100 flex justify-end">
              <button type="submit" disabled={loading || fetching} className="px-8 py-3 rounded-xl font-bold text-sm text-white bg-[#0071e3] hover:bg-[#0077ed] transition-all shadow-md active:scale-95 disabled:bg-gray-400">
                {loading ? 'Guardando...' : 'Guardar Perfil de Empresa'}
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}