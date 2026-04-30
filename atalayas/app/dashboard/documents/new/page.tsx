'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import { API_ROUTES } from '@/lib/utils';

export default function NewDocumentPage() {
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [companyId, setCompanyId] = useState(''); 
  const [userId, setUserId] = useState('');       
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);

        if (user.role === 'GENERAL_ADMIN') {
          try {
            const token = localStorage.getItem('token');
            const res = await fetch(API_ROUTES.COMPANIES.GET_ALL, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            
            if (Array.isArray(data)) setCompanies(data);
            else if (data?.data && Array.isArray(data.data)) setCompanies(data.data);
            else if (data?.companies && Array.isArray(data.companies)) setCompanies(data.companies);
          } catch (error) {
            console.error("Error al cargar empresas:", error);
          }
        }
      }
    };
    loadInitialData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Debes seleccionar un archivo físico.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      formData.append('title', title);
      formData.append('file', file);
      formData.append('isPublic', isPublic.toString());
      
      if (currentUser.role === 'GENERAL_ADMIN') {
        if (companyId.trim() !== '') formData.append('companyId', companyId);
      } else {
        if (currentUser.companyId) formData.append('companyId', currentUser.companyId);
      }

      if (userId.trim() !== '') {
        formData.append('userId', userId.trim());
      }

      const res = await fetch(API_ROUTES.DOCUMENTS.GET_ALL, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}` 
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        const errorMsg = Array.isArray(data.message) ? data.message.join(', ') : data.message;
        throw new Error(errorMsg || 'Error al subir el documento');
      }

      router.back();
      router.refresh();
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="flex min-h-screen bg-background font-sans">
      <Sidebar role={currentUser.role} />
      <main className="flex-1 p-6 lg:p-10 overflow-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-secondary hover:opacity-80 font-semibold text-sm mb-6 transition-opacity">
          <i className="bi bi-chevron-left"></i> Volver
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Subir Documento</h1>
          <p className="text-muted-foreground mt-1">Añade archivos al sistema y configura su visibilidad.</p>
        </div>

        <div className="bg-card rounded-3xl shadow-sm border border-border p-8 max-w-2xl">
          {error && <div className="p-4 mb-6 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive font-medium text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-2">Título del Documento *</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Ej: Manual de Prevención de Riesgos" 
                required 
                className="w-full bg-background border border-input focus:border-primary focus:ring-2 focus:ring-ring rounded-xl px-4 py-3 text-sm outline-none transition-all text-foreground" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-2">Archivo Físico *</label>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={(e) => setFile(e.target.files?.[0] || null)} 
                required 
                className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer text-muted-foreground" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-2">Visibilidad</label>
                <select 
                  value={isPublic ? 'true' : 'false'} 
                  onChange={(e) => setIsPublic(e.target.value === 'true')} 
                  className="w-full bg-background rounded-xl px-4 py-3 text-sm outline-none cursor-pointer border border-input focus:border-primary focus:ring-2 focus:ring-ring transition-all text-foreground"
                >
                  <option value="true">Público (Visible para todos)</option>
                  <option value="false">Privado (Solo seleccionados)</option>
                </select>
              </div>

              {currentUser.role === 'GENERAL_ADMIN' ? (
                <div>
                  <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-2">Empresa asignada</label>
                  <select 
                    value={companyId} 
                    onChange={(e) => setCompanyId(e.target.value)} 
                    className="w-full bg-background rounded-xl px-4 py-3 text-sm outline-none cursor-pointer border border-input focus:border-primary focus:ring-2 focus:ring-ring transition-all text-foreground"
                  >
                    <option value="">Global (Sin empresa específica)</option>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Empresa asignada</label>
                  <input 
                    type="text" 
                    disabled 
                    value="Vinculado a tu empresa" 
                    className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm outline-none text-muted-foreground cursor-not-allowed" 
                  />
                </div>
              )}

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-2">ID del Empleado (Opcional)</label>
                <input 
                  type="text" 
                  value={userId} 
                  onChange={(e) => setUserId(e.target.value)} 
                  placeholder="Pega el UUID del usuario si es exclusivo" 
                  className="w-full bg-background border border-input focus:border-primary focus:ring-2 focus:ring-ring rounded-xl px-4 py-3 text-sm outline-none transition-all text-foreground" 
                />
                <p className="text-xs text-muted-foreground mt-2">Si es un documento confidencial para un único usuario, pega aquí su identificador.</p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-border flex justify-end gap-3">
              <button 
                type="submit" 
                disabled={loading || !file || !title} 
                className="px-8 py-3 rounded-xl font-bold text-sm text-secondary-foreground bg-secondary hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Subiendo...' : 'Subir documento'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}