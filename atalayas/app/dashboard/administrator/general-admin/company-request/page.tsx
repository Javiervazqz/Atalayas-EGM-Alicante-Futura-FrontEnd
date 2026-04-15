'use client';

import { useEffect, useState } from 'react';
import { API_ROUTES } from '@/lib/utils';
import Sidebar from '@/components/ui/Sidebar';
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
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ARCHIVED' ;
  rejectReason?: string;
  created_at: string;
  archivedAt?: string | null;
}

const statusConfig = {
  PENDING: { label: 'Pendientes', textColor: 'text-amber-500', bgClass: 'bg-amber-500/10 border-amber-500/20' },
  APPROVED: { label: 'Aprobadas', textColor: 'text-emerald-600', bgClass: 'bg-emerald-500/10 border-emerald-500/20' },
  REJECTED: { label: 'Rechazadas', textColor: 'text-destructive', bgClass: 'bg-destructive/10 border-destructive/20' },
  ARCHIVED: { label: 'Archivadas', textColor: 'text-muted-foreground', bgClass: 'bg-muted border-border' },
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
      setPendingCount(Array.isArray(data) ? data.filter((r: any) => r.status === 'PENDING').length : 0);
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
      await fetchRequests();
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
      await fetchRequests();
      setSelected(null);
      setShowRejectModal(false);
      setRejectReason('');
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
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
    <div className="flex min-h-screen bg-background font-sans">
      <Sidebar role="GENERAL_ADMIN" />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-card border-b border-border px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">
                Solicitudes de empresa
              </h1>
              <p className="text-muted-foreground text-sm">
                Gestiona las solicitudes de alta de nuevas empresas
              </p>
            </div>
            {pendingCount > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-full px-3.5 py-1.5 flex items-center shadow-sm">
                <span className="text-amber-600 text-xs font-bold tracking-wide">
                  <i className="bi bi-bell-fill mr-1"></i> {pendingCount} pendiente{pendingCount > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-6 gap-4">
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar max-w-full">
              {(['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'ARCHIVED'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all shrink-0 border ${
                    filter === f 
                      ? 'bg-foreground text-background border-foreground shadow-sm' 
                      : 'bg-background text-muted-foreground border-border hover:bg-muted'
                  }`}
                >
                  {f === 'ALL' ? 'Todas' : statusConfig[f].label}
                </button>
              ))}
            </div>
            <div className="w-full sm:w-auto shrink-0">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Buscar solicitud..."
              />
            </div>
          </div>
        </div>

        <div className={`grid flex-1 overflow-hidden transition-all duration-300 ${selected ? 'grid-cols-1 lg:grid-cols-[1fr_400px]' : 'grid-cols-1'}`}>
          
          {/* Lista */}
          <div className="p-6 lg:p-8 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-24 bg-card border border-border rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-border rounded-3xl bg-card">
                <p className="text-5xl mb-4 text-muted-foreground/30"><i className="bi bi-inbox"></i></p>
                <p className="text-foreground font-bold text-lg mb-1">No hay solicitudes</p>
                <p className="text-muted-foreground text-sm">No se encontraron solicitudes {filter !== 'ALL' ? statusConfig[filter].label.toLowerCase() : ''}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filtered.map((req) => {
                  const status = statusConfig[req.status];
                  const isSelected = selected?.id === req.id;
                  return (
                    <div
                      key={req.id}
                      onClick={() => setSelected(isSelected ? null : req)}
                      className={`bg-card rounded-2xl p-5 cursor-pointer border transition-all flex items-center justify-between gap-4 ${
                        isSelected
                          ? 'border-primary ring-2 ring-primary/20 shadow-md'
                          : 'border-border hover:border-secondary hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center shrink-0 text-xl text-muted-foreground">
                          <i className="bi bi-building"></i>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-foreground text-base font-bold mb-0.5 truncate">
                            {req.companyName}
                          </p>
                          <p className="text-muted-foreground text-xs mb-1 truncate">
                            CIF: {req.cif} · {req.contactName}
                          </p>
                          <p className="text-muted-foreground/70 text-[10px] uppercase font-bold tracking-wider">
                            <i className="bi bi-calendar-event"></i> {req.created_at ? new Date(req.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Sin fecha'}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full border text-xs font-bold shrink-0 ${status.bgClass} ${status.textColor}`}>
                        {status.label.slice(0, -1)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Panel detalle */}
          {selected && (
            <div className="overflow-y-auto border-l border-border bg-card p-8 shadow-[-10px_0_30px_rgba(0,0,0,0.02)] animate-in slide-in-from-right-8 duration-300">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-foreground text-lg font-bold tracking-tight">
                  Detalle solicitud
                </h2>
                <button
                  onClick={() => setSelected(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>

              {/* Info empresa */}
              <div className="mb-8">
                <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center text-2xl mb-4 text-muted-foreground shadow-sm">
                  <i className="bi bi-building"></i>
                </div>
                <h3 className="text-foreground text-2xl font-extrabold mb-3 tracking-tight leading-tight">
                  {selected.companyName}
                </h3>
                <span className={`px-3 py-1 rounded-full border text-xs font-bold inline-block ${statusConfig[selected.status].bgClass} ${statusConfig[selected.status].textColor}`}>
                  {statusConfig[selected.status].label.slice(0, -1)}
                </span>
              </div>

              {/* Campos */}
              <div className="space-y-4 mb-8">
                {[
                  { label: 'CIF', value: selected.cif },
                  { label: 'Actividad', value: selected.activity },
                  { label: 'Dirección', value: selected.address },
                  { label: 'Responsable', value: selected.contactName },
                  { label: 'Email', value: selected.contactEmail },
                  { label: 'Teléfono', value: selected.phone },
                ].filter(f => f.value).map((field) => (
                  <div key={field.label} className="bg-background p-3.5 rounded-xl border border-border">
                    <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-1">
                      {field.label}
                    </p>
                    <p className="text-foreground text-sm font-medium">{field.value}</p>
                  </div>
                ))}
              </div>

              {/* Documento */}
              <div className="mb-8">
                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-2 ml-1">
                  Documento acreditativo
                </p>
                <a
                  href={selected.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-primary/10 border border-primary/20 rounded-xl text-primary text-sm font-bold hover:bg-primary/20 transition-colors group"
                >
                  <span className="flex items-center gap-2"><i className="bi bi-file-earmark-pdf text-lg"></i> Ver documento PDF</span>
                  <i className="bi bi-box-arrow-up-right group-hover:scale-110 transition-transform"></i>
                </a>
              </div>

              {/* Motivo rechazo */}
              {selected.rejectReason && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mb-8">
                  <p className="text-destructive text-[10px] font-black uppercase tracking-widest mb-1.5 flex items-center gap-1">
                    <i className="bi bi-exclamation-triangle-fill"></i> Motivo de rechazo
                  </p>
                  <p className="text-foreground text-sm font-medium leading-relaxed">{selected.rejectReason}</p>
                </div>
              )}

              {/* Acciones */}
              {selected.status === 'PENDING' && (
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => handleApprove(selected.id)}
                    disabled={actionLoading}
                    className="w-full py-3.5 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {actionLoading ? <><i className="bi bi-arrow-repeat animate-spin"></i> Procesando...</> : <><i className="bi bi-check-lg text-lg"></i> Aprobar solicitud</>}
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={actionLoading}
                    className="w-full py-3.5 bg-destructive/10 text-destructive rounded-xl text-sm font-bold hover:bg-destructive/20 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    <i className="bi bi-x-lg text-lg"></i> Rechazar solicitud
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
                  className="w-full py-3.5 bg-muted text-foreground border border-border rounded-xl text-sm font-bold hover:bg-background transition-colors mt-4 flex items-center justify-center gap-2"
                >
                  <i className="bi bi-archive"></i> Archivar solicitud
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
                  className="w-full py-3.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-sm font-bold hover:bg-primary/20 transition-colors mt-4 flex items-center justify-center gap-2"
                >
                  <i className="bi bi-box-arrow-up"></i> Desarchivar solicitud
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modal rechazo */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-card border border-border rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 bg-destructive/10 text-destructive rounded-2xl flex items-center justify-center mb-5 text-2xl">
                <i className="bi bi-x-circle-fill"></i>
              </div>
              <h3 className="text-foreground text-xl font-bold mb-2 tracking-tight">
                Rechazar solicitud
              </h3>
              <p className="text-muted-foreground text-sm mb-6">
                Indica el motivo del rechazo. Esta información se enviará por correo electrónico al solicitante.
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explica brevemente el motivo del rechazo..."
                rows={4}
                className="w-full bg-background border border-input focus:border-destructive focus:ring-2 focus:ring-destructive/30 rounded-xl p-4 text-sm text-foreground outline-none resize-none mb-6 transition-all placeholder:text-muted-foreground"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowRejectModal(false); setRejectReason(''); }}
                  className="flex-1 py-3.5 bg-muted text-foreground rounded-xl text-sm font-bold hover:bg-border transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectReason.trim() || actionLoading}
                  className="flex-1 py-3.5 bg-destructive text-destructive-foreground rounded-xl text-sm font-bold hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? 'Procesando...' : 'Confirmar rechazo'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}