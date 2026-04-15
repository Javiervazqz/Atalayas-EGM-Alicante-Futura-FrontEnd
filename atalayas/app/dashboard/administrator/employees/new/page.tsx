'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import { API_ROUTES } from '@/lib/utils';

export default function NewEmployeePage() {
  const router = useRouter();
  
  const roleRef = useRef<HTMLSelectElement>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyId, setCompanyId] = useState(''); 
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);

      if (user.role === 'GENERAL_ADMIN') {
        fetch(API_ROUTES.COMPANIES.GET_ALL, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        .then(res => res.json())
        .then(data => { if (Array.isArray(data)) setCompanies(data); });
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const selectedRole = roleRef.current?.value || 'PUBLIC';
    
    try {
      const token = localStorage.getItem('token');
      const finalCompanyId = currentUser.role === 'ADMIN' ? currentUser.companyId : companyId;

      const payload = { 
        email, 
        password, 
        name, 
        role: selectedRole, 
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
      if (!res.ok) throw new Error(data.message || 'Error al crear el empleado');

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
      <main className="flex-1 p-6 lg:p-12 overflow-auto">
        <div className="max-w-2xl mx-auto">
          <header className="mb-10">
             <button onClick={() => router.back()} className="flex items-center gap-2 text-secondary hover:opacity-80 font-bold text-sm mb-6 transition-opacity">
               <i className="bi bi-chevron-left"></i> Volver
             </button>

             <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">Alta de usuario</h1>
             <p className="text-muted-foreground mt-2 font-medium">Introduce los datos para el nuevo acceso al sistema.</p>
          </header>

          <div className="bg-card rounded-3xl shadow-sm border border-border p-6 lg:p-10">
            {error && <div className="p-4 mb-6 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive font-bold text-sm flex items-center gap-2"><i className="bi bi-exclamation-triangle-fill"></i> {error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="bg-muted/30 p-6 rounded-2xl border border-border/50 mb-6 flex items-center gap-5">
                 <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary text-2xl shrink-0"><i className="bi bi-person-badge"></i></div>
                 <div>
                   <h3 className="font-bold text-foreground">Perfil de acceso</h3>
                   <p className="text-xs text-muted-foreground font-medium mt-1">Este usuario recibirá un email para acceder a la plataforma.</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-2 ml-1">Nombre completo *</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Ana García" required className="w-full bg-background border border-input focus:border-primary focus:ring-2 focus:ring-ring rounded-xl px-5 py-4 text-sm font-semibold outline-none transition-all text-foreground placeholder:text-muted-foreground/50 placeholder:font-medium" />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-2 ml-1">Email corporativo *</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ana@empresa.com" required className="w-full bg-background border border-input focus:border-primary focus:ring-2 focus:ring-ring rounded-xl px-5 py-4 text-sm font-semibold outline-none transition-all text-foreground placeholder:text-muted-foreground/50 placeholder:font-medium" />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-2 ml-1">Contraseña inicial *</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required className="w-full bg-background border border-input focus:border-primary focus:ring-2 focus:ring-ring rounded-xl px-5 py-4 text-sm font-semibold outline-none transition-all text-foreground placeholder:text-muted-foreground/50 placeholder:font-medium" />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-2 ml-1">Rol del sistema *</label>
                  <select 
                    ref={roleRef}
                    defaultValue="PUBLIC"
                    className="w-full bg-background border border-input focus:border-primary focus:ring-2 focus:ring-ring rounded-xl px-5 py-4 text-sm font-semibold outline-none cursor-pointer transition-all text-foreground"
                  >
                    {currentUser.role === 'GENERAL_ADMIN' && <option value="PUBLIC">Acceso Público (Visitante)</option> }
                    <option value="EMPLOYEE">Empleado Estándar</option>
                    <option value="ADMIN">Administrador de Empresa</option>
                    {currentUser.role === 'GENERAL_ADMIN' && <option value="GENERAL_ADMIN">Administrador General (EGM)</option>}
                  </select>
                </div>

                {currentUser.role === 'GENERAL_ADMIN' && (
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-2 ml-1">Asignar a Empresa (Si aplica)</label>
                    <select 
                      value={companyId} 
                      onChange={(e) => setCompanyId(e.target.value)} 
                      required 
                      className="w-full bg-background border border-input focus:border-primary focus:ring-2 focus:ring-ring rounded-xl px-5 py-4 text-sm font-semibold outline-none cursor-pointer transition-all text-foreground"
                    >
                      <option value="">Seleccionar empresa propietaria...</option>
                      {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                )}
              </div>

              <div className="pt-8 mt-4">
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full py-4 rounded-xl font-bold text-base text-secondary-foreground bg-secondary hover:opacity-90 transition-opacity shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {loading ? <><i className="bi bi-arrow-repeat animate-spin"></i> Registrando...</> : 'Crear cuenta de usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}