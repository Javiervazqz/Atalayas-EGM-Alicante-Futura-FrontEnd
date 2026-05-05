'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/ui/Sidebar';
import PageHeader from '@/components/ui/pageHeader';
import { API_ROUTES } from '@/lib/utils';

interface Announcement {
  id: string;
  title: string;
  content: string;
  isPublic: boolean;
  createdAt: string;
  Company?: { id: string; name: string } | null;
}

const getToken = () =>
  typeof window !== 'undefined' ? localStorage.getItem('token') : '';

export default function AnnouncementsPage() {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  const showToast = (msg: string, type: 'ok' | 'err') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) setCurrentUser(JSON.parse(saved));

    const fetchAnnouncements = async () => {
      try {
        const res = await fetch(API_ROUTES.ANNOUNCEMENTS.GET_ALL, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const data = await res.json();
        setAnnouncements(Array.isArray(data) ? data : []);
      } catch {
        showToast('Error cargando anuncios', 'err');
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Seguro que quieres eliminar este anuncio?')) return;
    setDeleting(id);
    try {
      const res = await fetch(API_ROUTES.ANNOUNCEMENTS.DELETE(id), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        setAnnouncements((prev) => prev.filter((a) => a.id !== id));
        showToast('Anuncio eliminado', 'ok');
      } else {
        showToast('No se pudo eliminar', 'err');
      }
    } catch {
      showToast('Error de conexión', 'err');
    } finally {
      setDeleting(null);
    }
  };

  const role = currentUser?.role ?? 'GENERAL_ADMIN';

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar role={role} />

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-medium shadow-xl text-white ${toast.type === 'ok' ? 'bg-green-600' : 'bg-red-600'}`}>
          <i className={`bi ${toast.type === 'ok' ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}`} />
          {toast.msg}
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-screen overflow-auto">
        <PageHeader
          title="Anuncios"
          description="Gestiona los anuncios de la plataforma"
          icon={<i className="bi bi-megaphone-fill" />}
          action={
            <Link
              href="/dashboard/administrator/general-admin/announcements/new"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-sm font-semibold transition-all"
            >
              <i className="bi bi-plus-lg" />
              Nuevo anuncio
            </Link>
          }
        />

        <main className="flex-1 p-6 lg:p-10">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-40 bg-[var(--card)] rounded-2xl animate-pulse border border-[var(--border)]" />
              ))}
            </div>
          ) : announcements.length === 0 ? (
            <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-16 text-center">
              <i className="bi bi-megaphone text-4xl text-[var(--muted-foreground)] block mb-3" />
              <p className="text-[var(--muted-foreground)] text-sm">No hay anuncios todavía</p>
              <Link
                href="/dashboard/administrator/general-admin/announcements/new"
                className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold hover:opacity-90 transition-all"
              >
                <i className="bi bi-plus-lg" />
                Crear primer anuncio
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 hover:shadow-md transition-all group flex flex-col"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="font-bold text-[var(--foreground)] text-sm leading-snug flex-1">
                      {ann.title}
                    </h3>
                    <span className={`text-[9px] uppercase font-bold px-2 py-1 rounded-full shrink-0 ${ann.isPublic ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-[var(--muted)] text-[var(--muted-foreground)]'}`}>
                      {ann.isPublic ? 'Público' : 'Privado'}
                    </span>
                  </div>

                  <p className="text-[var(--muted-foreground)] text-xs leading-relaxed flex-1 line-clamp-3 mb-4">
                    {ann.content}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                    <div>
                      {ann.Company && (
                        <p className="text-[10px] text-[var(--muted-foreground)] font-medium">
                          {ann.Company.name}
                        </p>
                      )}
                      <p className="text-[10px] text-[var(--muted-foreground)]">
                        {new Date(ann.createdAt).toLocaleDateString('es-ES', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(ann.id)}
                      disabled={deleting === ann.id}
                      className="opacity-0 group-hover:opacity-100 text-xs font-medium px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all disabled:opacity-30"
                    >
                      {deleting === ann.id ? '...' : 'Eliminar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
