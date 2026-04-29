'use client';

import { useEffect, useState } from 'react';
import { API_ROUTES } from '@/lib/utils';
import Sidebar from '@/components/ui/Sidebar';
import PageHeader from '@/components/ui/pageHeader';
import SearchBar from '@/components/ui/Searchbar';

interface CompanyRequest {
  id: string;
  companyName: string;
  cif: string;
  contactName: string;
  contactEmail: string;
  phone?: string;
  address?: string;
  activity?: string;
  documentUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';
  rejectReason?: string;
  created_at: string;
  archivedAt?: string | null;
}

const statusConfig = {
  PENDING: { label: 'Pendientes', textColor: 'text-amber-500', bgClass: 'bg-amber-500/10 border-amber-500/20', icon: 'bi-clock-history' },
  APPROVED: { label: 'Aprobadas', textColor: 'text-emerald-600', bgClass: 'bg-emerald-500/10 border-emerald-500/20', icon: 'bi-check-circle' },
  REJECTED: { label: 'Rechazadas', textColor: 'text-destructive', bgClass: 'bg-destructive/10 border-destructive/20', icon: 'bi-x-circle' },
  ARCHIVED: { label: 'Archivadas', textColor: 'text-muted-foreground', bgClass: 'bg-muted border-border/50', icon: 'bi-archive' },
};

