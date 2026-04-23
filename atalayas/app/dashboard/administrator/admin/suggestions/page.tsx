'use client';

import { useEffect, useState, useCallback } from 'react';
import { API_ROUTES } from '@/lib/utils';
import Sidebar from '@/components/ui/Sidebar';
import PageHeader from '@/components/ui/pageHeader';

// ... (Tipos y statusConfig se mantienen igual)
type SuggestionStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';
interface Suggestion {
  id: string; title: string; content: string; status: SuggestionStatus;
  targetRole: 'ADMIN' | 'GENERAL_ADMIN'; response?: string; createdAt: string;
  User?: { name: string; email: string; id: string };
}

const statusConfig: Record<SuggestionStatus, { label: string; textColor: string; bgClass: string }> = {
  PENDING: { label: 'Pendiente', textColor: 'text-amber-500', bgClass: 'bg-amber-500/10 border-amber-500/20' },
  ACCEPTED: { label: 'Aceptada', textColor: 'text-emerald-600', bgClass: 'bg-emerald-500/10 border-emerald-500/20' },
  REJECTED: { label: 'Rechazada', textColor: 'text-destructive', bgClass: 'bg-destructive/10 border-destructive/20' },
};

export default function AdminSuggestionsPage() {
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<'RECEIVED' | 'SENT'>('RECEIVED');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selected, setSelected] = useState<Suggestion | null>(null);
  const [filter, setFilter] = useState<'ALL' | SuggestionStatus>('PENDING');
  const [loading, setLoading] = useState(true);
  
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseBody, setResponseBody] = useState('');

  // Memorizamos fetchData para que no cambie la referencia en cada render
  const fetchData = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
    if (!token) return;

    setLoading(true);
    try {
      const url = view === 'RECEIVED' 
        ? `${API_ROUTES.SUGGESTIONS.GET_ALL}?target=ADMIN`
        : `${API_ROUTES.SUGGESTIONS.GET_MINE}`;
      
      const res = await fetch(url, { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      
      const data = await res.json();
      setSuggestions(Array.isArray(data) ? data : []);
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  }, [view]); // Solo cambia si cambia la pestaña (view)

  // 1. Control de montaje (Hydration)
  useEffect(() => {
    setMounted(true);
  }, []);

  // 2. Control de carga de datos (Evita el bucle infinito)
  useEffect(() => {
    if (mounted) {
      fetchData();
      setSelected(null);
      setFilter('PENDING');
    }
  }, [view, mounted, fetchData]);

  const handleSubmitSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(API_ROUTES.SUGGESTIONS.CREATE, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          title: newTitle, 
          content: newContent, 
          targetRole: "GENERAL_ADMIN",
          authorId: user?.id,
          authorRole: "ADMIN"
        }),
      });
      if (res.ok) {
        setNewTitle(""); setNewContent(""); fetchData();
      }
    } catch (err) { console.error(err); } finally { setIsSubmitting(false); }
  };

  const handleRespond = async (status: SuggestionStatus) => {
    if (!selected) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(API_ROUTES.SUGGESTIONS.RESPOND(selected.id), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
          response: responseBody.trim() || "Procesado.",
          status 
        }),
      });

      if (res.ok) {
      // --- ACTUALIZACIÓN AUTOMÁTICA ---
      
      // 1. Actualizamos el contador en localStorage
      const currentCount = Number(localStorage.getItem('count_suggestions')) || 0;
      const newCount = Math.max(0, currentCount - 1);
      localStorage.setItem('count_suggestions', newCount.toString());

      // 2. Disparamos el evento para que el Sidebar se entere al instante
      window.dispatchEvent(new Event('local-storage-update'));

      // 3. Limpiamos la selección y refrescamos la lista actual
      setSelected(null);
      setResponseBody('');
      fetchData(); // Esto quita la sugerencia de la lista "Pendientes"
    } else {
      alert("Error al procesar la respuesta");
    }
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(API_ROUTES.SUGGESTIONS.DELETE(id), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchData();
    } catch (err) { console.error(err); }
  };

  if (!mounted) return null;

  const filteredSuggestions = suggestions.filter(s => filter === 'ALL' ? true : s.status === filter);

  return (
    <div className="flex min-h-screen bg-[#fcfcfd] font-sans text-foreground">
      <Sidebar role="ADMIN" />
      <main className="flex-1 flex flex-col overflow-hidden">
        <PageHeader 
          title="Sugerencias"
          description={view === 'RECEIVED' ? "Bandeja de entrada" : "Mis propuestas"}
          icon={<i className="bi bi-chat-square-dots"></i>}
          action={
            <div className="flex bg-muted/50 p-1 rounded-xl border border-border/50">
              {(['RECEIVED', 'SENT'] as const).map((v) => (
                <button key={v} onClick={() => setView(v)}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${view === v ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground'}`}
                >
                  {v === 'RECEIVED' ? 'Recibidas' : 'Enviadas'}
                </button>
              ))}
            </div>
          }
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          {view === 'RECEIVED' ? (
            <>
              <div className="px-8 py-4 flex gap-2 border-b border-border/40 bg-white">
                {(['ALL', 'PENDING', 'ACCEPTED', 'REJECTED'] as const).map((f) => (
                  <button key={f} onClick={() => { setFilter(f); setSelected(null); }}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-bold border transition-all ${filter === f ? 'bg-primary text-white border-primary' : 'bg-background text-muted-foreground border-border/60'}`}
                  >
                    {f === 'ALL' ? 'Todas' : statusConfig[f as SuggestionStatus].label}
                  </button>
                ))}
              </div>
              <div className={`flex-1 grid transition-all duration-500 ${selected ? 'lg:grid-cols-[1fr_450px]' : 'grid-cols-1'}`}>
                <div className="overflow-y-auto p-8 space-y-3 no-scrollbar">
                  {loading ? <p className="text-center py-10 opacity-50">Cargando...</p> : filteredSuggestions.map((s) => (
                    <div key={s.id} onClick={() => setSelected(s)} className={`p-5 rounded-[22px] border cursor-pointer transition-all ${selected?.id === s.id ? 'bg-white border-primary shadow-md' : 'bg-white border-border/50'}`}>
                      <div className="flex justify-between items-start">
                        <div><h4 className="font-bold text-sm mb-1">{s.title}</h4><p className="text-xs text-muted-foreground">{s.User?.name} • {new Date(s.createdAt).toLocaleDateString()}</p></div>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${statusConfig[s.status].textColor}`}>{statusConfig[s.status].label}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {selected && (
                  <div className="bg-white border-l border-border/60 p-8 overflow-y-auto animate-in slide-in-from-right-5">
                    <div className="flex justify-between mb-6">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${statusConfig[selected.status].textColor}`}>{statusConfig[selected.status].label}</span>
                      <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-destructive text-xl"><i className="bi bi-x"></i></button>
                    </div>
                    <h2 className="text-xl font-black mb-4">{selected.title}</h2>
                    <div className="bg-muted/30 p-6 rounded-3xl border border-border/40 mb-8 italic text-sm">"{selected.content}"</div>
                    {selected.status === 'PENDING' ? (
                      <div className="space-y-4 pt-6 border-t">
                        <textarea value={responseBody} onChange={e => setResponseBody(e.target.value)} placeholder="Respuesta..." className="w-full p-4 bg-muted/20 border border-border/60 rounded-2xl text-sm h-32 focus:outline-none" />
                        <div className="flex gap-2">
                          <button onClick={() => handleRespond('ACCEPTED')} className="flex-1 py-3 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Aceptar</button>
                          <button onClick={() => handleRespond('REJECTED')} className="flex-1 py-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl text-[10px] font-black uppercase tracking-widest">Rechazar</button>
                        </div>
                      </div>
                    ) : (
                      <div className={`p-5 rounded-2xl border ${statusConfig[selected.status].bgClass}`}><p className="text-sm italic font-medium">"{selected.response}"</p></div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 grid lg:grid-cols-[400px_1fr] overflow-hidden">
              <div className="p-8 border-r border-border/40 bg-white overflow-y-auto">
                <h3 className="font-black text-lg mb-6">Nueva Sugerencia</h3>
                <form onSubmit={handleSubmitSuggestion} className="space-y-5">
                  <input placeholder="Asunto" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full p-4 bg-muted/20 border border-border/60 rounded-2xl text-sm font-bold focus:ring-1 focus:ring-primary/30 outline-none" required />
                  <textarea placeholder="Descripción..." value={newContent} onChange={e => setNewContent(e.target.value)} className="w-full p-4 bg-muted/20 border border-border/60 rounded-2xl text-sm min-h-50 focus:ring-1 focus:ring-primary/30 outline-none" required />
                  <button disabled={isSubmitting} className="w-full py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] disabled:opacity-50">{isSubmitting ? 'Enviando...' : 'Enviar a Atalayas EGM'}</button>
                </form>
              </div>
              <div className="p-8 overflow-y-auto bg-[#f8f9fb]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Mis Envíos</h3>
                  <div className="flex gap-1.5 bg-white p-1 rounded-xl border border-border/40">
                    {(['ALL', 'PENDING', 'ACCEPTED', 'REJECTED'] as const).map((f) => (
                      <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${filter === f ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'}`}>{f === 'ALL' ? 'Todo' : statusConfig[f as SuggestionStatus].label}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  {loading ? <p>Cargando...</p> : filteredSuggestions.map((s) => (
                    <div key={s.id} className="group bg-white border border-border/40 rounded-[28px] p-6 shadow-sm relative">
                      <div className="flex justify-between items-start mb-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${statusConfig[s.status].bgClass} ${statusConfig[s.status].textColor}`}>{statusConfig[s.status].label}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-muted-foreground font-bold">{new Date(s.createdAt).toLocaleDateString()}</span>
                          {s.status === 'PENDING' && (
                            <button onClick={() => handleDelete(s.id)} className="w-8 h-8 rounded-lg bg-destructive/5 text-destructive hover:bg-destructive hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"><i className="bi bi-trash3"></i></button>
                          )}
                        </div>
                      </div>
                      <h4 className="font-bold text-foreground mb-1">{s.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-4">{s.content}</p>
                      {s.response && <div className="mt-4 pt-4 border-t border-border/30"><p className="text-xs font-bold italic opacity-80">"{s.response}"</p></div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}