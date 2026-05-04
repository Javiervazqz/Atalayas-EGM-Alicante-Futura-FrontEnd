'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/ui/Sidebar';
import PageHeader from '@/components/ui/pageHeader';
import SearchInput from '@/components/ui/Searchbar';
import { API_ROUTES, fetchWithApiFallback } from '@/lib/utils';

interface Announcement {
  id: string;
  title: string;
  content: string;
  isPublic: boolean;
  createdAt: string;
  Company?: { id: string; name: string } | null;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const data = await fetchWithApiFallback(API_ROUTES.ANNOUNCEMENTS.GET_ALL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };


  const filteredAnnouncements = useMemo(() => {
    return announcements.filter(ann => 
      ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ann.Company?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [announcements, searchQuery]);

  return (
    <div className="flex h-screen bg-[#f5f5f7] dark:bg-[#0d0d0f] font-sans text-foreground overflow-hidden">
      <Sidebar role="EMPLOYEE" />

      <main className="flex-1 flex flex-col min-w-0 bg-white/40 dark:bg-transparent backdrop-blur-3xl">
        <PageHeader 
          title="Comunicados y Anuncios"
          description="Consulta información relevante de tu empresa o de Atalayas EGM."
          icon={<i className="bi bi-megaphone-fill"></i>}
          action={
            <div className="flex items-center gap-4">
              <SearchInput 
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Buscar por título o empresa..."
              />
            </div>
          }
        />

        <div className="flex-1 overflow-y-auto p-6 lg:p-10 no-scrollbar">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Contenedor de Tabla con Estética Apple */}
            <div className="bg-white dark:bg-[#1c1c1e] rounded-[2.5rem] border border-gray-200/50 dark:border-white/6 shadow-[0_20px_50px_rgba(0,0,0,0.02)] overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-white/2 border-b border-gray-100 dark:border-white/4">
                    <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Contenido del Anuncio</th>
                    <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Alcance</th>
                    <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Publicado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-white/2">
                  {loading ? (
                    <LoadingSkeleton />
                  ) : filteredAnnouncements.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-24 text-center">
                        <div className="flex flex-col items-center opacity-40">
                          <i className="bi bi-chat-square-dots text-4xl mb-4"></i>
                          <p className="text-sm font-medium">No se han encontrado comunicados.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAnnouncements.map((ann) => (
                      <tr key={ann.id} className="group hover:bg-gray-50/80 dark:hover:bg-white/1 transition-all duration-300">
                        <td className="px-8 py-5">
                          <div className="max-w-md">
                            <h4 className="font-bold text-[15px] text-foreground/90 tracking-tight group-hover:text-primary transition-colors">
                              {ann.title}
                            </h4>
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5 font-medium">
                              {ann.content}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          {ann.isPublic ? (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-tighter">
                              <span className="w-1 h-1 rounded-full bg-current animate-pulse"></span>
                              Global
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-black uppercase tracking-tighter">
                              <i className="bi bi-building text-[8px]"></i>
                              {ann.Company?.name || 'Privado'}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-[11px] font-bold text-muted-foreground/60">
                            {new Date(ann.createdAt).toLocaleDateString('es-ES', { 
                              day: '2-digit', 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Contador de Estado */}
            {!loading && (
              <p className="px-4 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">
                Mostrando {filteredAnnouncements.length} de {announcements.length} comunicados registrados
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <>
      {[1, 2, 3, 4].map(i => (
        <tr key={i} className="animate-pulse">
          <td className="px-8 py-6">
            <div className="h-4 bg-gray-200 dark:bg-white/5 rounded w-48 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-white/5 rounded w-64 opacity-50"></div>
          </td>
          <td className="px-6 py-6"><div className="h-6 bg-gray-200 dark:bg-white/5 rounded-full w-16"></div></td>
          <td className="px-6 py-6"><div className="h-3 bg-gray-200 dark:bg-white/5 rounded w-20"></div></td>
          <td className="px-8 py-6 text-right"><div className="h-9 bg-gray-200 dark:bg-white/5 rounded-xl w-9 ml-auto"></div></td>
        </tr>
      ))}
    </>
  );
}