export default function CompanyRequestsPage() {
  const [requests, setRequests] = useState<CompanyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<CompanyRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'ARCHIVED'>('PENDING');
  const [pendingCount, setPendingCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  // --- FUNCIÓN DE UTILIDAD PARA ACTUALIZAR EL SIDEBAR ---
  const updateSidebarCounter = () => {
    const current = Number(localStorage.getItem('count_requests')) || 0;
    const newValue = Math.max(0, current - 1);
    localStorage.setItem('count_requests', newValue.toString());
    window.dispatchEvent(new CustomEvent('local-storage-update', { 
      detail: { requests: newValue } 
    }));
  };

  const fetchRequests = async () => {
    setRequests([]);
    setLoading(true);
    try {
      const url = filter === 'ARCHIVED'
        ? API_ROUTES.COMPANY_REQUESTS.GET_ARCHIVED
        : API_ROUTES.COMPANY_REQUESTS.GET_ALL
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingCount = async () => {
    try {
      const res = await fetch(API_ROUTES.COMPANY_REQUESTS.GET_ALL, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      const count = Array.isArray(data) ? data.filter((r: any) => r.status === 'PENDING').length : 0;
      setPendingCount(count);
      
      // Sincronizar storage inicial
      localStorage.setItem('count_requests', count.toString());
      window.dispatchEvent(new CustomEvent('local-storage-update', { detail: { requests: count } }));
    } catch { }
  };

  useEffect(() => { fetchRequests(); fetchPendingCount() }, [filter]);

  const handleApprove = async (id: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(API_ROUTES.COMPANY_REQUESTS.APPROVE(id), {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error('Error al aprobar');
      
      updateSidebarCounter(); // Actualización instantánea
      await fetchRequests();
      await fetchPendingCount();
      setSelected(null);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selected || !rejectReason.trim()) return;
    setActionLoading(true);
    try {
      const res = await fetch(API_ROUTES.COMPANY_REQUESTS.REJECT(selected.id), {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rejectReason }),
      });
      if (!res.ok) throw new Error('Error al rechazar');
      
      updateSidebarCounter(); // Actualización instantánea
      await fetchRequests();
      await fetchPendingCount();
      setSelected(null);
      setShowRejectModal(false);
      setRejectReason('');
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!selected) return;
    try {
      const res = await fetch(API_ROUTES.COMPANY_REQUESTS.ARCHIVE(selected.id), {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok && selected.status === 'PENDING') {
        updateSidebarCounter(); // Solo restamos si archivamos algo que estaba pendiente
      }
      await fetchRequests();
      setSelected(null);
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = (filter === 'ALL' || filter === 'ARCHIVED' ? requests : requests.filter(r => r.status === filter))
    .filter(r =>
      r.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.cif.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.contactEmail.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="flex min-h-screen bg-muted/30 font-sans text-foreground transition-colors duration-300">
      <Sidebar role="GENERAL_ADMIN" />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* ── BANNER PREMIUM ── */}
        <PageHeader 
          title="Solicitudes de Registro"
          description={pendingCount > 0 
            ? `Tienes ${pendingCount} nueva${pendingCount > 1 ? 's' : ''} empresa${pendingCount > 1 ? 's' : ''} esperando aprobación.` 
            : "Gestiona el alta y validación de organizaciones en el sistema."
          }
          icon={<i className="bi bi-envelope-paper"></i>}
          action={
            <SearchBar 
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Buscar por CIF, empresa..."
            />
          }
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* ── BARRA DE FILTROS ── */}
          <div className="px-8 py-4 bg-background/50 border-b border-border/60 flex items-center justify-start gap-2 overflow-x-auto no-scrollbar">
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'ARCHIVED'] as const).map((f) => (
              <button
                key={f}
                onClick={() => { setFilter(f); setSelected(null); }}
                className={`relative px-5 py-2 text-[10px] font-black uppercase tracking-widest transition-all duration-300 rounded-xl border ${
                  filter === f 
                    ? 'bg-primary text-white border-primary shadow-md' 
                    : 'bg-card text-muted-foreground border-border/60 hover:border-primary/40 hover:text-primary'
                }`}
              >
                <span className="relative z-10 flex items-center justify-center">
                  {f === 'ALL' ? 'Todas' : statusConfig[f].label}
                  {f === 'PENDING' && pendingCount > 0 && (
                    <span className={`ml-2 px-1.5 py-0.5 rounded-md text-[9px] font-black ${filter === f ? 'bg-primary text-white' : 'bg-primary text-white animate-pulse'}`}>
                      {pendingCount}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>

          <div className={`flex-1 grid overflow-hidden transition-all duration-500 ${selected ? 'lg:grid-cols-[1fr_450px]' : 'grid-cols-1'}`}>
            
            {/* ── COLUMNA LISTA ── */}
            <div className="overflow-y-auto p-6 lg:p-8 space-y-4 no-scrollbar">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-28 bg-card border border-border/60 rounded-[24px] animate-pulse" />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 bg-card rounded-[32px] border border-dashed border-border/60">
                  <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center text-muted-foreground/30 text-4xl mb-6 shadow-inner">
                    <i className="bi bi-inbox"></i>
                  </div>
                  <h3 className="text-foreground font-black text-xs uppercase tracking-[0.2em]">Bandeja vacía</h3>
                  <p className="text-muted-foreground text-xs mt-1">No hay solicitudes que coincidan con este filtro.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filtered.map((req) => {
                    const status = statusConfig[req.status];
                    const isSelected = selected?.id === req.id;
                    return (
                      <div
                        key={req.id}
                        onClick={() => setSelected(isSelected ? null : req)}
                        className={`group bg-card rounded-[24px] p-6 cursor-pointer border transition-all duration-300 flex items-center justify-between gap-6 ${
                          isSelected
                            ? 'border-primary ring-4 ring-primary/5 shadow-xl -translate-y-1'
                            : 'border-border/60 hover:border-primary/30 hover:shadow-lg'
                        }`}
                      >
                        <div className="flex items-center gap-5 min-w-0">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-2xl transition-colors duration-300 ${isSelected ? 'bg-primary text-white' : 'bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'}`}>
                            <i className="bi bi-building"></i>
                          </div>
                          <div className="min-w-0">
                            <p className="text-foreground text-base font-bold mb-1 truncate group-hover:text-primary transition-colors">
                              {req.companyName}
                            </p>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                              <span className="text-muted-foreground text-xs font-medium">CIF: {req.cif}</span>
                              <span className="w-1 h-1 rounded-full bg-border" />
                              <span className="text-muted-foreground text-xs font-medium">{req.contactName}</span>
                            </div>
                            <p className="text-muted-foreground/50 text-[10px] uppercase font-black tracking-widest mt-2">
                              <i className="bi bi-calendar3 mr-1"></i> {new Date(req.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <span className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-wider ${status.bgClass} ${status.textColor}`}>
                            <i className={`bi ${status.icon}`}></i>
                            {status.label.slice(0, -1)}
                          </span>
                          <i className={`bi bi-chevron-right text-muted-foreground/30 transition-transform duration-300 ${isSelected ? 'rotate-90 text-primary' : 'group-hover:translate-x-1'}`}></i>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── PANEL DE DETALLE (Flotante Premium) ── */}
            {selected && (
              <div className="overflow-y-auto border-l border-border/60 bg-card p-8 shadow-[-20px_0_40px_rgba(0,0,0,0.03)] animate-in slide-in-from-right-10 duration-500 no-scrollbar">
                <div className="flex items-center justify-between mb-10">
                  <span className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest ${statusConfig[selected.status].bgClass} ${statusConfig[selected.status].textColor}`}>
                    Estado: {statusConfig[selected.status].label.slice(0, -1)}
                  </span>
                  <button
                    onClick={() => setSelected(null)}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all hover:rotate-90"
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                </div>

                <div className="mb-10 text-center sm:text-left">
                  <div className="w-20 h-20 bg-primary/5 text-primary rounded-[28px] flex items-center justify-center text-4xl mb-6 shadow-sm border border-primary/10">
                    <i className="bi bi-building-check"></i>
                  </div>
                  <h3 className="text-foreground text-3xl font-black mb-2 tracking-tight leading-none">
                    {selected.companyName}
                  </h3>
                  <p className="text-muted-foreground font-medium">Solicitud de alta corporativa</p>
                </div>

                {/* Grid de Información */}
                <div className="grid gap-3 mb-10">
                  {[
                    { label: 'Identificación Fiscal', value: selected.cif, icon: 'bi-hash' },
                    { label: 'Sector / Actividad', value: selected.activity, icon: 'bi-briefcase' },
                    { label: 'Ubicación Sede', value: selected.address, icon: 'bi-geo-alt' },
                    { label: 'Persona de Contacto', value: selected.contactName, icon: 'bi-person' },
                    { label: 'Correo Electrónico', value: selected.contactEmail, icon: 'bi-envelope' },
                    { label: 'Teléfono Directo', value: selected.phone, icon: 'bi-telephone' },
                  ].filter(f => f.value).map((field) => (
                    <div key={field.label} className="bg-muted/30 p-4 rounded-[20px] border border-border/40 flex items-start gap-4">
                      <i className={`bi ${field.icon} text-primary mt-1`}></i>
                      <div>
                        <p className="text-muted-foreground/60 text-[9px] font-black uppercase tracking-[0.15em] mb-1">{field.label}</p>
                        <p className="text-foreground text-sm font-bold leading-tight">{field.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Documento Adjunto */}
                <div className="mb-10">
                  <p className="text-muted-foreground/60 text-[10px] font-black uppercase tracking-[0.2em] mb-4 ml-1 text-center sm:text-left">Verificación Legal</p>
                  <a
                    href={selected.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-5 bg-card border-2 border-dashed border-border hover:border-primary/40 hover:bg-primary/5 rounded-[24px] transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                        <i className="bi bi-file-earmark-pdf"></i>
                      </div>
                      <div>
                        <p className="text-foreground font-black text-xs uppercase tracking-widest">Documento acreditativo</p>
                        <p className="text-muted-foreground text-[10px] font-medium">Validar CIF y titularidad</p>
                      </div>
                    </div>
                    <i className="bi bi-arrow-up-right text-muted-foreground group-hover:text-primary transition-colors"></i>
                  </a>
                </div>

                {/* Mensaje de Rechazo */}
                {selected.rejectReason && (
                  <div className="bg-destructive/5 border border-destructive/20 rounded-[24px] p-6 mb-10 animate-in zoom-in-95 duration-300">
                    <p className="text-destructive text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                      <i className="bi bi-exclamation-octagon"></i> Motivo del rechazo
                    </p>
                    <p className="text-foreground text-sm font-medium leading-relaxed italic">"{selected.rejectReason}"</p>
                  </div>
                )}

                {/* Acciones de Control */}
                <div className="sticky bottom-0 bg-card pt-4 pb-2">
                  {selected.status === 'PENDING' && (
                    <div className="grid gap-3">
                      <button
                        onClick={() => handleApprove(selected.id)}
                        disabled={actionLoading}
                        className="w-full py-4 bg-emerald-500 text-white rounded-[18px] font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                      >
                        {actionLoading ? <i className="bi bi-arrow-repeat animate-spin text-lg"></i> : <i className="bi bi-check-lg text-lg"></i>}
                        Aprobar Empresa
                      </button>
                      <button
                        onClick={() => setShowRejectModal(true)}
                        disabled={actionLoading}
                        className="w-full py-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-[18px] font-black text-xs uppercase tracking-[0.2em] hover:bg-destructive hover:text-white transition-all active:scale-95 disabled:opacity-50"
                      >
                        Rechazar Solicitud
                      </button>
                    </div>
                  )}

                  {(selected.status === 'APPROVED' || selected.status === 'REJECTED') && !selected.archivedAt && (
                    <button
                      onClick={async () => {
                        await fetch(API_ROUTES.COMPANY_REQUESTS.ARCHIVE(selected.id), {
                          method: 'PATCH',
                          headers: { Authorization: `Bearer ${getToken()}` },
                        });
                        await fetchRequests();
                        setSelected(null);
                      }}
                      className="w-full py-4 bg-muted text-muted-foreground border border-border/60 rounded-[18px] font-black text-xs uppercase tracking-[0.2em] hover:bg-background hover:text-foreground transition-all flex items-center justify-center gap-3"
                    >
                      <i className="bi bi-archive"></i> Archivar para histórico
                    </button>
                  )}

                  {selected.archivedAt && (
                    <button
                      onClick={async () => {
                        await fetch(API_ROUTES.COMPANY_REQUESTS.UNARCHIVE(selected.id), {
                          method: 'PATCH',
                          headers: {Authorization: `Bearer ${getToken()}`},
                        });
                        setFilter(selected.status as any);
                        await fetchRequests();
                        setSelected(null);
                      }}
                      className="w-full py-4 bg-primary/10 text-primary border border-primary/20 rounded-[18px] font-black text-xs uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-3"
                    >
                      <i className="bi bi-arrow-up-circle"></i> Restaurar Solicitud
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── MODAL RECHAZO (REDISEÑADO) ── */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
            <div className="bg-card border border-border rounded-[40px] p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-[20px] flex items-center justify-center mb-6 text-3xl">
                <i className="bi bi-slash-circle"></i>
              </div>
              <h3 className="text-foreground text-2xl font-black mb-2 tracking-tight uppercase">Rechazar Alta</h3>
              <p className="text-muted-foreground text-sm font-medium mb-8 leading-relaxed">
                Por favor, detalla el motivo del rechazo. El solicitante recibirá esta explicación para poder corregir su solicitud.
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ej: El CIF no coincide con el documento adjunto..."
                rows={4}
                className="w-full bg-muted/30 border border-border/60 focus:border-destructive/40 focus:ring-4 focus:ring-destructive/5 rounded-[20px] p-5 text-sm text-foreground outline-none resize-none mb-8 transition-all font-medium placeholder:text-muted-foreground/40"
              />
              <div className="flex gap-4">
                <button
                  onClick={() => { setShowRejectModal(false); setRejectReason(''); }}
                  className="flex-1 py-4 bg-muted text-muted-foreground rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-border/60 transition-all active:scale-95"
                >
                  Volver
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectReason.trim() || actionLoading}
                  className="flex-1 py-4 bg-destructive text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:opacity-95 shadow-lg shadow-destructive/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  {actionLoading ? 'Enviando...' : 'Confirmar Rechazo'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}