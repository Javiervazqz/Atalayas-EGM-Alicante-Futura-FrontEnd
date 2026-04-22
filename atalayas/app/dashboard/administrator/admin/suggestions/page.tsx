'use client';

import { useEffect, useState } from 'react';
import { API_ROUTES } from '@/lib/utils';
import Sidebar from '@/components/ui/Sidebar';

// --- TIPOS ---
type SuggestionStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' ;

interface Suggestion {
  id: string;
  title: string;
  content: string;
  status: SuggestionStatus;
  targetRole: 'ADMIN' | 'GENERAL_ADMIN';
  response?: string;
  createdAt: string;
  User?: { name: string; email: string; id: string };
}

const statusConfig: Record<SuggestionStatus, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'Pendiente', color: '#9a5b00', bg: '#fff4e5' },
  ACCEPTED: { label: 'Aceptada', color: '#1a7d32', bg: '#eafaf1' },
  REJECTED: { label: 'Rechazada', color: '#af231c', bg: '#fff1f0' },
};

const Spinner = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', width: '100%', animation: 'fadeIn 0.5s ease-in' }}>
    <div style={{ width: '32px', height: '32px', border: '3px solid rgba(0, 113, 227, 0.1)', borderTop: '3px solid #0071e3', borderRadius: '50%', animation: 'spin 1s cubic-bezier(0.5, 0, 0.5, 1) infinite' }} />
    <span style={{ marginTop: '16px', fontSize: '13px', color: '#86868b', fontWeight: 500 }}>Actualizando...</span>
  </div>
);

const appleFont = "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif";

