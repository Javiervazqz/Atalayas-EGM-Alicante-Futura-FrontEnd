'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import PageHeader from '@/components/ui/pageHeader';
import { API_ROUTES } from '@/lib/utils';

export default function NewEmployeePage() {
  const router = useRouter();
  const roleRef = useRef<HTMLSelectElement>(null);
  
  // Estados de los datos
  const [form, setForm] = useState({ 
    email: '', 
    password: '', 
    name: '', 
    companyId: '' 
  });
  
  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);

  // Inicialización de usuario y carga de empresas
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);

      // Si es Super Admin, cargamos todas las empresas para el selector
      if (user.role === 'GENERAL_ADMIN') {
        fetch(API_ROUTES.COMPANIES.GET_ALL, { 
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } 
        })
        .then(res => res.json())
        .then(data => setCompanies(Array.isArray(data) ? data : []));
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      // Determinamos el companyId: si es ADMIN usa el suyo, si es GENERAL usa el del selector
      const finalCompanyId = currentUser.role === 'ADMIN' ? currentUser.companyId : form.companyId;

      const payload = { 
        ...form, 
        role: roleRef.current?.value || 'EMPLOYEE', 
        companyId: finalCompanyId || undefined 
      };

      const res = await fetch(API_ROUTES.USERS.CREATE, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al registrar el usuario');

      // Si todo va bien, volvemos al listado
      router.push('/dashboard/administrator/employees');
      
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
      
      <main className="flex-1 overflow-auto flex flex-col relative">
        {/* BANNER UNIFICADO CON NAVEGACIÓN REFINADA */}
        <PageHeader 
          title="Alta de Usuario"
          description="Introduce los datos para crear un nuevo acceso al sistema."
          icon={<i className="bi bi-person-plus-fill"></i>}
          backUrl="/dashboard/administrator/employees"
        />

        <div className="p-6 lg:p-10 max-w-3xl mx-auto w-full">
          <div className="bg-card rounded-[2rem] shadow-sm border border-border p-8 lg:p-10 transition-all">
            
            {/* Mensajes de Error */}
            {error && (
              <div className="p-4 mb-8 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive font-bold text-xs flex items-center gap-2 animate-in fade-in">
                <i className="bi bi-exclamation-octagon-fill text-sm"></i> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-10">
              
              {/* Encabezado de Sección */}
              <div className="flex items-center gap-4 pb-2 border-b border-border/50">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-lg shrink-0 border border-primary/20">
                  <i className="bi bi-person-vcard"></i>
                </div>
                <h3 className="font-bold text-foreground text-base tracking-tight">
                  Información del nuevo usuario
                </h3>
              </div>

              {/* Formulario en Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                
                {/* Nombre */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">
                    Nombre Completo
                  </label>
                  <input 
                    type="text" 
                    required 
                    onChange={e => setForm({...form, name: e.target.value})} 
                    className="w-full bg-background border border-input rounded-xl px-5 py-3 text-sm font-semibold focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all shadow-sm" 
                    placeholder="Ej: Ana Martínez" 
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">
                    Email Corporativo
                  </label>
                  <input 
                    type="email" 
                    required 
                    onChange={e => setForm({...form, email: e.target.value})} 
                    className="w-full bg-background border border-input rounded-xl px-5 py-3 text-sm font-semibold focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all shadow-sm" 
                    placeholder="ana@empresa.com" 
                  />
                </div>

                {/* Contraseña */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">
                    Contraseña Inicial
                  </label>
                  <input 
                    type="password" 
                    required 
                    onChange={e => setForm({...form, password: e.target.value})} 
                    className="w-full bg-background border border-input rounded-xl px-5 py-3 text-sm font-semibold focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all shadow-sm" 
                    placeholder="••••••••" 
                  />
                </div>

                {/* Rol */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">
                    Rol en el Sistema
                  </label>
                  <select 
                    ref={roleRef} 
                    className="w-full bg-background border border-input rounded-xl px-5 py-3 text-sm font-bold focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none cursor-pointer transition-all shadow-sm"
                  >
                    <option value="EMPLOYEE">Empleado Estándar</option>
                    <option value="ADMIN">Administrador de Empresa</option>
                  </select>
                </div>

                {/* Selector de Empresa (Solo para GENERAL_ADMIN) */}
                {currentUser.role === 'GENERAL_ADMIN' && (
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">
                      Asignar a Empresa
                    </label>
                    <select 
                      value={form.companyId} 
                      required
                      onChange={e => setForm({...form, companyId: e.target.value})}
                      className="w-full bg-background border border-input rounded-xl px-5 py-3 text-sm font-bold focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none cursor-pointer transition-all shadow-sm"
                    >
                      <option value="">Selecciona la empresa propietaria...</option>
                      {companies.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* ACCIONES DEL FORMULARIO */}
              <div className="pt-6 border-t border-border flex justify-end items-center gap-4">
                <button 
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="px-8 py-3 bg-secondary text-secondary-foreground rounded-xl font-bold text-sm hover:opacity-90 shadow-md shadow-secondary/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><i className="bi bi-arrow-repeat animate-spin"></i> Registrando...</>
                  ) : (
                    'Registrar Usuario'
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