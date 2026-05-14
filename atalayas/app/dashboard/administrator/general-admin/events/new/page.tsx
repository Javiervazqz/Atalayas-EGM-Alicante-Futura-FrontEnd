"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import PageHeader from '@/components/ui/pageHeader';
import { API_ROUTES } from '@/lib/utils';

export default function GAdminNewPublicEvent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', 
    description: '', 
    event_date: '', 
    location: '', 
    max_capacity: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');

      const res = await fetch(API_ROUTES.EVENTS.CREATE, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          ...form,
          max_capacity: form.max_capacity ? parseInt(form.max_capacity) : null,
          // CLAVE: Forzamos null para que sea un evento público/global
          companyId: null 
        })
      });

      if (res.ok) {
        // Redirigimos a la lista de eventos del General Admin
        router.push('/dashboard/administrator/general-admin/events');
      } else {
        const errorData = await res.json();
        alert(`Error al crear: ${errorData.message || "Error desconocido"}`);
      }
    } catch (err) { 
      console.error("Error en la petición:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="flex h-screen bg-[#f5f5f7] dark:bg-[#0d0d0f]">
      <Sidebar role="GENERAL_ADMIN" />
      
      <main className="flex-1 overflow-y-auto no-scrollbar">
        <PageHeader 
          title="Publicar Evento Global" 
          description="Creación de eventos abiertos para todo el ecosistema (sin vinculación a empresa)." 
          backUrl="/dashboard/administrator/general-admin/events" 
        />
        
        <div className="p-10 max-w-3xl mx-auto">
          <form 
            onSubmit={handleSubmit} 
            className="bg-white dark:bg-[#1c1c1e] p-10 rounded-[3rem] shadow-xl space-y-8 border border-black/5"
          >
            <div className="flex items-center gap-3 text-primary">
              <i className="bi bi-globe-americas text-2xl"></i>
              <h2 className="text-xl font-black uppercase italic tracking-tighter">
                Nuevo Evento Público
              </h2>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              {/* Título */}
              <div className="col-span-2">
                <label className="text-[10px] font-black uppercase opacity-40 ml-1 italic">Título del Evento</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Ej. Networking Abierto Alicante Futura"
                  className="w-full p-4 mt-1 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-none font-bold outline-none focus:ring-2 ring-primary/20 transition-all" 
                  value={form.title} 
                  onChange={(e) => setForm({...form, title: e.target.value})} 
                />
              </div>

              {/* Descripción */}
              <div className="col-span-2">
                <label className="text-[10px] font-black uppercase opacity-40 ml-1 italic">Descripción Detallada</label>
                <textarea 
                  rows={4}
                  placeholder="Describe los objetivos y el público del evento..."
                  className="w-full p-4 mt-1 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-none font-bold outline-none focus:ring-2 ring-primary/20 transition-all" 
                  value={form.description} 
                  onChange={(e) => setForm({...form, description: e.target.value})} 
                />
              </div>

              {/* Fecha */}
              <div>
                <label className="text-[10px] font-black uppercase opacity-40 ml-1 italic">Fecha y Hora</label>
                <input 
                  type="datetime-local" 
                  required 
                  className="w-full p-4 mt-1 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-none font-bold outline-none focus:ring-2 ring-primary/20 transition-all" 
                  value={form.event_date} 
                  onChange={(e) => setForm({...form, event_date: e.target.value})} 
                />
              </div>

              {/* Capacidad */}
              <div>
                <label className="text-[10px] font-black uppercase opacity-40 ml-1 italic">Aforo Máximo</label>
                <input 
                  type="number" 
                  placeholder="Sin límite si está vacío"
                  className="w-full p-4 mt-1 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-none font-bold outline-none focus:ring-2 ring-primary/20 transition-all" 
                  value={form.max_capacity} 
                  onChange={(e) => setForm({...form, max_capacity: e.target.value})} 
                />
              </div>

              {/* Ubicación */}
              <div className="col-span-2">
                <label className="text-[10px] font-black uppercase opacity-40 ml-1 italic">Ubicación / Link</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Lugar físico o URL de la reunión"
                  className="w-full p-4 mt-1 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-none font-bold outline-none focus:ring-2 ring-primary/20 transition-all" 
                  value={form.location} 
                  onChange={(e) => setForm({...form, location: e.target.value})} 
                />
              </div>
            </div>

            {/* Botón de acción */}
            <div className="pt-6">
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full py-5 bg-primary text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Procesando...
                  </span>
                ) : 'Publicar Ahora'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}