export default function AdminSuggestionsPage() {
  const [view, setView] = useState<'RECEIVED' | 'SENT'>('RECEIVED');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selected, setSelected] = useState<Suggestion | null>(null);
  const [filter, setFilter] = useState<'ALL' | SuggestionStatus>('PENDING');
  const [loading, setLoading] = useState(true);
  
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseBody, setResponseBody] = useState('');

  const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  const fetchData = async () => {
    setLoading(true);
    try {
      const url = view === 'RECEIVED' 
        ? `${API_ROUTES.SUGGESTIONS.GET_ALL}?target=ADMIN`
        : `${API_ROUTES.SUGGESTIONS.GET_MINE}`;
      
      // CORRECCIÓN: Volvemos a usar 'Authorization'
      const res = await fetch(url, { 
        headers: { 'Authorization': `Bearer ${getToken()}` } 
      });
      
      const data = await res.json();
      setSuggestions(Array.isArray(data) ? data : []);
    } catch (err) { 
      console.error(err); 
    } finally { 
      setTimeout(() => setLoading(false), 300); 
    }
  };

  useEffect(() => { 
    fetchData(); 
    setSelected(null); 
    setFilter('PENDING');
  }, [view]);

  const handleSubmitSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(API_ROUTES.SUGGESTIONS.CREATE, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${getToken()}` 
        },
        body: JSON.stringify({ title: newTitle, content: newContent, targetRole: "GENERAL_ADMIN" }),
      });
      if (res.ok) {
        setNewTitle(""); setNewContent(""); fetchData();
      }
    } catch (err) { console.error(err); } finally { setIsSubmitting(false); }
  };

  const handleRespond = async (status: SuggestionStatus) => {
  if (!selected) return;
  try {
    const res = await fetch(API_ROUTES.SUGGESTIONS.RESPOND(selected.id), {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${getToken()}` 
      },
      body: JSON.stringify({ response: responseBody.trim() || "La administración no ha proporcionado comentarios adicionales." }),
    });

    if (res.ok) {
      const current = Number(localStorage.getItem('count_suggestions')) || 0;
      const newValue = Math.max(0, current - 1);
      localStorage.setItem('count_suggestions', newValue.toString());
      
      window.dispatchEvent(new Event('local-storage-update'));
      // -------------------------------------

      setSelected(null); 
      setResponseBody(''); 
      fetchData(); 
    }
  } catch (err) { 
    console.error(err); 
  }
};

  const filteredSuggestions = suggestions.filter(s => filter === 'ALL' ? true : s.status === filter);

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#fff', overflow: 'hidden', fontFamily: appleFont }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <Sidebar role="ADMIN" />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        <header style={{ padding: '30px 40px 0', background: '#fff', zIndex: 10 }}>
          <div style={{ display: 'flex', gap: '30px', borderBottom: '1px solid #f2f2f2' }}>
            {(['RECEIVED', 'SENT'] as const).map((v) => (
              <button 
                key={v} onClick={() => setView(v)}
                style={{ 
                  background: 'none', border: 'none', padding: '0 0 15px', fontSize: '15px', fontWeight: 600, 
                  color: view === v ? '#1d1d1f' : '#86868b', 
                  borderBottom: view === v ? '2px solid #1d1d1f' : '2px solid transparent', cursor: 'pointer',
                  transition: '0.3s'
                }}
              >
                {v === 'RECEIVED' ? 'Bandeja de Entrada' : 'Mis Solicitudes'}
              </button>
            ))}
          </div>
        </header>

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          
          {view === 'RECEIVED' ? (
            <>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: selected ? '1px solid #f2f2f2' : 'none' }}>
                <div style={{ padding: '20px 40px', display: 'flex', gap: '8px' }}>
                  {(['ALL', 'PENDING', 'ACCEPTED', 'REJECTED'] as const).map((f) => (
                    <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 14px', borderRadius: '20px', border: 'none', fontSize: '12px', fontWeight: 600, cursor: 'pointer', background: filter === f ? '#1d1d1f' : '#f5f5f7', color: filter === f ? '#fff' : '#86868b', transition: '0.2s' }}>
                      {f === 'ALL' ? 'Todas' : statusConfig[f as SuggestionStatus].label}
                    </button>
                  ))}
                </div>
                
                <div style={{ flex: 1, overflowY: 'auto', padding: '0 40px 40px' }}>
                  {loading ? (
                    <Spinner />
                  ) : filteredSuggestions.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#86868b', marginTop: '40px' }}>No hay sugerencias que mostrar.</p>
                  ) : (
                    filteredSuggestions.map((s) => (
                      <div key={s.id} onClick={() => setSelected(s)} style={{ padding: '20px', borderRadius: '12px', marginBottom: '10px', cursor: 'pointer', background: selected?.id === s.id ? '#f5f5f7' : 'transparent', transition: '0.2s', animation: 'slideIn 0.3s ease-out' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: statusConfig[s.status].color }}>{statusConfig[s.status].label.toUpperCase()}</span>
                          <span style={{ fontSize: '11px', color: '#86868b' }}>{new Date(s.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h3 style={{ fontSize: '15px', fontWeight: 600, margin: '0' }}>{s.title}</h3>
                        <p style={{ fontSize: '13px', color: '#86868b', margin: '4px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {selected && (
                <div style={{ width: '45%', padding: '40px', overflowY: 'auto', borderLeft: '1px solid #f2f2f2', animation: 'fadeIn 0.4s ease' }}>
                  <button onClick={() => setSelected(null)} style={{ background: '#f5f5f7', border: 'none', padding: '8px 15px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', marginBottom: '20px' }}>Cerrar ×</button>
                  <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: statusConfig[selected.status].color, marginBottom: '10px' }}>{statusConfig[selected.status].label.toUpperCase()}</span>
                  <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '10px' }}>{selected.title}</h2>
                  
                  <div style={{ marginBottom: '30px' }}>
                    <p style={{ fontSize: '14px', color: '#1d1d1f', margin: 0 }}>
                      Enviado por: <b>{selected.User?.name || 'Usuario no identificado'}</b>
                    </p>
                    <p style={{ fontSize: '12px', color: '#86868b', marginTop: '2px' }}>
                      {selected.User?.email || 'Correo no disponible'}
                    </p>
                  </div>

                  <p style={{ fontSize: '16px', lineHeight: 1.6, color: '#424245', marginBottom: '40px' }}>{selected.content}</p>
                  
                  <div style={{ borderTop: '1px solid #f2f2f2', paddingTop: '30px' }}>
                    {selected.status === 'PENDING' ? (
                      <>
                        <textarea value={responseBody} onChange={e => setResponseBody(e.target.value)} placeholder="Escribe una respuesta a la sugerencia..." style={{ width: '100%', height: '100px', padding: '15px', borderRadius: '12px', border: '1px solid #e5e5e5', outline: 'none', fontSize: '14px', marginBottom: '15px', resize: 'none' }} />
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button onClick={() => handleRespond('ACCEPTED')} style={{ flex: 1, background: '#34c759', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>Aceptar</button>
                          <button onClick={() => handleRespond('REJECTED')} style={{ flex: 1, background: '#ff3b30', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>Rechazar</button>
                        </div>
                      </>
                    ) : (
                      <div style={{ background: '#f5f5f7', padding: '20px', borderRadius: '12px', borderLeft: `4px solid ${statusConfig[selected.status].color}` }}>
                        <h4 style={{ fontSize: '11px', color: '#86868b', textTransform: 'uppercase', marginBottom: '8px' }}>Respuesta de Administración</h4>
                        <p style={{ margin: 0, fontSize: '14px', fontStyle: 'italic', lineHeight: 1.5 }}>"{selected.response}"</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '400px 1fr' }}>
              <div style={{ padding: '40px', borderRight: '1px solid #f2f2f2', background: '#fff' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Nueva Sugerencia</h2>
                <p style={{ color: '#86868b', fontSize: '14px', marginBottom: '30px' }}>Envía tus sugerencias directamente a la administración de Atalayas EGM.</p>
                
                <form onSubmit={handleSubmitSuggestion} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <input placeholder="Título de la sugerencia..." value={newTitle} onChange={e => setNewTitle(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #d2d2d7', outline: 'none', fontSize: '15px' }} required />
                  <textarea placeholder="Detalla tu sugerencia..." value={newContent} onChange={e => setNewContent(e.target.value)} style={{ width: '100%', height: '180px', padding: '14px', borderRadius: '10px', border: '1px solid #d2d2d7', outline: 'none', fontSize: '15px', resize: 'none' }} required />
                  <button type="submit" disabled={isSubmitting} style={{ width: '100%', padding: '14px', borderRadius: '10px', border: 'none', background: '#0071e3', color: '#fff', fontSize: '16px', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
                    {isSubmitting ? 'Enviando...' : 'Enviar Sugerencia'}
                  </button>
                </form>
              </div>

              <div style={{ padding: '40px', overflowY: 'auto', background: '#f5f5f7' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Historial de envíos</h3>
                
                {loading ? (
                  <Spinner />
                ) : suggestions.length === 0 ? (
                  <p style={{ color: '#86868b', fontSize: '14px' }}>Aún no has enviado ninguna propuesta.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {suggestions.map((s) => (
                      <div key={s.id} style={{ background: '#fff', padding: '25px', borderRadius: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', animation: 'slideIn 0.4s ease-out' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <span style={{ fontSize: '10px', fontWeight: 800, padding: '4px 10px', borderRadius: '6px', background: statusConfig[s.status].bg, color: statusConfig[s.status].color, textTransform: 'uppercase' }}>
                            {statusConfig[s.status].label}
                          </span>
                          <span style={{ fontSize: '12px', color: '#86868b' }}>{new Date(s.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h4 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 8px' }}>{s.title}</h4>
                        <p style={{ fontSize: '14px', color: '#424245', lineHeight: 1.5, margin: 0 }}>{s.content}</p>
                        {s.response && (
                          <div style={{ marginTop: '15px', padding: '12px', background: '#f9f9fb', borderRadius: '10px', borderLeft: `3px solid ${statusConfig[s.status].color}` }}>
                            <p style={{ fontSize: '11px', fontWeight: 700, color: '#86868b', textTransform: 'uppercase', marginBottom: '4px' }}>Respuesta:</p>
                            <p style={{ fontSize: '13px', color: '#1d1d1f', margin: 0 }}>{s.response}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}